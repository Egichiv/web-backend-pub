import { ApiProperty } from '@nestjs/swagger';

class MemeUserDto {
  @ApiProperty({ description: 'ID пользователя', example: 1 })
  id: number;

  @ApiProperty({ description: 'Nickname пользователя', example: 'mememaster' })
  nickname: string;
}

export class MemeResponseDto {
  @ApiProperty({ description: 'ID мема', example: 1 })
  id: number;

  @ApiProperty({ description: 'Ссылка на мем', example: 'https://i.imgur.com/example1.jpg' })
  link: string;

  @ApiProperty({ description: 'ID пользователя', example: 1 })
  userId: number;

  @ApiProperty({ description: 'Информация о пользователе', type: MemeUserDto })
  user: MemeUserDto;

  @ApiProperty({ description: 'Имя загрузившего', example: 'mememaster' })
  uploaderName: string;

  @ApiProperty({ description: 'Домен источника', example: 'imgur.com' })
  domain: string;

  @ApiProperty({ description: 'Является ли ссылка валидной', example: true })
  isValidLink: boolean;

  @ApiProperty({ description: 'Является ли ссылкой на изображение', example: true })
  isImageLink: boolean;

  @ApiProperty({ description: 'С популярной ли платформы', example: true })
  isFromPopularPlatform: boolean;

  constructor(meme: any) {
    this.id = meme.id;
    this.link = meme.link;
    this.userId = meme.userId;
    this.user = {
      id: meme.user.id,
      nickname: meme.user.nickname,
    };
    this.uploaderName = meme.user.nickname;

    // Вычисляемые поля
    try {
      const url = new URL(meme.link);
      this.domain = url.hostname;
      this.isValidLink = url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      this.domain = 'Неизвестный сайт';
      this.isValidLink = false;
    }

    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    this.isImageLink = imageExtensions.some(ext => meme.link.toLowerCase().includes(ext));

    const popularDomains = ['imgur.com', 'i.imgur.com', 'reddit.com', 'i.redd.it', 'tenor.com', 'giphy.com'];
    this.isFromPopularPlatform = popularDomains.some(domain => this.domain.includes(domain));
  }
}