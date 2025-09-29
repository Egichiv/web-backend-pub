import { ObjectType, Field, ID } from '@nestjs/graphql';
import { UserType } from '../../../common/graphql/user.types';

@ObjectType({ description: 'Комментарий' })
export class CommentType {
  @Field(() => ID, { description: 'Уникальный идентификатор комментария' })
  id: number;

  @Field({ description: 'Текст комментария' })
  text: string;

  @Field(() => ID, { description: 'ID пользователя, оставившего комментарий' })
  userId: number;

  @Field(() => UserType, { description: 'Информация о пользователе, оставившем комментарий' })
  user: UserType;

  @Field({ description: 'Дата создания комментария' })
  createdAt: Date;

  // Вычисляемые поля
  @Field({ description: 'Форматированная дата создания' })
  formattedCreatedAt: string;

  @Field({ description: 'Имя автора комментария' })
  authorName: string;

  @Field({ description: 'Был ли комментарий создан недавно (в течение часа)' })
  isRecent: boolean;

  @Field({ description: 'Валиден ли текст комментария' })
  isValidText: boolean;
}