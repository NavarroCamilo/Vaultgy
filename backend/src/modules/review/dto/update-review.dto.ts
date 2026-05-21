import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateReviewDto {
	@ApiPropertyOptional({ example: 9 })
	@IsOptional()
	@IsInt()
	@Min(0)
	@Max(10)
	rating?: number;

	@ApiPropertyOptional({ example: 'Updated thoughts about the game.' })
	@IsOptional()
	@IsString()
	comment?: string;
}