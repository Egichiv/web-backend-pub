import { Module } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { QuotesController } from './quotes.controller';
import { DatabaseModule } from '../../database/database.module';
import { QuotesApiController } from './quotes-api.controller';
import { QuotesResolver } from './graphql/quotes.resolver';

@Module({
  imports: [DatabaseModule],
  controllers: [QuotesController, QuotesApiController,],
  providers: [QuotesService, QuotesResolver],
  exports: [QuotesService],
})
export class QuotesModule {}