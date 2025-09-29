import { Module } from '@nestjs/common';
import { MemesService } from './memes.service';
import { MemesController } from './memes.controller';
import { DatabaseModule } from '../../database/database.module';
import { MemesApiController } from './memes-api.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [MemesController, MemesApiController,],
  providers: [MemesService],
  exports: [MemesService],
})
export class MemesModule {}