import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ example: 9 })
  @IsInt()
  @Min(0)
  @Max(10)
  rating: number;

  @ApiPropertyOptional({ example: 'Amazing game.' })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({ example: 'user-id' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 'game-id' })
  @IsString()
  gameId: string;
}
