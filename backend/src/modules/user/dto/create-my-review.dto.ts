import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMyReviewDto {
  @ApiProperty({ example: 9 })
  @IsInt()
  @Min(0)
  @Max(10)
  rating!: number;

  @ApiPropertyOptional({ example: 'A great story and tight combat.' })
  @IsOptional()
  @IsString()
  comment?: string;
}
