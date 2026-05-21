import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {PrismaModule} from './modules/prisma/prisma.module';
import {GameModule} from './modules/game/game.module';
import {UserModule} from './modules/user/user.module';
import {AuthModule} from './modules/auth/auth.module';
import {WaitlistModule} from './modules/waitlist/waitlist.module';
import {LibraryModule} from './modules/library/library.module';

@Module({
  imports: [PrismaModule, GameModule, UserModule, AuthModule, WaitlistModule, LibraryModule], 
})
export class AppModule {}
