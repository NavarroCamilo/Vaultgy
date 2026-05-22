import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangeRoleDto } from './dto/change-role.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  private async updateUserRecord(
    id: string,
    updateUserDto: UpdateUserDto,
    select?: Prisma.UserSelect,
  ) {
    return this.prisma.user.update({
      where: { id },
      data: {
        username: updateUserDto.username ?? undefined,
        email: updateUserDto.email ?? undefined,
      },
      ...(select ? { select } : {}),
    });
  }

  async findAll(take?: number) {
    return this.prisma.user.findMany({
      ...(take ? { take } : {}),
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByName(name: string) {
    const user = await this.prisma.user.findMany({
      where: {
        username: {
          contains: name,
          mode: 'insensitive',
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (user.length === 0) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    try {
      return await this.updateUserRecord(id, updateUserDto);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Username or email already exists');
      }

      throw new NotFoundException('User not found');
    }
  }

  async updateMyProfile(id: string, updateUserDto: UpdateUserDto) {
    try {
      return await this.updateUserRecord(id, updateUserDto, {
        id: true,
        username: true,
        email: true,
        role: true,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Username or email already exists');
      }

      throw new NotFoundException('User not found');
    }
  }

  async deleteUser(id: string) {
    try {
      return await this.prisma.user.delete({
        where: { id },
      });
    } catch {
      throw new NotFoundException('User not found');
    }
  }

  async changeRole(id: string, changeRoleDto: ChangeRoleDto) {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: {
          role: changeRoleDto.role,
        },
      });
    } catch {
      throw new NotFoundException('User not found');
    }
  }
}
