import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional, MinLength, MaxLength } from 'class-validator';
import { Genre } from '@prisma/client';

export class CreateQuoteDto {
  @ApiProperty({
    description: 'Автор цитаты',
    example: 'Альберт Эйнштейн',
    minLength: 2,
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty({ message: 'Автор цитаты не может быть пустым' })
  @MinLength(2, { message: 'Имя автора должно содержать не менее 2 символов' })
  @MaxLength(100, { message: 'Имя автора не может быть длиннее 100 символов' })
  author: string;

  @ApiProperty({
    description: 'Текст цитаты',
    example: 'Логика может привести вас от пункта А к пункту Б, а воображение — куда угодно.',
    minLength: 10,
    maxLength: 1000
  })
  @IsString()
  @IsNotEmpty({ message: 'Текст цитаты не может быть пустым' })
  @MinLength(10, { message: 'Текст цитаты должен содержать не менее 10 символов' })
  @MaxLength(1000, { message: 'Текст цитаты не может быть длиннее 1000 символов' })
  text: string;

  @ApiProperty({
    description: 'Жанр цитаты',
    enum: Genre,
    example: Genre.SMART,
    enumName: 'Genre'
  })
  @IsEnum(Genre, { message: 'Жанр должен быть одним из: SMART, MOTIVATING, REALISTIC, FUNNY' })
  @IsNotEmpty({ message: 'Жанр цитаты обязателен' })
  genre: Genre;

  @ApiProperty({
    description: 'Nickname загрузившего цитату пользователя',
    example: 'quotelover',
    required: false,
    minLength: 2,
    maxLength: 50
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Nickname должен быть не менее 2 символов' })
  @MaxLength(50, { message: 'Nickname не может быть длиннее 50 символов' })
  uploader?: string;
}