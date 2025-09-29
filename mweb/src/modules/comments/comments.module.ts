import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { DatabaseModule } from '../../database/database.module';
import { CommentsApiController } from './comments-api.controller';
import { CommentsResolver } from './graphql/comments.resolver';

@Module({
  imports: [DatabaseModule],
  controllers: [CommentsController, CommentsApiController,],
  providers: [CommentsService, CommentsResolver],
  exports: [CommentsService],
})
export class CommentsModule {}