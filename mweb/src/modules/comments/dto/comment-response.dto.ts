import { ApiProperty } from '@nestjs/swagger';

class CommentUserDto {
  @ApiProperty({ description: 'ID пользователя', example: 1 })
  id: number;

  @ApiProperty({ description: 'Nickname пользователя', example: 'johnDoe' })
  nickname: string;
}

export class CommentResponseDto {
  @ApiProperty({ description: 'ID комментария', example: 1 })
  id: number;

  @ApiProperty({ description: 'Текст комментария', example: 'Отличный пост!' })
  text: string;

  @ApiProperty({ description: 'Дата создания комментария', example: '2024-01-16T10:30:00.000Z' })
  createdAt: string;

  @ApiProperty({ description: 'ID пользователя', example: 1 })
  userId: number;

  @ApiProperty({ description: 'Информация о пользователе', type: CommentUserDto })
  user: CommentUserDto;

  @ApiProperty({ description: 'Имя автора', example: 'johnDoe' })
  authorName: string;

  constructor(comment: any) {
    this.id = comment.id;
    this.text = comment.text;
    this.createdAt = comment.createdAt.toISOString();
    this.userId = comment.userId;
    this.user = {
      id: comment.user.id,
      nickname: comment.user.nickname,
    };
    this.authorName = comment.user.nickname;
  }
}