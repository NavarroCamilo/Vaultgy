import { ConflictException, NotFoundException } from '@nestjs/common';
import { ReviewService } from './review.service';

describe('ReviewService (unit)', () => {
  const mockPrisma: any = {
    review: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
    },
    user: { findUnique: jest.fn() },
    game: { findUnique: jest.fn() },
    $transaction: jest.fn(),
  };

  let service: ReviewService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ReviewService(mockPrisma);
  });

  it('create throws ConflictException if review already exists', async () => {
    // ensure user and game exist so the conflict branch is reached
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1' });
    mockPrisma.game.findUnique.mockResolvedValue({ id: 'g1' });
    mockPrisma.review.findFirst.mockResolvedValue({ id: 'r1' });

    await expect(
      service.create({ userId: 'u1', gameId: 'g1', rating: 8, comment: 'ok' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('createForUser creates review when none exists', async () => {
    mockPrisma.review.findFirst.mockResolvedValue(null);
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1' });
    mockPrisma.game.findUnique.mockResolvedValue({ id: 'g1' });
    const created = {
      id: 'r2',
      rating: 9,
      comment: 'great',
      userId: 'u1',
      gameId: 'g1',
    };
    mockPrisma.review.create.mockResolvedValue(created);

    const result = await service.createForUser('u1', 'g1', {
      rating: 9,
      comment: 'great',
    });

    expect(result).toEqual(created);
    expect(mockPrisma.review.create).toHaveBeenCalled();
  });
});
