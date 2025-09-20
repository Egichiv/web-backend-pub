import { Module } from '@nestjs/common';
import { MemesService } from './memes.service';
import { MemesController } from './memes.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [MemesController],
  providers: [MemesService],
  exports: [MemesService],
})
export class MemesModule {}