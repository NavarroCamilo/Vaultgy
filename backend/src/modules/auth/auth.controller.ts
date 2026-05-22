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
import { Role } from '@prisma/client';
import type { Request as ExpressRequest, Response } from 'express';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

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
    role: Role;
  };
};

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login and set auth cookie' })
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
  @ApiCookieAuth('auth_token')
  @ApiOperation({ summary: 'Logout current user' })
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
  @ApiCookieAuth('auth_token')
  @ApiOperation({ summary: 'Get current profile' })
  getProfile(@Req() request: AuthenticatedRequest) {
    return this.authService.getProfile(request);
  }

  @Patch('password')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('auth_token')
  @ApiOperation({ summary: 'Update current password' })
  updatePassword(
    @Req() request: AuthenticatedRequest,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return this.authService.updatePassword(request, updatePasswordDto);
  }
}
