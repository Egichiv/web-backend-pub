import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { DatabaseModule } from '../../database/database.module';
import { CommentsApiController } from './comments-api.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [CommentsController, CommentsApiController,],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}