import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { GameModule } from './modules/game/game.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { LibraryModule } from './modules/library/library.module';
import { ReviewModule } from './modules/review/review.module';

@Module({
  imports: [
    PrismaModule,
    GameModule,
    UserModule,
    AuthModule,
    WishlistModule,
    LibraryModule,
    ReviewModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
