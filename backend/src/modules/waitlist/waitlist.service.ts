import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WaitlistService {
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

  async addToWaitlist(userId: string, gameId: string) {
    await this.ensureUserExists(userId);
    await this.ensureGameExists(gameId);

    const existing = await this.prisma.waitlistItem.findFirst({
      where: { userId, gameId },
    });

    if (existing) {
      throw new ConflictException('Game is already in waitlist');
    }

    return this.prisma.waitlistItem.create({
      data: {
        userId,
        gameId,
      },
    });
  }

  async removeFromWaitlist(userId: string, gameId: string) {
    const waitlistItem = await this.prisma.waitlistItem.findFirst({
      where: { userId, gameId },
    });

    if (!waitlistItem) {
      throw new NotFoundException('Waitlist item not found');
    }

    return this.prisma.waitlistItem.delete({
      where: { id: waitlistItem.id },
    });
  }

  async getUserWaitlist(userId: string) {
    await this.ensureUserExists(userId);

    return this.prisma.waitlistItem.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async isInWaitlist(userId: string, gameId: string) {
    await this.ensureUserExists(userId);
    await this.ensureGameExists(gameId);

    const waitlistItem = await this.prisma.waitlistItem.findFirst({
      where: { userId, gameId },
      select: { id: true },
    });

    return Boolean(waitlistItem);
  }

  async getUserWaitlistDetailed(userId: string) {
    await this.ensureUserExists(userId);

    return this.prisma.waitlistItem.findMany({
      where: { userId },
      include: {
        game: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}