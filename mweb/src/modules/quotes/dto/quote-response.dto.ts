import { ApiProperty } from '@nestjs/swagger';
import { Genre } from '@prisma/client';

class QuoteUserDto {
  @ApiProperty({ description: 'ID пользователя', example: 1 })
  id: number;

  @ApiProperty({ description: 'Nickname пользователя', example: 'quotelover' })
  nickname: string;
}

export class QuoteResponseDto {
  @ApiProperty({ description: 'ID цитаты', example: 1 })
  id: number;

  @ApiProperty({ description: 'Автор цитаты', example: 'Альберт Эйнштейн' })
  author: string;

  @ApiProperty({ description: 'Текст цитаты', example: 'Логика может привести вас от пункта А...' })
  text: string;

  @ApiProperty({
    description: 'Жанр цитаты',
    enum: Genre,
    example: Genre.SMART
  })
  genre: Genre;

  @ApiProperty({ description: 'Название жанра на русском', example: 'Умная' })
  genreName: string;

  @ApiProperty({ description: 'Дата загрузки цитаты', example: '2024-01-15T00:00:00.000Z' })
  uploadedAt: string;

  @ApiProperty({ description: 'ID пользователя', example: 1 })
  userId: number;

  @ApiProperty({ description: 'Информация о пользователе', type: QuoteUserDto })
  user: QuoteUserDto;

  @ApiProperty({ description: 'Имя загрузившего', example: 'quotelover' })
  uploaderName: string;

  @ApiProperty({ description: 'Предпросмотр текста', example: 'Логика может привести вас от пункта А к пункту Б...' })
  preview: string;

  @ApiProperty({ description: 'Форматированная дата', example: '15 января 2024' })
  formattedDate: string;

  @ApiProperty({ description: 'Загружена ли цитата недавно (менее 7 дней назад)', example: false })
  isRecentlyUploaded: boolean;

  @ApiProperty({ description: 'Валидна ли цитата', example: true })
  isValid: boolean;

  constructor(quote: any, previewLength: number = 150) {
    this.id = quote.id;
    this.author = quote.author;
    this.text = quote.text;
    this.genre = quote.genre;
    this.uploadedAt = quote.uploadedAt.toISOString();
    this.userId = quote.userId;
    this.user = {
      id: quote.user.id,
      nickname: quote.user.nickname,
    };
    this.uploaderName = quote.user.nickname;

    // Вычисляемые поля
    const genreMap: Record<Genre, string> = {
      [Genre.SMART]: 'Умная',
      [Genre.MOTIVATING]: 'Мотивирующая',
      [Genre.REALISTIC]: 'Реалистичная',
      [Genre.FUNNY]: 'Смешная',
    };
    this.genreName = genreMap[quote.genre] || 'Неизвестный жанр';

    this.preview = quote.text.length > previewLength
      ? quote.text.substring(0, previewLength) + '...'
      : quote.text;

    // Форматирование даты
    const dateObj = new Date(quote.uploadedAt);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    this.formattedDate = dateObj.toLocaleDateString('ru-RU', options);

    // Проверка недавности загрузки (менее 7 дней)
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - dateObj.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    this.isRecentlyUploaded = diffDays <= 7;

    // Валидация
    this.isValid = this.author.length >= 2 &&
      this.text.length >= 10 &&
      Object.values(Genre).includes(this.genre);
  }
}