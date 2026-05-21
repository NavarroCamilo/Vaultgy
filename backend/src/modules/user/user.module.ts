import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { WishlistModule } from '../wishlist/wishlist.module';
import { LibraryModule } from '../library/library.module';
import { ReviewModule } from '../review/review.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';


@Module({
    imports: [AuthModule, WishlistModule, LibraryModule, ReviewModule],
    controllers: [UserController],
    providers: [UserService],

})
export class UserModule {}