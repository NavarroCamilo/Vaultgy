import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateMyReviewDto {
	@IsInt()
	@Min(0)
	@Max(10)
	rating!: number;

	@IsOptional()
	@IsString()
	comment?: string;
}