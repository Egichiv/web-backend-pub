import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType({ description: 'Пользователь (краткая информация)' })
export class UserType {
  @Field(() => Int, { description: 'Уникальный идентификатор пользователя' })
  id: number;

  @Field({ description: 'Никнейм пользователя' })
  nickname: string;
}