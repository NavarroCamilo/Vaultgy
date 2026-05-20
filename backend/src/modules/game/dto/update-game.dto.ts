import { IsDateString, IsOptional, IsString } from 'class-validator';
import { CreateGameDto } from './create-game.dto';

export class UpdateGameDto implements Partial<CreateGameDto> {
	@IsString()
	@IsOptional()
	title?: string;

	@IsString()
	@IsOptional()
	description?: string;

	@IsString()
	@IsOptional()
	coverImage?: string;

	@IsDateString()
	@IsOptional()
	releaseDate?: string;

	@IsString()
	@IsOptional()
	genre?: string;
}