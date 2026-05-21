import 'dotenv/config';

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';

@Module({
	imports: [
		PrismaModule,
		JwtModule.register({
			secret: process.env.JWT_SECRET,
			signOptions: {
				expiresIn: '7d',
			},
		}),
	],
	controllers: [AuthController],
	providers: [AuthService, JwtAuthGuard, RolesGuard],
	exports: [AuthService, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
