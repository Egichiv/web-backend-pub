import { Comment as PrismaComment, User } from '@prisma/client';

export type CommentWithUser = PrismaComment & {
  user?: {
    id: number;
    nickname: string;
  } | null;
};

export class Comment implements PrismaComment {
  id: number;
  text: string;
  createdAt: Date;
  userId: number;

  user?: {
    id: number;
    nickname: string;
  } | null;

  constructor(partial: Partial<CommentWithUser>) {
    Object.assign(this, partial);
  }

  isValidText(): boolean {
    return this.text.trim().length > 0 && this.text.length <= 1000;
  }

  getFormattedCreatedAt(): string {
    return this.createdAt.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getAuthorName(): string {
    return this.user?.nickname || 'Неизвестный пользователь';
  }

  isRecent(): boolean {
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    return this.createdAt > hourAgo;
  }
}