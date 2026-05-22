import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGameDto {
  @ApiProperty({ example: 'Hades' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  title!: string;

  @ApiPropertyOptional({ example: 'Roguelike action game with fast combat.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/cover.png' })
  @IsString()
  @IsOptional()
  coverImage?: string;

  @ApiPropertyOptional({ example: '2020-09-17' })
  @IsDateString()
  @IsOptional()
  releaseDate?: string;

  @ApiPropertyOptional({ example: 'Action' })
  @IsString()
  @IsOptional()
  genre?: string;
}
