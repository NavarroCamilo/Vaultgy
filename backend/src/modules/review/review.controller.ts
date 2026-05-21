import {
	Body,
	Controller,
	DefaultValuePipe,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Query,
} from '@nestjs/common';

import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewService } from './review.service';

@Controller('reviews')
export class ReviewController {
	constructor(private readonly reviewService: ReviewService) {}

	@Post()
	create(@Body() createReviewDto: CreateReviewDto) {
		return this.reviewService.create(createReviewDto);
	}

	@Get('game/:gameId/paged')
	findAllByGamePaged(
		@Param('gameId') gameId: string,
		@Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
		@Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
	) {
		return this.reviewService.findAllByGamePaged(gameId, page, pageSize);
	}

	@Get('game/:gameId/average')
	getGameAverage(@Param('gameId') gameId: string) {
		return this.reviewService.getGameAverage(gameId);
	}

	@Get('game/:gameId/count')
	getGameReviewCount(@Param('gameId') gameId: string) {
		return this.reviewService.getGameReviewCount(gameId);
	}

	@Get('game/:gameId')
	findAllByGame(
		@Param('gameId') gameId: string,
		@Query('take') take?: string,
	) {
		const parsedTake = take === undefined ? undefined : Number.parseInt(take, 10);

		return this.reviewService.findAllByGame(
			gameId,
			Number.isNaN(parsedTake) ? undefined : parsedTake,
		);
	}

	@Get('user/:userId')
	findAllByUser(@Param('userId') userId: string) {
		return this.reviewService.findAllByUser(userId);
	}

	@Get(':id')
	findById(@Param('id') id: string) {
		return this.reviewService.findById(id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
		return this.reviewService.update(id, updateReviewDto);
	}

	@Delete(':id')
	delete(@Param('id') id: string) {
		return this.reviewService.delete(id);
	}
}