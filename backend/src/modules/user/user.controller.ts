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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

type AuthenticatedRequest = ExpressRequest & {
	user?: {
		id: string;
		username: string;
		email: string;
		role: Role;
	};
};

@Controller('users')
@ApiTags('users')
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
	@ApiBearerAuth()
	@ApiOperation({ summary: 'List all users' })
	findAll(@Query('take') take?: string) {
		const parsedTake = take === undefined ? undefined : Number.parseInt(take, 10);

		return this.userService.findAll(
			Number.isNaN(parsedTake) ? undefined : parsedTake,
		);
	}

	@Get('search')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Search users by username' })
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
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Search users by username path' })
	findByUsernamePath(@Param('username') username: string) {
		return this.userService.findByName(username);
	}

	@Get(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('ADMIN')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get a user by id' })
	findById(@Param('id') id: string) {
		return this.userService.findById(id);
	}

	@Patch(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('ADMIN')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Update a user by id' })
	updateUser(
		@Param('id') id: string,
		@Body() updateUserDto: UpdateUserDto,
	) {
		return this.userService.updateUser(id, updateUserDto);
	}

	@Patch('me')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Update my profile' })
	updateMyProfile(
		@Req() request: AuthenticatedRequest,
		@Body() updateUserDto: UpdateUserDto,
	) {
		return this.userService.updateMyProfile(request.user!.id, updateUserDto);
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('ADMIN')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Delete a user by id' })
	deleteUser(@Param('id') id: string) {
		return this.userService.deleteUser(id);
	}

	@Patch(':id/role')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('ADMIN')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Change a user role' })
	changeRole(@Param('id') id: string, @Body() changeRoleDto: ChangeRoleDto) {
		return this.userService.changeRole(id, changeRoleDto);
	}

	@Post('me/wishlist/:gameId')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Add a game to my wishlist' })
	addMyGameToWishlist(
		@Req() request: AuthenticatedRequest,
		@Param('gameId') gameId: string,
	) {
		return this.wishlistService.addToWishlist(request.user!.id, gameId);
	}

	@Delete('me/wishlist/:gameId')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Remove a game from my wishlist' })
	removeMyGameFromWishlist(
		@Req() request: AuthenticatedRequest,
		@Param('gameId') gameId: string,
	) {
		return this.wishlistService.removeFromWishlist(request.user!.id, gameId);
	}

	@Get('me/wishlist/:gameId')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Check if a game is in my wishlist' })
	isGameInMyWishlist(
		@Req() request: AuthenticatedRequest,
		@Param('gameId') gameId: string,
	) {
		return this.wishlistService.isInWishlist(request.user!.id, gameId);
	}

	@Get('me/wishlist')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get my wishlist' })
	getMyWishlist(@Req() request: AuthenticatedRequest) {
		return this.wishlistService.getUserWishlist(request.user!.id);
	}

	@Post('me/library/:gameId')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Add a game to my library' })
	addMyGameToLibrary(
		@Req() request: AuthenticatedRequest,
		@Param('gameId') gameId: string,
	) {
		return this.libraryService.addToLibrary(request.user!.id, gameId);
	}

	@Delete('me/library/:gameId')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Remove a game from my library' })
	removeMyGameFromLibrary(
		@Req() request: AuthenticatedRequest,
		@Param('gameId') gameId: string,
	) {
		return this.libraryService.removeFromLibrary(request.user!.id, gameId);
	}

	@Get('me/library/:gameId')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Check if a game is in my library' })
	isGameInMyLibrary(
		@Req() request: AuthenticatedRequest,
		@Param('gameId') gameId: string,
	) {
		return this.libraryService.isInLibrary(request.user!.id, gameId);
	}

	@Get('me/library')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get my library' })
	getMyLibrary(@Req() request: AuthenticatedRequest) {
		return this.libraryService.getUserLibrary(request.user!.id);
	}

	@Post('me/reviews/:gameId')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Create my review for a game' })
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
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Update my review' })
	updateMyReview(
		@Req() request: AuthenticatedRequest,
		@Param('reviewId') reviewId: string,
		@Body() updateReviewDto: UpdateReviewDto,
	) {
		return this.reviewService.updateByUser(request.user!.id, reviewId, updateReviewDto);
	}

	@Delete('me/reviews/:reviewId')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Delete my review' })
	deleteMyReview(
		@Req() request: AuthenticatedRequest,
		@Param('reviewId') reviewId: string,
	) {
		return this.reviewService.deleteByUser(request.user!.id, reviewId);
	}
}