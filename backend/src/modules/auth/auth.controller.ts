import {
	Body,
	Controller,
	Get,
	HttpCode,
	Patch,
	Post,
	Req,
	Res,
	UseGuards,
} from '@nestjs/common';
import type { Request as ExpressRequest, Response } from 'express';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

type AuthenticatedRequest = ExpressRequest & {
	user?: {
		id: string;
		username: string;
		email: string;
		role: string;
	};
};

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
	@UseGuards(JwtAuthGuard)
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
	@UseGuards(JwtAuthGuard)
	getProfile(@Req() request: AuthenticatedRequest) {
		return this.authService.getProfile(request);
	}

	@Patch('password')
	@UseGuards(JwtAuthGuard)
	updatePassword(@Req() request: AuthenticatedRequest, @Body() updatePasswordDto: UpdatePasswordDto) {
		return this.authService.updatePassword(request, updatePasswordDto);
	}
}
