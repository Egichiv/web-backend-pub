import { ApiProperty } from '@nestjs/swagger';

export class UserStatsResponseDto {
  @ApiProperty({ description: 'Количество комментариев', example: 15 })
  commentsCount: number;

  @ApiProperty({ description: 'Количество цитат', example: 8 })
  quotesCount: number;

  @ApiProperty({ description: 'Количество мемов', example: 12 })
  memesCount: number;

  @ApiProperty({ description: 'Количество постов', example: 5 })
  postsCount: number;

  @ApiProperty({ description: 'Общее количество контента', example: 40 })
  totalContent: number;

  constructor(stats: any) {
    this.commentsCount = stats.commentsCount || 0;
    this.quotesCount = stats.quotesCount || 0;
    this.memesCount = stats.memesCount || 0;
    this.postsCount = stats.postsCount || 0;
    this.totalContent = this.commentsCount + this.quotesCount + this.memesCount + this.postsCount;
  }
}