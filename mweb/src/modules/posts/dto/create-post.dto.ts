import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength, IsOptional } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    description: 'Заголовок поста',
    example: 'Добро пожаловать в наш блог!',
    minLength: 5,
    maxLength: 200
  })
  @IsString()
  @IsNotEmpty({ message: 'Заголовок не может быть пустым' })
  @MinLength(5, { message: 'Заголовок должен содержать не менее 5 символов' })
  @MaxLength(200, { message: 'Заголовок не может быть длиннее 200 символов' })
  heading: string;

  @ApiProperty({
    description: 'Текст поста',
    example: 'Это первый пост в нашем новом блоге. Здесь мы будем делиться интересными мыслями, цитатами и мемами.',
    minLength: 10,
    maxLength: 10000
  })
  @IsString()
  @IsNotEmpty({ message: 'Текст поста не может быть пустым' })
  @MinLength(10, { message: 'Текст поста должен содержать не менее 10 символов' })
  @MaxLength(10000, { message: 'Текст поста не может быть длиннее 10000 символов' })
  text: string;

  @ApiProperty({
    description: 'Nickname автора поста',
    example: 'admin',
    required: false,
    minLength: 2,
    maxLength: 50
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Nickname автора должен быть не менее 2 символов' })
  @MaxLength(50, { message: 'Nickname автора не может быть длиннее 50 символов' })
  author?: string;
}