import { PartialType } from '@nestjs/mapped-types';
import { CreateQuoteDto } from './create-quote.dto';
import { Genre } from '@prisma/client';

export class UpdateQuoteDto extends PartialType(CreateQuoteDto) {
  author?: string;
  text?: string;
  genre?: Genre;
}