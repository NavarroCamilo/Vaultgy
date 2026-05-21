import {
	Body,
	Controller,
	Get,
	HttpCode,
	Patch,
	Post,
	Req,
	Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('register')
	register(@Body() registerDto: RegisterDto) {
		return this.authService.register(registerDto);
	}

	@Post('login')
	async login(
		@Body() loginDto: LoginDto,
		@Res({ passthrough: true }) response: Response,
	) {
		const { token, user } = await this.authService.login(loginDto);

		response.cookie('auth_token', token, {
			httpOnly: true,
			sameSite: 'lax',
			path: '/',
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});

		return user;
	}

	@Post('logout')
	@HttpCode(200)
	logout(@Res({ passthrough: true }) response: Response) {
		response.clearCookie('auth_token', {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
		});

		return true;
	}

	@Get('profile')
	getProfile(@Req() request: Request) {
		return this.authService.getProfile(request);
	}

	@Patch('password')
	updatePassword(@Req() request: Request, @Body() updatePasswordDto: UpdatePasswordDto) {
		return this.authService.updatePassword(request, updatePasswordDto);
	}
}
