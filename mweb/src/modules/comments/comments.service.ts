import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(createCommentDto: CreateCommentDto): Promise<Comment> {
    let user = await this.prisma.user.findUnique({
      where: { nickname: createCommentDto.author }
    });

    if (!user) {
      const bcrypt = require('bcryptjs');
      const tempPassword = await bcrypt.hash('temp_password', 10);

      user = await this.prisma.user.create({
        data: {
          nickname: createCommentDto.author,
          password: tempPassword,
        }
      });
    }

    const commentData = await this.prisma.comment.create({
      data: {
        text: createCommentDto.text,
        userId: user.id,
      },
      include: {
        user: true,
      }
    });

    return new Comment({
      id: commentData.id,
      text: commentData.text,
      createdAt: commentData.createdAt,
      userId: commentData.userId,
      user: {
        id: commentData.user.id,
        nickname: commentData.user.nickname,
      }
    });
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{
    comments: Comment[];
    total: number;
    currentPageNumber: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }> {
    const skip = (page - 1) * limit;

    const [commentData, total] = await Promise.all([
      this.prisma.comment.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
        }
      }),
      this.prisma.comment.count()
    ]);

    const totalPages = Math.ceil(total / limit);

    const comments = commentData.map(comment => new Comment({
      id: comment.id,
      text: comment.text,
      createdAt: comment.createdAt,
      userId: comment.userId,
      user: {
        id: comment.user.id,
        nickname: comment.user.nickname,
      }
    }));

    return {
      comments,
      total,
      currentPageNumber: page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  async findOne(id: number): Promise<Comment | null> {
    const commentData = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        user: true,
      }
    });

    if (!commentData) {
      return null;
    }

    return new Comment({
      id: commentData.id,
      text: commentData.text,
      createdAt: commentData.createdAt,
      userId: commentData.userId,
      user: {
        id: commentData.user.id,
        nickname: commentData.user.nickname,
      }
    });
  }

  async update(id: number, updateCommentDto: UpdateCommentDto): Promise<Comment | null> {
    const commentData = await this.prisma.comment.update({
      where: { id },
      data: {
        text: updateCommentDto.text,
      },
      include: {
        user: true,
      }
    });

    return new Comment({
      id: commentData.id,
      text: commentData.text,
      createdAt: commentData.createdAt,
      userId: commentData.userId,
      user: {
        id: commentData.user.id,
        nickname: commentData.user.nickname,
      }
    });
  }

  async remove(id: number): Promise<void> {
    await this.prisma.comment.delete({
      where: { id }
    });
  }

  async getTotalCount(): Promise<number> {
    return this.prisma.comment.count();
  }
}