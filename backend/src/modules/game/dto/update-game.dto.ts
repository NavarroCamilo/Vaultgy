import { IsDateString, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateGameDto } from './create-game.dto';

export class UpdateGameDto implements Partial<CreateGameDto> {
  @ApiPropertyOptional({ example: 'Hades' })
  @IsString()
  @IsOptional()
  title?: string;

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
