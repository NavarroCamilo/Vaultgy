import {
	Body,
	Controller,
	Delete,
	Get,
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
import { WaitlistService } from '../waitlist/waitlist.service';
import { LibraryService } from '../library/library.service';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangeRoleDto } from './dto/change-role.dto';

type AuthenticatedRequest = ExpressRequest & {
	user?: {
		id: string;
		username: string;
		email: string;
		role: string;
	};
};

@Controller('users')
export class UserController {
	constructor(
		private readonly userService: UserService,
		private readonly waitlistService: WaitlistService,
		private readonly libraryService: LibraryService,
	) {}

	@Get()
	findAll(@Query('take') take?: string) {
		const parsedTake = take === undefined ? undefined : Number.parseInt(take, 10);

		return this.userService.findAll(
			Number.isNaN(parsedTake) ? undefined : parsedTake,
		);
	}

	@Get('paged')
	findAllPaged(
		@Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
		@Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
	) {
		return this.userService.findAllPaged(page, pageSize);
	}

	@Get('search')
	findByName(@Query('name') name: string) {
		return this.userService.findByName(name);
	}

	@Get('search/:name')
	findByNamePath(@Param('name') name: string) {
		return this.userService.findByName(name);
	}

	@Get(':id')
	findById(@Param('id') id: string) {
		return this.userService.findById(id);
	}

	@Patch(':id')
	updateUser(
		@Param('id') id: string,
		@Body() updateUserDto: UpdateUserDto,
	) {
		return this.userService.updateUser(id, updateUserDto);
	}

	@Delete(':id')
	deleteUser(@Param('id') id: string) {
		return this.userService.deleteUser(id);
	}

	@Patch(':id/role')
	changeRole(@Param('id') id: string, @Body() changeRoleDto: ChangeRoleDto) {
		return this.userService.changeRole(id, changeRoleDto);
	}

	@Post('me/waitlist/:gameId')
	@UseGuards(JwtAuthGuard)
	addMyGameToWaitlist(
		@Req() request: AuthenticatedRequest,
		@Param('gameId') gameId: string,
	) {
		return this.waitlistService.addToWaitlist(request.user!.id, gameId);
	}

	@Delete('me/waitlist/:gameId')
	@UseGuards(JwtAuthGuard)
	removeMyGameFromWaitlist(
		@Req() request: AuthenticatedRequest,
		@Param('gameId') gameId: string,
	) {
		return this.waitlistService.removeFromWaitlist(request.user!.id, gameId);
	}

	@Get('me/waitlist/:gameId')
	@UseGuards(JwtAuthGuard)
	isGameInMyWaitlist(
		@Req() request: AuthenticatedRequest,
		@Param('gameId') gameId: string,
	) {
		return this.waitlistService.isInWaitlist(request.user!.id, gameId);
	}

	@Get('me/waitlist')
	@UseGuards(JwtAuthGuard)
	getMyWaitlist(@Req() request: AuthenticatedRequest) {
		return this.waitlistService.getUserWaitlist(request.user!.id);
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
}