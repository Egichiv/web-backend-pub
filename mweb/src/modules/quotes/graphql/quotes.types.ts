import { ObjectType, Field, Int, ID, registerEnumType } from '@nestjs/graphql';
import { UserType } from '../../../common/graphql/user.types';
import { Genre } from '@prisma/client';

registerEnumType(Genre, {
  name: 'Genre',
  description: 'Жанр цитаты',
});

@ObjectType({ description: 'Цитата' })
export class QuoteType {
  @Field(() => Int, { description: 'Уникальный идентификатор цитаты' })
  id: number;

  @Field({ description: 'Автор цитаты' })
  author: string;

  @Field({ description: 'Текст цитаты' })
  text: string;

  @Field(() => Genre, { description: 'Жанр цитаты' })
  genre: Genre;

  @Field(() => Int, { description: 'ID пользователя, загрузившего цитату' })
  userId: number;

  @Field(() => UserType, { description: 'Информация о пользователе, загрузившем цитату' })
  user: UserType;

  @Field({ description: 'Дата загрузки цитаты' })
  uploadedAt: Date;

  // Вычисляемые поля (будут реализованы через Field Resolvers)
  @Field({ description: 'Название жанра на русском языке' })
  genreName: string;

  @Field({ description: 'Форматированная дата загрузки' })
  formattedUploadedAt: string;

  @Field({ description: 'Имя загрузившего пользователя' })
  uploaderName: string;

  @Field({ description: 'Полное описание цитаты' })
  fullDescription: string;

  @Field({ description: 'Была ли цитата загружена недавно (в течение недели)' })
  isRecentlyUploaded: boolean;

  @Field({ description: 'Прошла ли цитата валидацию' })
  isValid: boolean;
}

@ObjectType({ description: 'Статистика по жанрам цитат' })
export class GenreStatsType {
  @Field(() => Genre, { description: 'Жанр' })
  genre: Genre;

  @Field(() => Int, { description: 'Количество цитат в этом жанре' })
  count: number;

  @Field({ description: 'Название жанра на русском языке' })
  genreName: string;
}