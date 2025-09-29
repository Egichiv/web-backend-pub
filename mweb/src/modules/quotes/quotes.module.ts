import { Module } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { QuotesController } from './quotes.controller';
import { DatabaseModule } from '../../database/database.module';
import { QuotesApiController } from './quotes-api.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [QuotesController, QuotesApiController,],
  providers: [QuotesService],
  exports: [QuotesService],
})
export class QuotesModule {}