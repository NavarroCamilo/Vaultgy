import 'dotenv/config';

import {
	BadRequestException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';
import { compare, hash } from 'bcryptjs';
import type { Request } from 'express';

import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

type PublicUser = Pick<User, 'id' | 'username' | 'email' | 'role'>;
type AuthenticatedRequest = Request & { user?: PublicUser };

@Injectable()
export class AuthService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly jwtService: JwtService,
	) {}

	private readonly publicUserSelect = {
		id: true,
		username: true,
		email: true,
		role: true,
	} as const;

	private toPublicUser(user: User): PublicUser {
		return {
			id: user.id,
			username: user.username,
			email: user.email,
			role: user.role,
		};
	}

	async validateUser(email: string, password: string) {
		const user = await this.prisma.user.findUnique({
			where: { email },
		});

		if (!user) {
			return null;
		}

		const passwordMatches = await compare(password, user.password);

		if (!passwordMatches) {
			return null;
		}

		return user;
	}

	async register(registerDto: RegisterDto) {
		const passwordHash = await hash(registerDto.password, 10);

		try {
			const user = await this.prisma.user.create({
				data: {
					username: registerDto.username,
					email: registerDto.email,
					password: passwordHash,
					role: 'USER',
				},
				select: this.publicUserSelect,
			});

			return user;
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
				throw new BadRequestException('Username or email already exists');
			}

			throw error;
		}
	}

	async login(loginDto: LoginDto) {
		const user = await this.validateUser(loginDto.email, loginDto.password);

		if (!user) {
			throw new UnauthorizedException('Invalid credentials');
		}

		const secret = process.env.JWT_SECRET;

		if (!secret) {
			throw new BadRequestException('JWT_SECRET is required');
		}

		const token = await this.jwtService.signAsync(
			{
				sub: user.id,
				email: user.email,
				role: user.role,
			},
			{ secret },
		);

		return {
			token,
			user: this.toPublicUser(user),
		};
	}

	async getProfile(request: AuthenticatedRequest) {
		const user = request.user as PublicUser | undefined;

		if (!user) {
			throw new UnauthorizedException('Authentication required');
		}

		return user;
	}

	async updatePassword(
		request: AuthenticatedRequest,
		updatePasswordDto: UpdatePasswordDto,
	) {
		const authUser = request.user as PublicUser | undefined;

		if (!authUser) {
			throw new UnauthorizedException('Authentication required');
		}

		const user = await this.prisma.user.findUnique({
			where: { id: authUser.id },
		});

		if (!user) {
			throw new UnauthorizedException('User not found');
		}

		const passwordMatches = await compare(
			updatePasswordDto.currentPassword,
			user.password,
		);

		if (!passwordMatches) {
			throw new UnauthorizedException('Invalid credentials');
		}

		const passwordHash = await hash(updatePasswordDto.newPassword, 10);

		await this.prisma.user.update({
			where: { id: user.id },
			data: { password: passwordHash },
		});

		return true;
	}
}
