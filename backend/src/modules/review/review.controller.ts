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
	UseGuards,
} from '@nestjs/common';

import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewService } from './review.service';
import { Roles } from '../../decorators/roles.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewController {
	constructor(private readonly reviewService: ReviewService) {}

	@Post()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('ADMIN')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Create a review (admin)' })
	create(@Body() createReviewDto: CreateReviewDto) {
		return this.reviewService.create(createReviewDto);
	}

	@Get('game/:gameId/paged')
	@ApiOperation({ summary: 'List reviews for a game with pagination' })
	@ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
	@ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
	findAllByGamePaged(
		@Param('gameId') gameId: string,
		@Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
		@Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
	) {
		return this.reviewService.findAllByGamePaged(gameId, page, pageSize);
	}

	@Get('game/:gameId/average')
	@ApiOperation({ summary: 'Get average rating for a game' })
	getGameAverage(@Param('gameId') gameId: string) {
		return this.reviewService.getGameAverage(gameId);
	}

	@Get('game/:gameId/count')
	@ApiOperation({ summary: 'Get review count for a game' })
	getGameReviewCount(@Param('gameId') gameId: string) {
		return this.reviewService.getGameReviewCount(gameId);
	}

	@Get('game/:gameId')
	@ApiOperation({ summary: 'List reviews for a game' })
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
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('ADMIN')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'List reviews for a user (admin)' })
	findAllByUser(@Param('userId') userId: string) {
		return this.reviewService.findAllByUser(userId);
	}

	@Get(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('ADMIN')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get review by id (admin)' })
	findById(@Param('id') id: string) {
		return this.reviewService.findById(id);
	}

	@Patch(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('ADMIN')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Update review by id (admin)' })
	update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
		return this.reviewService.update(id, updateReviewDto);
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('ADMIN')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Delete review by id (admin)' })
	delete(@Param('id') id: string) {
		return this.reviewService.delete(id);
	}
}