import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Query,
	DefaultValuePipe,
	ParseIntPipe,
} from '@nestjs/common';

import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangeRoleDto } from './dto/change-role.dto';

@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

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
}