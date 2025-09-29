import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Проверяем, существует ли пользователь с таким nickname
    const existingUser = await this.prisma.user.findUnique({
      where: { nickname: createUserDto.nickname }
    });

    if (existingUser) {
      throw new ConflictException('Пользователь с таким именем уже существует');
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const userData = await this.prisma.user.create({
      data: {
        nickname: createUserDto.nickname,
        password: hashedPassword,
      },
    });

    return new User({
      id: userData.id,
      nickname: userData.nickname,
      password: userData.password,
    });
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{
    users: User[];
    total: number;
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }> {
    const skip = (page - 1) * limit;

    const [userData, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      this.prisma.user.count()
    ]);

    const totalPages = Math.ceil(total / limit);

    const users = userData.map(user => new User({
      id: user.id,
      nickname: user.nickname,
      password: user.password,
    }));

    return {
      users,
      total,
      currentPage: page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  async findOne(id: number): Promise<User | null> {
    const userData = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!userData) {
      throw new NotFoundException('Пользователь не найден');
    }

    return new User({
      id: userData.id,
      nickname: userData.nickname,
      password: userData.password,
    });
  }

  async findByNickname(nickname: string): Promise<User | null> {
    const userData = await this.prisma.user.findUnique({
      where: { nickname },
    });

    if (!userData) {
      return null;
    }

    return new User({
      id: userData.id,
      nickname: userData.nickname,
      password: userData.password,
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User | null> {
    // Если обновляется пароль, хешируем его
    const updateData: any = { ...updateUserDto };
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Проверяем уникальность nickname, если он обновляется
    if (updateUserDto.nickname) {
      const existingUser = await this.prisma.user.findUnique({
        where: { nickname: updateUserDto.nickname }
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Пользователь с таким именем уже существует');
      }
    }

    const userData = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    return new User({
      id: userData.id,
      nickname: userData.nickname,
      password: userData.password,
    });
  }

  async remove(id: number): Promise<void> {
    await this.prisma.user.delete({
      where: { id }
    });
  }

  // Методы для аутентификации
  async validateUser(loginUserDto: LoginUserDto): Promise<User | null> {
    const user = await this.findByNickname(loginUserDto.nickname);

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(loginUserDto.password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async login(loginUserDto: LoginUserDto): Promise<User> {
    const user = await this.validateUser(loginUserDto);

    if (!user) {
      throw new UnauthorizedException('Неверное имя пользователя или пароль');
    }

    return user;
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto): Promise<void> {
    // Получаем пользователя
    const user = await this.findOne(userId);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Проверяем текущий пароль
    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Текущий пароль неверен');
    }

    // Хешируем и сохраняем новый пароль
    const hashedNewPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });
  }

  // Дополнительные методы для пользователей
  async getTotalCount(): Promise<number> {
    return this.prisma.user.count();
  }

  async searchUsers(searchTerm: string): Promise<User[]> {
    const userData = await this.prisma.user.findMany({
      where: {
        nickname: { contains: searchTerm, mode: 'insensitive' }
      },
      orderBy: { id: 'desc' },
    });

    return userData.map(user => new User({
      id: user.id,
      nickname: user.nickname,
      password: user.password,
    }));
  }

  async getUserStats(userId: number): Promise<{
    commentsCount: number;
    quotesCount: number;
    memesCount: number;
    postsCount: number;
  }> {
    const user = await this.findOne(userId);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const [commentsCount, quotesCount, memesCount, postsCount] = await Promise.all([
      this.prisma.comment.count({ where: { userId } }),
      this.prisma.quote.count({ where: { userId } }),
      this.prisma.meme.count({ where: { userId } }),
      this.prisma.post.count({ where: { userId } }),
    ]);

    return {
      commentsCount,
      quotesCount,
      memesCount,
      postsCount,
    };
  }

  async getUserWithContent(userId: number): Promise<{
    user: User;
    recentComments: any[];
    recentQuotes: any[];
    recentMemes: any[];
    recentPosts: any[];
  } | null> {
    const user = await this.findOne(userId);
    if (!user) {
      return null;
    }

    const [recentComments, recentQuotes, recentMemes, recentPosts] = await Promise.all([
      this.prisma.comment.findMany({
        where: { userId },
        take: 5,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.quote.findMany({
        where: { userId },
        take: 5,
        orderBy: { uploadedAt: 'desc' }
      }),
      this.prisma.meme.findMany({
        where: { userId },
        take: 5,
        orderBy: { id: 'desc' }
      }),
      this.prisma.post.findMany({
        where: { userId },
        take: 5,
        orderBy: { id: 'desc' }
      }),
    ]);

    return {
      user,
      recentComments,
      recentQuotes,
      recentMemes,
      recentPosts,
    };
  }

  // Проверка существования пользователя по ID
  async exists(id: number): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { id }
    });
    return count > 0;
  }

  // Проверка существования пользователя по nickname
  async existsByNickname(nickname: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { nickname }
    });
    return count > 0;
  }
}