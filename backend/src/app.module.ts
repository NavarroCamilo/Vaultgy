import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {PrismaModule} from './modules/prisma/prisma.module';
import {GameModule} from './modules/game/game.module';
import {UserModule} from './modules/user/user.module';

@Module({
  imports: [PrismaModule, GameModule, UserModule], 
})
export class AppModule {}
