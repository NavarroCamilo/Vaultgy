import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { Roles } from '../../decorators/roles.decorator';
import { RolesGuard } from '../../guards/roles.guard';
import { WishlistService } from './wishlist.service';

@Controller('wishlist')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiTags('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post(':userId/game/:gameId')
  @ApiCookieAuth('auth_token')
  @ApiOperation({ summary: 'Add a game to a user wishlist (admin)' })
  addToWishlist(
    @Param('userId') userId: string,
    @Param('gameId') gameId: string,
  ) {
    return this.wishlistService.addToWishlist(userId, gameId);
  }

  @Delete(':userId/game/:gameId')
  @ApiCookieAuth('auth_token')
  @ApiOperation({ summary: 'Remove a game from a user wishlist (admin)' })
  removeFromWishlist(
    @Param('userId') userId: string,
    @Param('gameId') gameId: string,
  ) {
    return this.wishlistService.removeFromWishlist(userId, gameId);
  }

  @Get(':userId/game/:gameId')
  @ApiCookieAuth('auth_token')
  @ApiOperation({ summary: 'Check if a game is in a user wishlist (admin)' })
  isInWishlist(
    @Param('userId') userId: string,
    @Param('gameId') gameId: string,
  ) {
    return this.wishlistService.isInWishlist(userId, gameId);
  }

  @Get(':userId')
  @ApiCookieAuth('auth_token')
  @ApiOperation({ summary: 'Get a user wishlist (admin)' })
  getUserWishlist(@Param('userId') userId: string) {
    return this.wishlistService.getUserWishlist(userId);
  }
}