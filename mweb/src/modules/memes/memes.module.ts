import { Module } from '@nestjs/common';
import { MemesService } from './memes.service';
import { MemesController } from './memes.controller';
import { DatabaseModule } from '../../database/database.module';
import { MemesApiController } from './memes-api.controller';
import { S3Module } from '../../s3/s3.module';

@Module({
  imports: [DatabaseModule, S3Module],
  controllers: [MemesController, MemesApiController,],
  providers: [MemesService],
  exports: [MemesService],
})
export class MemesModule {}