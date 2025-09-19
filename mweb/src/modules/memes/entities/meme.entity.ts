import { Meme as PrismaMeme } from '@prisma/client';

export type MemeWithUser = PrismaMeme & {
  user?: {
    id: number;
    nickname: string;
  } | null;
};

export class Meme implements PrismaMeme {
  id: number;
  link: string;
  userId: number;

  user?: {
    id: number;
    nickname: string;
  } | null;

  constructor(partial: Partial<MemeWithUser>) {
    Object.assign(this, partial);
  }

  isValidLink(): boolean {
    try {
      const url = new URL(this.link);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  isImageLink(): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const url = this.link.toLowerCase();
    return imageExtensions.some(ext => url.includes(ext));
  }

  getUploaderName(): string {
    return this.user?.nickname || 'Неизвестный пользователь';
  }

  getDomain(): string {
    try {
      const url = new URL(this.link);
      return url.hostname;
    } catch {
      return 'Неизвестный сайт';
    }
  }

  isFromPopularPlatform(): boolean {
    const popularDomains = [
      'imgur.com',
      'i.imgur.com',
      'reddit.com',
      'i.redd.it',
      'tenor.com',
      'giphy.com',
      'media.giphy.com',
    ];
    const domain = this.getDomain().toLowerCase();
    return popularDomains.some(popularDomain => domain.includes(popularDomain));
  }

  getShortLink(maxLength: number = 50): string {
    if (this.link.length <= maxLength) {
      return this.link;
    }
    return this.link.substring(0, maxLength) + '...';
  }
}