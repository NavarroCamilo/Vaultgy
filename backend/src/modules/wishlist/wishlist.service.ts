import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WishlistService {
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

  async addToWishlist(userId: string, gameId: string) {
    await this.ensureUserExists(userId);
    await this.ensureGameExists(gameId);

    const inLibrary = await this.prisma.libraryItem.findFirst({
      where: { userId, gameId },
      select: { id: true },
    });

    if (inLibrary) {
      throw new ConflictException('Game is already in library');
    }

    const existing = await this.prisma.wishlistItem.findFirst({
      where: { userId, gameId },
    });

    if (existing) {
      throw new ConflictException('Game is already in wishlist');
    }

    return this.prisma.wishlistItem.create({
      data: {
        userId,
        gameId,
      },
    });
  }

  async removeFromWishlist(userId: string, gameId: string) {
    const wishlistItem = await this.prisma.wishlistItem.findFirst({
      where: { userId, gameId },
    });

    if (!wishlistItem) {
      throw new NotFoundException('Wishlist item not found');
    }

    return this.prisma.wishlistItem.delete({
      where: { id: wishlistItem.id },
    });
  }

  async getUserWishlist(userId: string) {
    await this.ensureUserExists(userId);

    return this.prisma.wishlistItem.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async isInWishlist(userId: string, gameId: string) {
    await this.ensureUserExists(userId);
    await this.ensureGameExists(gameId);

    const wishlistItem = await this.prisma.wishlistItem.findFirst({
      where: { userId, gameId },
      select: { id: true },
    });

    return Boolean(wishlistItem);
  }
}