import { Quote as PrismaQuote, Genre } from '@prisma/client';

export type QuoteWithUser = PrismaQuote & {
  user?: {
    id: number;
    nickname: string;
  } | null;
};

export class Quote implements PrismaQuote {
  id: number;
  author: string;
  text: string;
  uploadedAt: Date;
  genre: Genre;
  userId: number;

  user?: {
    id: number;
    nickname: string;
  } | null;

  constructor(partial: Partial<QuoteWithUser>) {
    Object.assign(this, partial);
  }

  isValid(): boolean {
    return (
      this.author.trim().length > 0 &&
      this.text.trim().length > 0 &&
      this.text.length <= 2000 &&
      Object.values(Genre).includes(this.genre)
    );
  }

  getGenreName(): string {
    const genreMap = {
      [Genre.SMART]: 'Умная',
      [Genre.MOTIVATING]: 'Мотивирующая',
      [Genre.REALISTIC]: 'Реалистичная',
      [Genre.FUNNY]: 'Смешная',
    };
    return genreMap[this.genre] || 'Неизвестный жанр';
  }

  getFormattedUploadedAt(): string {
    if (!this.uploadedAt) return 'Неизвестно';

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Moscow'
    };

    return new Intl.DateTimeFormat('ru-RU', options).format(new Date(this.uploadedAt));
  }

  getUploaderName(): string {
    return this.user?.nickname || 'Неизвестный пользователь';
  }

  isRecentlyUploaded(): boolean {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return this.uploadedAt > weekAgo;
  }

  getPreview(maxLength: number = 100): string {
    if (this.text.length <= maxLength) {
      return this.text;
    }
    return this.text.substring(0, maxLength).trim() + '...';
  }

  getFullDescription(): string {
    return `"${this.text}" - ${this.author} (${this.getGenreName()})`;
  }
}