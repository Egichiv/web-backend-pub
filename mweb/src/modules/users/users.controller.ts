import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Render,
  Redirect,
  HttpException,
  HttpStatus,
  Session
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // POST /users/register - регистрация нового пользователя
  @Post('register')
  @Redirect('/login')
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      await this.usersService.create(createUserDto);
      return { url: '/login?success=registration_successful' };
    } catch (error) {
      if (error.status === 409) { // ConflictException
        return { url: '/register?error=user_exists' };
      }
      return { url: '/register?error=registration_failed' };
    }
  }

  // POST /users/login - вход пользователя
  @Post('login')
  @Redirect('/')
  async login(@Body() loginUserDto: LoginUserDto, @Session() session: any) {
    try {
      const user = await this.usersService.login(loginUserDto);

      // Сохраняем пользователя в сессии
      session.user = {
        id: user.id,
        nickname: user.nickname,
      };
      session.isAuthenticated = true;

      return { url: '/?auth=true&success=login_successful' };
    } catch (error) {
      return { url: '/login?error=invalid_credentials' };
    }
  }

  // POST /users/logout - выход пользователя
  @Post('logout')
  @Redirect('/')
  async logout(@Session() session: any) {
    session.destroy();
    return { url: '/?auth=false&success=logout_successful' };
  }

  // GET /users - страница со всеми пользователями (админ)
  @Get()
  @Render('users/index')
  async findAll(
    @Query('page') page?: string,
    @Query('search') search?: string,
    @Query('auth') auth?: string,
    @Query('success') success?: string,
    @Query('error') error?: string,
  ) {
    let pageNumber = 1;
    if (page != null) {
      pageNumber = parseInt(page) || 1;
    }
    const isAuthenticated = auth === 'true';

    let users;
    let total;
    let paginationData;

    if (search) {
      // Поиск пользователей
      const searchResults = await this.usersService.searchUsers(search);
      users = searchResults;
      total = searchResults.length;
      paginationData = {
        currentPage: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      };
    } else {
      // Обычная пагинация
      const result = await this.usersService.findAll(pageNumber, 10); // 10 пользователей на страницу
      users = result.users;
      total = result.total;
      paginationData = {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev,
      };
    }

    return {
      title: 'Управление пользователями',
      currentPage: 'users',
      isAuthenticated,
      username: isAuthenticated ? 'Администратор' : null,
      successMessage: this.getSuccessMessage(success),
      errorMessage: this.getErrorMessage(error),
      users: users.map(user => ({
        id: user.id,
        nickname: user.nickname,
        hashedPassword: user.getDisplayPassword(), // используем метод из entity
        isValidNickname: user.isValidNickname(),
        // Не передаем настоящий пароль в шаблон
      })),
      total,
      searchTerm: search || '',
      ...paginationData,
      nextPage: paginationData.hasNext ? paginationData.currentPage + 1 : null,
      prevPage: paginationData.hasPrev ? paginationData.currentPage - 1 : null,
      hasPagination: paginationData.totalPages > 1 && !search,
    };
  }

  // GET /users/register - форма регистрации
  @Get('register')
  @Render('users/register')
  registerForm(@Query('error') error?: string) {
    return {
      title: 'Регистрация',
      currentPage: 'register',
      isAuthenticated: false,
      errorMessage: this.getErrorMessage(error),
    };
  }

  // GET /users/profile - профиль текущего пользователя
  @Get('profile')
  @Render('users/profile')
  async profile(@Session() session: any, @Query('success') success?: string) {
    if (!session.isAuthenticated) {
      throw new HttpException('Необходима авторизация', HttpStatus.UNAUTHORIZED);
    }

    const userWithContent = await this.usersService.getUserWithContent(session.user.id);
    const userStats = await this.usersService.getUserStats(session.user.id);

    if (!userWithContent) {
      throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
    }

    return {
      title: 'Мой профиль',
      currentPage: 'profile',
      isAuthenticated: true,
      username: userWithContent.user.nickname,
      successMessage: this.getSuccessMessage(success),
      user: {
        id: userWithContent.user.id,
        nickname: userWithContent.user.nickname,
        isValidNickname: userWithContent.user.isValidNickname(),
      },
      stats: userStats,
      recentActivity: {
        comments: userWithContent.recentComments,
        quotes: userWithContent.recentQuotes,
        memes: userWithContent.recentMemes,
        posts: userWithContent.recentPosts,
      },
    };
  }

  // GET /users/change-password - форма смены пароля
  @Get('change-password')
  @Render('users/change-password')
  changePasswordForm(@Session() session: any, @Query('error') error?: string) {
    if (!session.isAuthenticated) {
      throw new HttpException('Необходима авторизация', HttpStatus.UNAUTHORIZED);
    }

    return {
      title: 'Смена пароля',
      currentPage: 'profile',
      isAuthenticated: true,
      username: session.user.nickname,
      errorMessage: this.getErrorMessage(error),
    };
  }

  // POST /users/change-password - обработка смены пароля
  @Post('change-password')
  @Redirect('/users/profile')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Session() session: any
  ) {
    if (!session.isAuthenticated) {
      throw new HttpException('Необходима авторизация', HttpStatus.UNAUTHORIZED);
    }

    try {
      await this.usersService.changePassword(session.user.id, changePasswordDto);
      return { url: '/users/profile?success=password_changed' };
    } catch (error) {
      return { url: '/users/change-password?error=password_change_failed' };
    }
  }

  // GET /users/:id - просмотр профиля пользователя
  @Get(':id')
  @Render('users/show')
  async findOne(@Param('id') id: string, @Query('auth') auth?: string) {
    const userWithContent = await this.usersService.getUserWithContent(+id);

    if (!userWithContent) {
      throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
    }

    const userStats = await this.usersService.getUserStats(+id);
    const isAuthenticated = auth === 'true';

    return {
      title: `Профиль ${userWithContent.user.nickname}`,
      currentPage: 'users',
      isAuthenticated,
      username: isAuthenticated ? 'Администратор' : null,
      profileUser: {
        id: userWithContent.user.id,
        nickname: userWithContent.user.nickname,
        isValidNickname: userWithContent.user.isValidNickname(),
      },
      stats: userStats,
      recentActivity: {
        comments: userWithContent.recentComments,
        quotes: userWithContent.recentQuotes,
        memes: userWithContent.recentMemes,
        posts: userWithContent.recentPosts,
      },
    };
  }

  // GET /users/:id/edit - форма редактирования пользователя (админ)
  @Get(':id/edit')
  @Render('users/edit')
  async editForm(@Param('id') id: string, @Query('auth') auth?: string) {
    const user = await this.usersService.findOne(+id);

    if (!user) {
      throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
    }

    const isAuthenticated = auth === 'true';

    return {
      title: 'Редактировать пользователя',
      currentPage: 'users',
      isAuthenticated,
      username: isAuthenticated ? 'Администратор' : null,
      editUser: {
        id: user.id,
        nickname: user.nickname,
      },
    };
  }

  // PATCH /users/:id - обновление пользователя
  @Patch(':id')
  @Redirect()
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto
  ) {
    try {
      await this.usersService.update(+id, updateUserDto);
      return { url: `/users/${id}?success=user_updated` };
    } catch (error) {
      if (error.status === 409) { // ConflictException
        return { url: `/users/${id}/edit?error=nickname_exists` };
      }
      return { url: `/users/${id}/edit?error=update_failed` };
    }
  }

  // DELETE /users/:id - удаление пользователя (админ)
  @Delete(':id')
  @Redirect('/users')
  async remove(@Param('id') id: string) {
    try {
      await this.usersService.remove(+id);
      return { url: '/users?success=user_deleted' };
    } catch (error) {
      return { url: '/users?error=delete_failed' };
    }
  }

  private getSuccessMessage(success?: string): string | null {
    switch (success) {
      case 'registration_successful':
        return 'Регистрация прошла успешно! Теперь вы можете войти.';
      case 'login_successful':
        return 'Добро пожаловать!';
      case 'logout_successful':
        return 'Вы успешно вышли из системы.';
      case 'password_changed':
        return 'Пароль успешно изменен!';
      case 'user_updated':
        return 'Пользователь успешно обновлен!';
      case 'user_deleted':
        return 'Пользователь успешно удален!';
      default:
        return null;
    }
  }

  private getErrorMessage(error?: string): string | null {
    switch (error) {
      case 'user_exists':
        return 'Пользователь с таким именем уже существует.';
      case 'registration_failed':
        return 'Ошибка при регистрации. Попробуйте еще раз.';
      case 'invalid_credentials':
        return 'Неверное имя пользователя или пароль.';
      case 'password_change_failed':
        return 'Ошибка при смене пароля. Проверьте правильность текущего пароля.';
      case 'nickname_exists':
        return 'Пользователь с таким именем уже существует.';
      case 'update_failed':
        return 'Ошибка при обновлении пользователя.';
      case 'delete_failed':
        return 'Ошибка при удалении пользователя.';
      default:
        return null;
    }
  }
}