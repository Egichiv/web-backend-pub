import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength, IsInt, IsPositive } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Текст комментария',
    example: 'Отличный пост! Очень полезная информация.',
    minLength: 1,
    maxLength: 1000
  })
  @IsString()
  @IsNotEmpty({ message: 'Текст комментария не может быть пустым' })
  @MinLength(1, { message: 'Комментарий должен содержать хотя бы 1 символ' })
  @MaxLength(1000, { message: 'Комментарий не может быть длиннее 1000 символов' })
  text: string;

  @ApiProperty({
    description: 'Nickname автора комментария',
    example: 'johnDoe',
    minLength: 2,
    maxLength: 50
  })
  @IsString()
  @IsNotEmpty({ message: 'Автор комментария обязателен' })
  @MinLength(2, { message: 'Nickname автора должен быть не менее 2 символов' })
  @MaxLength(50, { message: 'Nickname автора не может быть длиннее 50 символов' })
  author: string;
}
