import { Post as PrismaPost } from '@prisma/client';

export type PostWithUser = PrismaPost & {
  user?: {
    id: number;
    nickname: string;
  } | null;
};

export class Post implements PrismaPost {
  id: number;
  heading: string;
  text: string;
  userId: number;

  user?: {
    id: number;
    nickname: string;
  } | null;

  constructor(partial: Partial<PostWithUser>) {
    Object.assign(this, partial);
  }

  isValid(): boolean {
    return (
      this.heading.trim().length > 0 &&
      this.heading.length <= 200 &&
      this.text.trim().length > 0 &&
      this.text.length <= 10000
    );
  }

  getPreview(maxLength: number = 200): string {
    if (this.text.length <= maxLength) {
      return this.text;
    }
    return this.text.substring(0, maxLength).trim() + '...';
  }

  getWordCount(): number {
    return this.text.trim().split(/\s+/).length;
  }

  getReadingTime(): number {
    const wordsPerMinute = 200;
    const words = this.getWordCount();
    return Math.ceil(words / wordsPerMinute);
  }

  getFormattedReadingTime(): string {
    const minutes = this.getReadingTime();
    if (minutes === 1) {
      return '1 минута';
    } else if (minutes < 5) {
      return `${minutes} минуты`;
    } else {
      return `${minutes} минут`;
    }
  }

  isLongPost(): boolean {
    return this.getWordCount() > 500;
  }

  getSlug(): string {
    return this.heading
      .toLowerCase()
      .replace(/[^\wа-яё\s-]/g, '') // убираем специальные символы кроме дефисов
      .replace(/\s+/g, '-') // заменяем пробелы на дефисы
      .replace(/-+/g, '-') // убираем повторяющиеся дефисы
      .trim();
  }

  getAuthorName(): string {
    return this.user?.nickname || 'Неизвестный автор';
  }

  containsKeyword(keyword: string): boolean {
    const searchText = (this.heading + ' ' + this.text).toLowerCase();
    return searchText.includes(keyword.toLowerCase());
  }

  isAuthor(userId: number): boolean {
    return this.userId === userId;
  }
}