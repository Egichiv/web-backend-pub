import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { DatabaseModule } from '../../database/database.module';
import { PostsApiController } from './posts-api.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [PostsController, PostsApiController,],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}