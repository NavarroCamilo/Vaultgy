import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';

@Injectable()
export class GameService {
    constructor(private readonly prisma: PrismaService) { }

    private readonly searchableColumns = new Set(['title', 'genre']);

    private parseDate(date?: string): Date | undefined {
        if (!date) return undefined;

        const parsed = new Date(date);

        if (Number.isNaN(parsed.getTime())) {
            throw new BadRequestException('Invalid releaseDate format');
        }

        return parsed;
    }

    async findAll(take?: number) {
        return this.prisma.game.findMany({
            ...(take ? { take } : {}),
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findAllPaged(page = 1, pageSize = 10) {
        if (page < 1) {
            throw new BadRequestException('Page must be >= 1');
        }

        const skip = (page - 1) * pageSize;
        const [games, total] = await this.prisma.$transaction([
            this.prisma.game.findMany({
                skip,
                take: pageSize,
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            this.prisma.game.count(),
        ]);

        return {
            data: games,
            meta: {
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize),
            },
        };
    }

    async findById(id: string) {
        const game = await this.prisma.game.findUnique({
            where: { id },
        });

        if (!game) {
            throw new NotFoundException('Game not found');
        }

        return game;
    }

    async searchByColumn(column: string, value: string) {
        const normalizedColumn = column.trim().toLowerCase();

        if (!this.searchableColumns.has(normalizedColumn)) {
            throw new BadRequestException('Search column must be title or genre');
        }

        const games = await this.prisma.game.findMany({
            where: {
                [normalizedColumn]: {
                    contains: value,
                    mode: 'insensitive',
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        if (!games.length) {
            throw new NotFoundException('No games found');
        }

        return games;
    }

    async searchPagedByColumn(column: string, value: string, page = 1, pageSize = 10) {
        const normalizedColumn = column.trim().toLowerCase();

        if (!this.searchableColumns.has(normalizedColumn)) {
            throw new BadRequestException('Search column must be title or genre');
        }

        if (page < 1) {
            throw new BadRequestException('Page must be >= 1');
        }

        const where = {
            [normalizedColumn]: {
                contains: value,
                mode: 'insensitive' as const,
            },
        };

        const skip = (page - 1) * pageSize;

        const [games, total] = await this.prisma.$transaction([
            this.prisma.game.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            this.prisma.game.count({ where }),
        ]);

        if (!games.length) {
            throw new NotFoundException('No games found');
        }

        return {
            data: games,
            meta: {
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize),
            },
        };
    }

    async create(createGameDto: CreateGameDto) {
        return this.prisma.game.create({
            data: {
                title: createGameDto.title,
                description: createGameDto.description ?? null,
                coverImage: createGameDto.coverImage ?? null,
                releaseDate: this.parseDate(createGameDto.releaseDate),
                genre: createGameDto.genre ?? null,
            },
        });
    }

    async update(id: string, updateGameDto: UpdateGameDto) {
        try {
            return await this.prisma.game.update({
                where: { id },
                data: {
                    title: updateGameDto.title ?? undefined,
                    description: updateGameDto.description ?? undefined,
                    coverImage: updateGameDto.coverImage ?? undefined,
                    releaseDate: this.parseDate(updateGameDto.releaseDate),
                    genre: updateGameDto.genre ?? undefined,
                },
            });
        } catch {
            throw new NotFoundException('Game not found');
        }
    }

    async delete(id: string) {
        try {
            return await this.prisma.game.delete({
                where: { id },
            });
        } catch {
            throw new NotFoundException('Game not found');
        }
    }
}