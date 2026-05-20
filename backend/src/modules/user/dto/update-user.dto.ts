import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @MinLength(1)
  username?: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}