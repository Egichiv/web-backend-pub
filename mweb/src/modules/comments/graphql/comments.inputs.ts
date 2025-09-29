import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

@InputType({ description: 'Входные данные для создания комментария' })
export class CreateCommentInput {
  @Field({ description: 'Текст комментария' })
  @IsString({ message: 'Текст комментария должен быть строкой' })
  @IsNotEmpty({ message: 'Текст комментария не может быть пустым' })
  @MaxLength(1000, { message: 'Текст комментария не может превышать 1000 символов' })
  text: string;

  @Field({ description: 'Имя автора комментария (nickname пользователя)' })
  @IsString({ message: 'Имя автора должно быть строкой' })
  @IsNotEmpty({ message: 'Имя автора не может быть пустым' })
  author: string;
}

@InputType({ description: 'Входные данные для обновления комментария' })
export class UpdateCommentInput {
  @Field({ nullable: true, description: 'Текст комментария' })
  @IsString({ message: 'Текст комментария должен быть строкой' })
  @MaxLength(1000, { message: 'Текст комментария не может превышать 1000 символов' })
  @IsOptional()
  text?: string;
}