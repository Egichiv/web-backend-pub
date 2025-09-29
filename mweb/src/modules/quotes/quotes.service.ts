import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { Quote } from './entities/quote.entity';
import { Genre } from '@prisma/client';

@Injectable()
export class QuotesService {
  constructor(private prisma: PrismaService) {}

  async create(createQuoteDto: CreateQuoteDto): Promise<Quote> {
    // Находим пользователя по имени или создаем временного
    let user = await this.prisma.user.findUnique({
      where: { nickname: createQuoteDto.uploader || 'anonymous' }
    });

    // Если пользователь не найден, создаем временную запись
    if (!user) {
      const bcrypt = require('bcryptjs');
      const tempPassword = await bcrypt.hash('temp_password', 10);

      user = await this.prisma.user.create({
        data: {
          nickname: createQuoteDto.uploader || 'anonymous',
          password: tempPassword,
        }
      });
    }

    const quoteData = await this.prisma.quote.create({
      data: {
        author: createQuoteDto.author,
        text: createQuoteDto.text,
        genre: createQuoteDto.genre,
        userId: user.id,
      },
      include: {
        user: true,
      }
    });

    return new Quote({
      id: quoteData.id,
      author: quoteData.author,
      text: quoteData.text,
      uploadedAt: quoteData.uploadedAt,
      genre: quoteData.genre,
      userId: quoteData.userId,
      user: {
        id: quoteData.user.id,
        nickname: quoteData.user.nickname,
      }
    });
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    filters?: {
      genre?: Genre;
      author?: string;
      search?: string;
      sort?: string;
    }
  ): Promise<{
    quotes: Quote[];
    total: number;
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }> {
    const skip = (page - 1) * limit;

    const where: any = {};

    const andConditions: any[] = [];

    if (filters?.genre) {
      andConditions.push({ genre: filters.genre });
    }

    // Фильтр по автору
    if (filters?.author && filters?.author.trim()) {
      andConditions.push({
        author: { contains: filters.author.trim(), mode: 'insensitive' }
      });
    }

    // Поиск по тексту
    if (filters?.search && filters?.search.trim()) {
      andConditions.push({
        OR: [
          { text: { contains: filters.search.trim(), mode: 'insensitive' } },
          { author: { contains: filters.search.trim(), mode: 'insensitive' } },
        ]
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    let orderBy: any = { id: 'desc' }; // По умолчанию по ID в убывающем порядке

    if (filters?.sort) {
      switch (filters.sort) {
        case 'id_asc':
          orderBy = { id: 'asc' };
          break;
        case 'id_desc':
          orderBy = { id: 'desc' };
          break;
        default:
          orderBy = { id: 'desc' };
          break;
      }
    }

    const [quoteData, total] = await Promise.all([
      this.prisma.quote.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: true,
        }
      }),
      this.prisma.quote.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    const quotes = quoteData.map(quote => new Quote({
      id: quote.id,
      author: quote.author,
      text: quote.text,
      uploadedAt: quote.uploadedAt,
      genre: quote.genre,
      userId: quote.userId,
      user: {
        id: quote.user.id,
        nickname: quote.user.nickname,
      }
    }));

    return {
      quotes,
      total,
      currentPage: page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  async findOne(id: number): Promise<Quote | null> {
    const quoteData = await this.prisma.quote.findUnique({
      where: { id },
      include: {
        user: true,
      }
    });

    if (!quoteData) {
      throw new NotFoundException("Цитата не найдена");
    }

    return new Quote({
      id: quoteData.id,
      author: quoteData.author,
      text: quoteData.text,
      uploadedAt: quoteData.uploadedAt,
      genre: quoteData.genre,
      userId: quoteData.userId,
      user: {
        id: quoteData.user.id,
        nickname: quoteData.user.nickname,
      }
    });
  }

  async update(id: number, updateQuoteDto: UpdateQuoteDto): Promise<Quote | null> {
    await this.findOne(id);
    const quoteData = await this.prisma.quote.update({
      where: { id },
      data: {
        author: updateQuoteDto.author,
        text: updateQuoteDto.text,
        genre: updateQuoteDto.genre,
      },
      include: {
        user: true,
      }
    });

    return new Quote({
      id: quoteData.id,
      author: quoteData.author,
      text: quoteData.text,
      uploadedAt: quoteData.uploadedAt,
      genre: quoteData.genre,
      userId: quoteData.userId,
      user: {
        id: quoteData.user.id,
        nickname: quoteData.user.nickname,
      }
    });
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.prisma.quote.delete({
      where: { id }
    });
  }

  // Дополнительные методы для цитат
  async getTotalCount(): Promise<number> {
    return this.prisma.quote.count();
  }

  async findByUser(userId: number): Promise<Quote[]> {
    const quoteData = await this.prisma.quote.findMany({
      where: { userId },
      orderBy: { uploadedAt: 'desc' },
      include: {
        user: true,
      }
    });

    return quoteData.map(quote => new Quote({
      id: quote.id,
      author: quote.author,
      text: quote.text,
      uploadedAt: quote.uploadedAt,
      genre: quote.genre,
      userId: quote.userId,
      user: {
        id: quote.user.id,
        nickname: quote.user.nickname,
      }
    }));
  }

  async findByGenre(genre: Genre): Promise<Quote[]> {
    const quoteData = await this.prisma.quote.findMany({
      where: { genre },
      orderBy: { uploadedAt: 'desc' },
      include: {
        user: true,
      }
    });

    return quoteData.map(quote => new Quote({
      id: quote.id,
      author: quote.author,
      text: quote.text,
      uploadedAt: quote.uploadedAt,
      genre: quote.genre,
      userId: quote.userId,
      user: {
        id: quote.user.id,
        nickname: quote.user.nickname,
      }
    }));
  }

  async findByAuthor(authorName: string): Promise<Quote[]> {
    const quoteData = await this.prisma.quote.findMany({
      where: {
        author: { contains: authorName, mode: 'insensitive' }
      },
      orderBy: { uploadedAt: 'desc' },
      include: {
        user: true,
      }
    });

    return quoteData.map(quote => new Quote({
      id: quote.id,
      author: quote.author,
      text: quote.text,
      uploadedAt: quote.uploadedAt,
      genre: quote.genre,
      userId: quote.userId,
      user: {
        id: quote.user.id,
        nickname: quote.user.nickname,
      }
    }));
  }

  async findRecentQuotes(limit: number = 5): Promise<Quote[]> {
    const quoteData = await this.prisma.quote.findMany({
      take: limit,
      orderBy: { uploadedAt: 'desc' },
      include: {
        user: true,
      }
    });

    return quoteData.map(quote => new Quote({
      id: quote.id,
      author: quote.author,
      text: quote.text,
      uploadedAt: quote.uploadedAt,
      genre: quote.genre,
      userId: quote.userId,
      user: {
        id: quote.user.id,
        nickname: quote.user.nickname,
      }
    }));
  }

  async getQuotesByGenreStats(): Promise<{genre: Genre, count: number}[]> {
    const stats = await this.prisma.quote.groupBy({
      by: ['genre'],
      _count: { genre: true }
    });

    return stats.map(stat => ({
      genre: stat.genre,
      count: stat._count.genre
    }));
  }

  async getRandomQuote(): Promise<Quote | null> {
    const count = await this.prisma.quote.count();
    if (count === 0) return null;

    const randomIndex = Math.floor(Math.random() * count);

    const quoteData = await this.prisma.quote.findMany({
      skip: randomIndex,
      take: 1,
      include: {
        user: true,
      }
    });

    if (quoteData.length === 0) return null;

    const quote = quoteData[0];
    return new Quote({
      id: quote.id,
      author: quote.author,
      text: quote.text,
      uploadedAt: quote.uploadedAt,
      genre: quote.genre,
      userId: quote.userId,
      user: {
        id: quote.user.id,
        nickname: quote.user.nickname,
      }
    });
  }

  async getUniqueAuthorsCount(): Promise<number> {
    const result = await this.prisma.quote.findMany({
      select: { author: true },
      distinct: ['author']
    });
    return result.length;
  }
}