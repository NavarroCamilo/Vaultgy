import { BadRequestException } from '@nestjs/common';
import { GameService } from './game.service';

describe('GameService (unit)', () => {
  const mockPrisma: any = {
    game: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  let service: GameService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new GameService(mockPrisma);
  });

  it('searchPagedByColumn throws on invalid column and returns paged result for valid column', async () => {
    await expect(
      service.searchPagedByColumn('invalid', 'x', 1, 10),
    ).rejects.toBeInstanceOf(BadRequestException);

    // valid path
    const games = [{ id: 'g1', title: 'T', genre: 'G' }];
    mockPrisma.game.findMany.mockResolvedValue(games);
    mockPrisma.game.count.mockResolvedValue(1);
    mockPrisma.$transaction.mockResolvedValue([games, 1]);

    const result = await service.searchPagedByColumn('title', 'T', 1, 10);

    expect(result.meta.total).toBe(1);
    expect(result.data).toEqual(games);
  });
});
