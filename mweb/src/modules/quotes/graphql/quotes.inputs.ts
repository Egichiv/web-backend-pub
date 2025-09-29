import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, MaxLength, IsEnum, IsNumber } from 'class-validator';
import { Genre } from '@prisma/client';

@InputType({ description: 'Входные данные для создания цитаты' })
export class CreateQuoteInput {
  @Field({ description: 'Автор цитаты' })
  @IsString({ message: 'Автор должен быть строкой' })
  @IsNotEmpty({ message: 'Автор не может быть пустым' })
  author: string;

  @Field({ description: 'Текст цитаты' })
  @IsString({ message: 'Текст цитаты должен быть строкой' })
  @IsNotEmpty({ message: 'Текст цитаты не может быть пустым' })
  @MaxLength(2000, { message: 'Текст цитаты не может превышать 2000 символов' })
  text: string;

  @Field(() => Genre, { description: 'Жанр цитаты' })
  @IsEnum(Genre, { message: 'Недопустимый жанр' })
  genre: Genre;

  @Field({ nullable: true, description: 'Имя пользователя, загрузившего цитату' })
  @IsString({ message: 'Имя загрузившего должно быть строкой' })
  @IsOptional()
  uploader?: string;
}

@InputType({ description: 'Входные данные для обновления цитаты' })
export class UpdateQuoteInput {
  @Field({ nullable: true, description: 'Автор цитаты' })
  @IsString({ message: 'Автор должен быть строкой' })
  @IsOptional()
  author?: string;

  @Field({ nullable: true, description: 'Текст цитаты' })
  @IsString({ message: 'Текст цитаты должен быть строкой' })
  @MaxLength(2000, { message: 'Текст цитаты не может превышать 2000 символов' })
  @IsOptional()
  text?: string;

  @Field(() => Genre, { nullable: true, description: 'Жанр цитаты' })
  @IsEnum(Genre, { message: 'Недопустимый жанр' })
  @IsOptional()
  genre?: Genre;
}

@InputType({ description: 'Входные данные для фильтрации цитат' })
export class QuoteFiltersInput {
  @Field(() => Genre, { nullable: true, description: 'Фильтр по жанру' })
  @IsEnum(Genre, { message: 'Недопустимый жанр' })
  @IsOptional()
  genre?: Genre;

  @Field({ nullable: true, description: 'Фильтр по автору' })
  @IsString({ message: 'Автор должен быть строкой' })
  @IsOptional()
  author?: string;

  @Field({ nullable: true, description: 'Поисковый запрос (по автору или тексту)' })
  @IsString({ message: 'Поисковый запрос должен быть строкой' })
  @IsOptional()
  search?: string;

  @Field(() => Int, { nullable: true, description: 'Фильтр по ID пользователя' })
  @IsNumber({}, { message: 'ID пользователя должен быть числом' })
  @IsOptional()
  userId?: number;
}