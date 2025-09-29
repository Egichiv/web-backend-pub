import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create(createPostDto: CreatePostDto): Promise<Post> {
    // Находим пользователя по имени или создаем временного
    let user = await this.prisma.user.findUnique({
      where: { nickname: createPostDto.author || 'admin' }
    });

    // Если пользователь не найден, создаем временную запись
    if (!user) {
      const bcrypt = require('bcryptjs');
      const tempPassword = await bcrypt.hash('temp_password', 10);

      user = await this.prisma.user.create({
        data: {
          nickname: createPostDto.author || 'admin',
          password: tempPassword,
        }
      });
    }

    const postData = await this.prisma.post.create({
      data: {
        heading: createPostDto.heading,
        text: createPostDto.text,
        userId: user.id,
      },
      include: {
        user: true,
      }
    });

    return new Post({
      id: postData.id,
      heading: postData.heading,
      text: postData.text,
      userId: postData.userId,
      user: {
        id: postData.user.id,
        nickname: postData.user.nickname,
      }
    });
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{
    posts: Post[];
    total: number;
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }> {
    const skip = (page - 1) * limit;

    const [postData, total] = await Promise.all([
      this.prisma.post.findMany({
        skip,
        take: limit,
        orderBy: { id: 'desc' }, // новые посты сверху
        include: {
          user: true,
        }
      }),
      this.prisma.post.count()
    ]);

    const totalPages = Math.ceil(total / limit);

    const posts = postData.map(post => new Post({
      id: post.id,
      heading: post.heading,
      text: post.text,
      userId: post.userId,
      user: {
        id: post.user.id,
        nickname: post.user.nickname,
      }
    }));

    return {
      posts,
      total,
      currentPage: page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  async findOne(id: number): Promise<Post | null> {
    const postData = await this.prisma.post.findUnique({
      where: { id },
      include: {
        user: true,
      }
    });

    if (!postData) {
      throw new NotFoundException('Пост не найден');
    }

    return new Post({
      id: postData.id,
      heading: postData.heading,
      text: postData.text,
      userId: postData.userId,
      user: {
        id: postData.user.id,
        nickname: postData.user.nickname,
      }
    });
  }

  async update(id: number, updatePostDto: UpdatePostDto): Promise<Post | null> {
    await this.findOne(id);

    const postData = await this.prisma.post.update({
      where: { id },
      data: {
        heading: updatePostDto.heading,
        text: updatePostDto.text,
      },
      include: {
        user: true,
      }
    });

    return new Post({
      id: postData.id,
      heading: postData.heading,
      text: postData.text,
      userId: postData.userId,
      user: {
        id: postData.user.id,
        nickname: postData.user.nickname,
      }
    });
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.prisma.post.delete({
      where: { id }
    });
  }

  // Дополнительные методы для постов
  async getTotalCount(): Promise<number> {
    return this.prisma.post.count();
  }

  async findByUser(userId: number): Promise<Post[]> {
    const postData = await this.prisma.post.findMany({
      where: { userId },
      orderBy: { id: 'desc' },
      include: {
        user: true,
      }
    });

    return postData.map(post => new Post({
      id: post.id,
      heading: post.heading,
      text: post.text,
      userId: post.userId,
      user: {
        id: post.user.id,
        nickname: post.user.nickname,
      }
    }));
  }

  async findRecentPosts(limit: number = 5): Promise<Post[]> {
    const postData = await this.prisma.post.findMany({
      take: limit,
      orderBy: { id: 'desc' },
      include: {
        user: true,
      }
    });

    return postData.map(post => new Post({
      id: post.id,
      heading: post.heading,
      text: post.text,
      userId: post.userId,
      user: {
        id: post.user.id,
        nickname: post.user.nickname,
      }
    }));
  }

  async searchPosts(searchTerm: string): Promise<Post[]> {
    const postData = await this.prisma.post.findMany({
      where: {
        OR: [
          { heading: { contains: searchTerm, mode: 'insensitive' } },
          { text: { contains: searchTerm, mode: 'insensitive' } },
        ]
      },
      orderBy: { id: 'desc' },
      include: {
        user: true,
      }
    });

    return postData.map(post => new Post({
      id: post.id,
      heading: post.heading,
      text: post.text,
      userId: post.userId,
      user: {
        id: post.user.id,
        nickname: post.user.nickname,
      }
    }));
  }
}