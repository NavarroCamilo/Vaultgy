import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LibraryService {
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

  async addToLibrary(userId: string, gameId: string) {
    await this.ensureUserExists(userId);
    await this.ensureGameExists(gameId);

    const existing = await this.prisma.libraryItem.findFirst({
      where: { userId, gameId },
    });

    if (existing) {
      throw new ConflictException('Game is already in library');
    }

    // If the game exists in wishlist, remove it
    await this.prisma.wishlistItem.deleteMany({ where: { userId, gameId } });

    return this.prisma.libraryItem.create({
      data: {
        userId,
        gameId,
      },
    });
  }

  async removeFromLibrary(userId: string, gameId: string) {
    const libraryItem = await this.prisma.libraryItem.findFirst({
      where: { userId, gameId },
    });

    if (!libraryItem) {
      throw new NotFoundException('Library item not found');
    }

    return this.prisma.libraryItem.delete({ where: { id: libraryItem.id } });
  }

  async getUserLibrary(userId: string) {
    await this.ensureUserExists(userId);

    return this.prisma.libraryItem.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async isInLibrary(userId: string, gameId: string) {
    await this.ensureUserExists(userId);
    await this.ensureGameExists(gameId);

    const libraryItem = await this.prisma.libraryItem.findFirst({
      where: { userId, gameId },
      select: { id: true },
    });

    return Boolean(libraryItem);
  }
}
