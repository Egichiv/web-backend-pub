import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DatabaseModule } from '../../database/database.module';
import { UsersApiController } from './users-api.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController, UsersApiController,],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}