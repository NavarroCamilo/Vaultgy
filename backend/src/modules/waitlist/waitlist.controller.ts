import { Controller, Delete, Get, Param, Post } from '@nestjs/common';

import { WaitlistService } from './waitlist.service';

@Controller('waitlist')
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) {}

  @Post(':userId/game/:gameId')
  addToWaitlist(
    @Param('userId') userId: string,
    @Param('gameId') gameId: string,
  ) {
    return this.waitlistService.addToWaitlist(userId, gameId);
  }

  @Delete(':userId/game/:gameId')
  removeFromWaitlist(
    @Param('userId') userId: string,
    @Param('gameId') gameId: string,
  ) {
    return this.waitlistService.removeFromWaitlist(userId, gameId);
  }


  @Get(':userId/game/:gameId')
  isInWaitlist(
    @Param('userId') userId: string,
    @Param('gameId') gameId: string,
  ) {
    return this.waitlistService.isInWaitlist(userId, gameId);
  }

  @Get(':userId')
  getUserWaitlist(@Param('userId') userId: string) {
    return this.waitlistService.getUserWaitlist(userId);
  }
}