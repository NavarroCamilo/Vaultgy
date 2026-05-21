import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { LibraryService } from './library.service';
import { Roles } from '../../decorators/roles.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';

@Controller('library')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiTags('library')
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Post(':userId/game/:gameId')
  @ApiCookieAuth('auth_token')
  @ApiOperation({ summary: 'Add a game to a user library (admin)' })
  addToLibrary(
    @Param('userId') userId: string,
    @Param('gameId') gameId: string,
  ) {
    return this.libraryService.addToLibrary(userId, gameId);
  }

  @Delete(':userId/game/:gameId')
  @ApiCookieAuth('auth_token')
  @ApiOperation({ summary: 'Remove a game from a user library (admin)' })
  removeFromLibrary(
    @Param('userId') userId: string,
    @Param('gameId') gameId: string,
  ) {
    return this.libraryService.removeFromLibrary(userId, gameId);
  }

  @Get(':userId/game/:gameId')
  @ApiCookieAuth('auth_token')
  @ApiOperation({ summary: 'Check if a game is in a user library (admin)' })
  isInLibrary(
    @Param('userId') userId: string,
    @Param('gameId') gameId: string,
  ) {
    return this.libraryService.isInLibrary(userId, gameId);
  }

  @Get(':userId')
  @ApiCookieAuth('auth_token')
  @ApiOperation({ summary: 'Get a user library (admin)' })
  getUserLibrary(@Param('userId') userId: string) {
    return this.libraryService.getUserLibrary(userId);
  }
}
