import { Controller, Delete, Get, Param, Post } from '@nestjs/common';

import { LibraryService } from './library.service';

@Controller('library')
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Post(':userId/game/:gameId')
  addToLibrary(
    @Param('userId') userId: string,
    @Param('gameId') gameId: string,
  ) {
    return this.libraryService.addToLibrary(userId, gameId);
  }

  @Delete(':userId/game/:gameId')
  removeFromLibrary(
    @Param('userId') userId: string,
    @Param('gameId') gameId: string,
  ) {
    return this.libraryService.removeFromLibrary(userId, gameId);
  }

  @Get(':userId/game/:gameId')
  isInLibrary(
    @Param('userId') userId: string,
    @Param('gameId') gameId: string,
  ) {
    return this.libraryService.isInLibrary(userId, gameId);
  }

  @Get(':userId')
  getUserLibrary(@Param('userId') userId: string) {
    return this.libraryService.getUserLibrary(userId);
  }
}
