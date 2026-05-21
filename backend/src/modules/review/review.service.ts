import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewService {
	constructor(private readonly prisma: PrismaService) {}

	private async ensureUserExists(userId: string) {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: { id: true },
		});

		if (!user) {
			throw new NotFoundException('User not found');
		}
	}

	private async ensureGameExists(gameId: string) {
		const game = await this.prisma.game.findUnique({
			where: { id: gameId },
			select: { id: true },
		});

		if (!game) {
			throw new NotFoundException('Game not found');
		}
	}

	private async ensureReviewExists(id: string) {
		const review = await this.prisma.review.findUnique({
			where: { id },
		});

		if (!review) {
			throw new NotFoundException('Review not found');
		}

		return review;
	}

	private async ensureReviewBelongsToUser(id: string, userId: string) {
		const review = await this.prisma.review.findFirst({
			where: {
				id,
				userId,
			},
		});

		if (!review) {
			throw new NotFoundException('Review not found');
		}

		return review;
	}

	private async createReviewRecord(
		userId: string,
		gameId: string,
		createReviewDto: Pick<CreateReviewDto, 'rating' | 'comment'>,
	) {
		await this.ensureUserExists(userId);
		await this.ensureGameExists(gameId);

		const existingReview = await this.prisma.review.findFirst({
			where: {
				userId,
				gameId,
			},
		});

		if (existingReview) {
			throw new ConflictException('Review already exists for this user and game');
		}

		return this.prisma.review.create({
			data: {
				rating: createReviewDto.rating,
				comment: createReviewDto.comment ?? undefined,
				userId,
				gameId,
			},
		});
	}

	async create(createReviewDto: CreateReviewDto) {
		return this.createReviewRecord(createReviewDto.userId, createReviewDto.gameId, createReviewDto);
	}

	async createForUser(
		userId: string,
		gameId: string,
		createReviewDto: Omit<CreateReviewDto, 'userId' | 'gameId'>,
	) {
		return this.createReviewRecord(userId, gameId, createReviewDto);
	}

	async findById(id: string) {
		return this.ensureReviewExists(id);
	}

	async findAllByGame(gameId: string, take?: number) {
		await this.ensureGameExists(gameId);

		return this.prisma.review.findMany({
			where: { gameId },
			...(take ? { take } : {}),
			orderBy: {
				createdAt: 'desc',
			},
			include: {
				user: {
					select: {
						id: true,
						username: true,
					},
				},
			},
		});
	}

	async findAllByGamePaged(gameId: string, page = 1, pageSize = 10) {
		await this.ensureGameExists(gameId);

		if (page < 1) {
			throw new BadRequestException('Page must be >= 1');
		}

		if (pageSize < 1) {
			throw new BadRequestException('Page size must be >= 1');
		}

		const skip = (page - 1) * pageSize;
		const [reviews, total] = await this.prisma.$transaction([
			this.prisma.review.findMany({
				where: { gameId },
				skip,
				take: pageSize,
				orderBy: {
					createdAt: 'desc',
				},
				include: {
					user: {
						select: {
							id: true,
							username: true,
						},
					},
				},
			}),
			this.prisma.review.count({ where: { gameId } }),
		]);

		return {
			data: reviews,
			meta: {
				total,
				page,
				pageSize,
				totalPages: Math.ceil(total / pageSize),
			},
		};
	}

	async findAllByUser(userId: string) {
		await this.ensureUserExists(userId);

		return this.prisma.review.findMany({
			where: { userId },
			orderBy: {
				createdAt: 'desc',
			},
		});
	}

	async getGameAverage(gameId: string) {
		await this.ensureGameExists(gameId);

		const aggregate = await this.prisma.review.aggregate({
			where: { gameId },
			_avg: {
				rating: true,
			},
		});

		return {
			gameId,
			average: aggregate._avg.rating,
		};
	}

	async getGameReviewCount(gameId: string) {
		await this.ensureGameExists(gameId);

		const count = await this.prisma.review.count({
			where: { gameId },
		});

		return {
			gameId,
			count,
		};
	}

	async update(id: string, updateReviewDto: UpdateReviewDto) {
		await this.ensureReviewExists(id);

		if (updateReviewDto.rating === undefined && updateReviewDto.comment === undefined) {
			throw new BadRequestException('At least one field must be provided');
		}

		return this.prisma.review.update({
			where: { id },
			data: {
				rating: updateReviewDto.rating ?? undefined,
				comment: updateReviewDto.comment ?? undefined,
			},
		});
	}

	async updateByUser(userId: string, id: string, updateReviewDto: UpdateReviewDto) {
		await this.ensureReviewBelongsToUser(id, userId);

		if (updateReviewDto.rating === undefined && updateReviewDto.comment === undefined) {
			throw new BadRequestException('At least one field must be provided');
		}

		return this.prisma.review.update({
			where: { id },
			data: {
				rating: updateReviewDto.rating ?? undefined,
				comment: updateReviewDto.comment ?? undefined,
			},
		});
	}

	async delete(id: string) {
		await this.ensureReviewExists(id);

		return this.prisma.review.delete({
			where: { id },
		});
	}

	async deleteByUser(userId: string, id: string) {
		await this.ensureReviewBelongsToUser(id, userId);

		return this.prisma.review.delete({
			where: { id },
		});
	}
}