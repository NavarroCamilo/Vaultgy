import {
	Body,
	Controller,
	Delete,
	Get,
	BadRequestException,
	Param,
	Patch,
	Post,
	Query,
	DefaultValuePipe,
	ParseIntPipe,
	Req,
	UseGuards,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';

import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { WishlistService } from '../wishlist/wishlist.service';
import { LibraryService } from '../library/library.service';
import { ReviewService } from '../review/review.service';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangeRoleDto } from './dto/change-role.dto';
import { UpdateReviewDto } from '../review/dto/update-review.dto';
import { CreateMyReviewDto } from './dto/create-my-review.dto';
import { Roles } from '../../decorators/roles.decorator';
import { RolesGuard } from '../../guards/roles.guard';
import { Role } from '@prisma/client';

type AuthenticatedRequest = ExpressRequest & {
	user?: {
		id: string;
		username: string;
		email: string;
		role: Role;
	};
};

@Controller('users')
export class UserController {
	constructor(
		private readonly userService: UserService,
		private readonly wishlistService: WishlistService,
		private readonly libraryService: LibraryService,
		private readonly reviewService: ReviewService,
	) {}

	@Get()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('ADMIN')
	findAll(@Query('take') take?: string) {
		const parsedTake = take === undefined ? undefined : Number.parseInt(take, 10);

		return this.userService.findAll(
			Number.isNaN(parsedTake) ? undefined : parsedTake,
		);
	}

	@Get('paged')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('ADMIN')
	findAllPaged(
		@Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
		@Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
	) {
		return this.userService.findAllPaged(page, pageSize);
	}

	@Get('search')
	@UseGuards(JwtAuthGuard)
	findByUsername(
		@Query('username') username?: string,
	) {
		if (!username || !username.trim()) {
			throw new BadRequestException('username is required');
		}

		return this.userService.findByName(username.trim());
	}

	@Get('search/:username')
	@UseGuards(JwtAuthGuard)
	findByUsernamePath(@Param('username') username: string) {
		return this.userService.findByName(username);
	}

	@Get(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('ADMIN')
	findById(@Param('id') id: string) {
		return this.userService.findById(id);
	}

	@Patch(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('ADMIN')
	updateUser(
		@Param('id') id: string,
		@Body() updateUserDto: UpdateUserDto,
	) {
		return this.userService.updateUser(id, updateUserDto);
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('ADMIN')
	deleteUser(@Param('id') id: string) {
		return this.userService.deleteUser(id);
	}

	@Patch(':id/role')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('ADMIN')
	changeRole(@Param('id') id: string, @Body() changeRoleDto: ChangeRoleDto) {
		return this.userService.changeRole(id, changeRoleDto);
	}

	@Post('me/wishlist/:gameId')
	@UseGuards(JwtAuthGuard)
	addMyGameToWishlist(
		@Req() request: AuthenticatedRequest,
		@Param('gameId') gameId: string,
	) {
		return this.wishlistService.addToWishlist(request.user!.id, gameId);
	}

	@Delete('me/wishlist/:gameId')
	@UseGuards(JwtAuthGuard)
	removeMyGameFromWishlist(
		@Req() request: AuthenticatedRequest,
		@Param('gameId') gameId: string,
	) {
		return this.wishlistService.removeFromWishlist(request.user!.id, gameId);
	}

	@Get('me/wishlist/:gameId')
	@UseGuards(JwtAuthGuard)
	isGameInMyWishlist(
		@Req() request: AuthenticatedRequest,
		@Param('gameId') gameId: string,
	) {
		return this.wishlistService.isInWishlist(request.user!.id, gameId);
	}

	@Get('me/wishlist')
	@UseGuards(JwtAuthGuard)
	getMyWishlist(@Req() request: AuthenticatedRequest) {
		return this.wishlistService.getUserWishlist(request.user!.id);
	}

	@Post('me/library/:gameId')
	@UseGuards(JwtAuthGuard)
	addMyGameToLibrary(
		@Req() request: AuthenticatedRequest,
		@Param('gameId') gameId: string,
	) {
		return this.libraryService.addToLibrary(request.user!.id, gameId);
	}

	@Delete('me/library/:gameId')
	@UseGuards(JwtAuthGuard)
	removeMyGameFromLibrary(
		@Req() request: AuthenticatedRequest,
		@Param('gameId') gameId: string,
	) {
		return this.libraryService.removeFromLibrary(request.user!.id, gameId);
	}

	@Get('me/library/:gameId')
	@UseGuards(JwtAuthGuard)
	isGameInMyLibrary(
		@Req() request: AuthenticatedRequest,
		@Param('gameId') gameId: string,
	) {
		return this.libraryService.isInLibrary(request.user!.id, gameId);
	}

	@Get('me/library')
	@UseGuards(JwtAuthGuard)
	getMyLibrary(@Req() request: AuthenticatedRequest) {
		return this.libraryService.getUserLibrary(request.user!.id);
	}

	@Post('me/reviews/:gameId')
	@UseGuards(JwtAuthGuard)
	async addMyReview(
		@Req() request: AuthenticatedRequest,
		@Param('gameId') gameId: string,
		@Body() createMyReviewDto: CreateMyReviewDto,
	) {
		const inLibrary = await this.libraryService.isInLibrary(request.user!.id, gameId);

		if (!inLibrary) {
			throw new BadRequestException('Game must be in library before creating a review');
		}

		return this.reviewService.createForUser(request.user!.id, gameId, createMyReviewDto);
	}

	@Patch('me/reviews/:reviewId')
	@UseGuards(JwtAuthGuard)
	updateMyReview(
		@Req() request: AuthenticatedRequest,
		@Param('reviewId') reviewId: string,
		@Body() updateReviewDto: UpdateReviewDto,
	) {
		return this.reviewService.updateByUser(request.user!.id, reviewId, updateReviewDto);
	}

	@Delete('me/reviews/:reviewId')
	@UseGuards(JwtAuthGuard)
	deleteMyReview(
		@Req() request: AuthenticatedRequest,
		@Param('reviewId') reviewId: string,
	) {
		return this.reviewService.deleteByUser(request.user!.id, reviewId);
	}
}