import { Genre } from '@prisma/client';

export class CreateQuoteDto {
  author: string;
  text: string;
  genre: Genre;
  uploader?: string;
}