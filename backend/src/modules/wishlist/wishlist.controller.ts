import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { Roles } from '../../decorators/roles.decorator';
import { RolesGuard } from '../../guards/roles.guard';
import { WishlistService } from './wishlist.service';

@Controller('wishlist')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post(':userId/game/:gameId')
  addToWishlist(
    @Param('userId') userId: string,
    @Param('gameId') gameId: string,
  ) {
    return this.wishlistService.addToWishlist(userId, gameId);
  }

  @Delete(':userId/game/:gameId')
  removeFromWishlist(
    @Param('userId') userId: string,
    @Param('gameId') gameId: string,
  ) {
    return this.wishlistService.removeFromWishlist(userId, gameId);
  }

  @Get(':userId/game/:gameId')
  isInWishlist(
    @Param('userId') userId: string,
    @Param('gameId') gameId: string,
  ) {
    return this.wishlistService.isInWishlist(userId, gameId);
  }

  @Get(':userId')
  getUserWishlist(@Param('userId') userId: string) {
    return this.wishlistService.getUserWishlist(userId);
  }
}