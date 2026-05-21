import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UserService } from './user.service';

describe('UserService (unit)', () => {
  const mockPrisma: any = {
    user: {
      update: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  let service: UserService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UserService(mockPrisma as any);
  });

  it('updateUser returns updated user on success', async () => {
    const updated = { id: 'u1', username: 'bob', email: 'bob@example.com' };
    mockPrisma.user.update.mockResolvedValue(updated);

    const result = await service.updateUser('u1', { username: 'bob' });

    expect(result).toEqual(updated);
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { username: 'bob', email: undefined },
    });
  });

  it('updateUser throws ConflictException when Prisma throws P2002', async () => {
    const err = new Error('Unique') as any;
    err.code = 'P2002';
    // make instanceof check pass
    Object.setPrototypeOf(err, Prisma.PrismaClientKnownRequestError.prototype);

    mockPrisma.user.update.mockRejectedValue(err);

    await expect(service.updateUser('u1', { username: 'taken' })).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
});
