import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
	@ApiPropertyOptional({ example: 'alice' })
  @IsString()
  @IsOptional()
  @MinLength(1)
  username?: string;

	@ApiPropertyOptional({ example: 'alice@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;
}