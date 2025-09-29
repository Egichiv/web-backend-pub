import { ApiProperty } from '@nestjs/swagger';

class PostUserDto {
  @ApiProperty({ description: 'ID пользователя', example: 1 })
  id: number;

  @ApiProperty({ description: 'Nickname пользователя', example: 'admin' })
  nickname: string;
}

export class PostResponseDto {
  @ApiProperty({ description: 'ID поста', example: 1 })
  id: number;

  @ApiProperty({ description: 'Заголовок поста', example: 'Добро пожаловать в наш блог!' })
  heading: string;

  @ApiProperty({ description: 'Текст поста', example: 'Это первый пост в нашем новом блоге...' })
  text: string;

  @ApiProperty({ description: 'ID пользователя', example: 1 })
  userId: number;

  @ApiProperty({ description: 'Информация о пользователе', type: PostUserDto })
  user: PostUserDto;

  @ApiProperty({ description: 'Имя автора', example: 'admin' })
  authorName: string;

  @ApiProperty({ description: 'Количество слов в посте', example: 42 })
  wordCount: number;

  @ApiProperty({ description: 'Предпросмотр текста', example: 'Это первый пост в нашем новом блоге. Здесь мы будем...' })
  preview: string;

  @ApiProperty({ description: 'Приблизительное время чтения', example: '2 минуты' })
  estimatedReadTime: string;

  @ApiProperty({ description: 'Является ли пост длинным (более 500 слов)', example: false })
  isLongPost: boolean;

  constructor(post: any, previewLength: number = 200) {
    this.id = post.id;
    this.heading = post.heading;
    this.text = post.text;
    this.userId = post.userId;
    this.user = {
      id: post.user.id,
      nickname: post.user.nickname,
    };
    this.authorName = post.user.nickname;

    // Вычисляемые поля
    this.wordCount = post.text.trim().split(/\s+/).length;
    this.preview = post.text.length > previewLength
      ? post.text.substring(0, previewLength) + '...'
      : post.text;

    const readingTimeMinutes = Math.ceil(this.wordCount / 200); // ~200 слов в минуту
    this.estimatedReadTime = readingTimeMinutes === 1
      ? '1 минута'
      : `${readingTimeMinutes} минут${readingTimeMinutes < 5 ? 'ы' : ''}`;

    this.isLongPost = this.wordCount > 500;
  }
}