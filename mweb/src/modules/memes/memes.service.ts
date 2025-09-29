import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateMemeDto } from './dto/create-meme.dto';
import { UpdateMemeDto } from './dto/update-meme.dto';
import { Meme } from './entities/meme.entity';

@Injectable()
export class MemesService {
  constructor(private prisma: PrismaService) {}

  async create(createMemeDto: CreateMemeDto): Promise<Meme> {
    // Находим пользователя по имени или создаем временного
    let user = await this.prisma.user.findUnique({
      where: { nickname: createMemeDto.uploader || 'anonymous' }
    });

    // Если пользователь не найден, создаем временную запись
    if (!user) {
      const bcrypt = require('bcryptjs');
      const tempPassword = await bcrypt.hash('temp_password', 10);

      user = await this.prisma.user.create({
        data: {
          nickname: createMemeDto.uploader || 'anonymous',
          password: tempPassword,
        }
      });
    }

    const memeData = await this.prisma.meme.create({
      data: {
        link: createMemeDto.link,
        userId: user.id,
      },
      include: {
        user: true,
      }
    });

    return new Meme({
      id: memeData.id,
      link: memeData.link,
      userId: memeData.userId,
      user: {
        id: memeData.user.id,
        nickname: memeData.user.nickname,
      }
    });
  }

  async findAll(page: number = 1, limit: number = 12): Promise<{
    memes: Meme[];
    total: number;
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }> {
    const skip = (page - 1) * limit;

    const [memeData, total] = await Promise.all([
      this.prisma.meme.findMany({
        skip,
        take: limit,
        orderBy: { id: 'desc' }, // новые мемы сверху
        include: {
          user: true,
        }
      }),
      this.prisma.meme.count()
    ]);

    const totalPages = Math.ceil(total / limit);

    const memes = memeData.map(meme => new Meme({
      id: meme.id,
      link: meme.link,
      userId: meme.userId,
      user: {
        id: meme.user.id,
        nickname: meme.user.nickname,
      }
    }));

    return {
      memes,
      total,
      currentPage: page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  async findOne(id: number): Promise<Meme | null> {
    const memeData = await this.prisma.meme.findUnique({
      where: { id },
      include: {
        user: true,
      }
    });

    if (!memeData) {
      throw new NotFoundException('Мем не найден');
    }

    return new Meme({
      id: memeData.id,
      link: memeData.link,
      userId: memeData.userId,
      user: {
        id: memeData.user.id,
        nickname: memeData.user.nickname,
      }
    });
  }

  async update(id: number, updateMemeDto: UpdateMemeDto): Promise<Meme | null> {
    await this.findOne(id);
    const memeData = await this.prisma.meme.update({
      where: { id },
      data: {
        link: updateMemeDto.link,
      },
      include: {
        user: true,
      }
    });

    return new Meme({
      id: memeData.id,
      link: memeData.link,
      userId: memeData.userId,
      user: {
        id: memeData.user.id,
        nickname: memeData.user.nickname,
      }
    });
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.prisma.meme.delete({
      where: { id }
    });
  }

  // Дополнительные методы для мемов
  async getTotalCount(): Promise<number> {
    return this.prisma.meme.count();
  }

  async findByUser(userId: number): Promise<Meme[]> {
    const memeData = await this.prisma.meme.findMany({
      where: { userId },
      orderBy: { id: 'desc' },
      include: {
        user: true,
      }
    });

    return memeData.map(meme => new Meme({
      id: meme.id,
      link: meme.link,
      userId: meme.userId,
      user: {
        id: meme.user.id,
        nickname: meme.user.nickname,
      }
    }));
  }

  async findPopularPlatformMemes(): Promise<Meme[]> {
    const memeData = await this.prisma.meme.findMany({
      orderBy: { id: 'desc' },
      include: {
        user: true,
      }
    });

    const memes = memeData.map(meme => new Meme({
      id: meme.id,
      link: meme.link,
      userId: meme.userId,
      user: {
        id: meme.user.id,
        nickname: meme.user.nickname,
      }
    }));

    // Фильтруем мемы с популярных платформ используя метод из entity
    return memes.filter(meme => meme.isFromPopularPlatform());
  }
}