import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { WaitlistModule } from '../waitlist/waitlist.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';


@Module({
    imports: [AuthModule, WaitlistModule],
    controllers: [UserController],
    providers: [UserService],

})
export class UserModule {}