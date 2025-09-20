// mweb/src/modules/posts/posts.controller.ts
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
  HttpStatus
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // POST /posts/create - создание поста (обычно из формы на главной странице)
  @Post('create')
  @Redirect('/')
  async create(@Body() createPostDto: CreatePostDto) {
    try {
      await this.postsService.create(createPostDto);
      return { url: '/?success=post_created' };
    } catch (error) {
      return { url: '/?error=post_creation_failed' };
    }
  }

  // GET /posts - страница со всеми постами
  @Get()
  @Render('posts/index')
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

    let posts;
    let total;
    let paginationData;

    if (search) {
      // Поиск постов
      const searchResults = await this.postsService.searchPosts(search);
      posts = searchResults;
      total = searchResults.length;
      paginationData = {
        currentPage: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      };
    } else {
      // Обычная пагинация
      const result = await this.postsService.findAll(pageNumber, 5); // 5 постов на страницу
      posts = result.posts;
      total = result.total;
      paginationData = {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev,
      };
    }

    return {
      title: 'Все посты',
      currentPage: 'posts',
      isAuthenticated,
      username: isAuthenticated ? 'Администратор' : null,
      successMessage: this.getSuccessMessage(success),
      errorMessage: this.getErrorMessage(error),
      posts: posts.map(post => ({
        id: post.id,
        heading: post.heading,
        text: post.text,
        author: post.getAuthorName(), // используем метод из entity
        preview: post.getPreview(150), // превью до 150 символов
        wordCount: post.getWordCount(),
        isLongPost: post.isLongPost(),
      })),
      total,
      searchTerm: search || '',
      ...paginationData,
      nextPage: paginationData.hasNext ? paginationData.currentPage + 1 : null,
      prevPage: paginationData.hasPrev ? paginationData.currentPage - 1 : null,
      hasPagination: paginationData.totalPages > 1 && !search,
    };
  }

  // GET /posts/add - форма добавления поста
  @Get('add')
  @Render('posts/create')
  addForm(@Query('auth') auth?: string) {
    const isAuthenticated = auth === 'true';
    return {
      title: 'Создать пост',
      currentPage: 'posts',
      isAuthenticated,
      username: isAuthenticated ? 'Администратор' : null,
    };
  }

  // GET /posts/recent - последние посты
  @Get('recent')
  @Render('posts/recent')
  async findRecent(@Query('auth') auth?: string) {
    const recentPosts = await this.postsService.findRecentPosts(10);
    const isAuthenticated = auth === 'true';

    return {
      title: 'Последние посты',
      currentPage: 'posts',
      isAuthenticated,
      username: isAuthenticated ? 'Администратор' : null,
      posts: recentPosts.map(post => ({
        id: post.id,
        heading: post.heading,
        text: post.text,
        author: post.getAuthorName(),
        preview: post.getPreview(100),
        wordCount: post.getWordCount(),
      })),
      postsCount: recentPosts.length,
    };
  }

  // GET /posts/:id - просмотр отдельного поста
  @Get(':id')
  @Render('posts/show')
  async findOne(@Param('id') id: string, @Query('auth') auth?: string) {
    const post = await this.postsService.findOne(+id);

    if (!post) {
      throw new HttpException('Пост не найден', HttpStatus.NOT_FOUND);
    }

    const isAuthenticated = auth === 'true';

    return {
      title: post.heading,
      currentPage: 'posts',
      isAuthenticated,
      username: isAuthenticated ? 'Администратор' : null,
      post: {
        id: post.id,
        heading: post.heading,
        text: post.text,
        author: post.getAuthorName(),
        wordCount: post.getWordCount(),
        estimatedReadTime: post.getFormattedReadingTime(),
        isLongPost: post.isLongPost(),
      },
    };
  }

  // GET /posts/:id/edit - форма редактирования поста
  @Get(':id/edit')
  @Render('posts/edit')
  async editForm(@Param('id') id: string, @Query('auth') auth?: string) {
    const post = await this.postsService.findOne(+id);

    if (!post) {
      throw new HttpException('Пост не найден', HttpStatus.NOT_FOUND);
    }

    const isAuthenticated = auth === 'true';

    return {
      title: 'Редактировать пост',
      currentPage: 'posts',
      isAuthenticated,
      username: isAuthenticated ? 'Администратор' : null,
      post: {
        id: post.id,
        heading: post.heading,
        text: post.text,
        author: post.getAuthorName(),
      },
    };
  }

  // PATCH /posts/:id - обновление поста
  @Patch(':id')
  @Redirect()
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto
  ) {
    try {
      await this.postsService.update(+id, updatePostDto);
      return { url: `/posts/${id}?success=post_updated` };
    } catch (error) {
      return { url: `/posts/${id}/edit?error=update_failed` };
    }
  }

  // DELETE /posts/:id - удаление поста
  @Delete(':id')
  @Redirect('/posts')
  async remove(@Param('id') id: string) {
    try {
      await this.postsService.remove(+id);
      return { url: '/posts?success=post_deleted' };
    } catch (error) {
      return { url: '/posts?error=delete_failed' };
    }
  }

  // GET /posts/user/:userId - посты конкретного пользователя
  @Get('user/:userId')
  @Render('posts/user')
  async findByUser(@Param('userId') userId: string, @Query('auth') auth?: string) {
    const userPosts = await this.postsService.findByUser(+userId);
    const isAuthenticated = auth === 'true';

    return {
      title: 'Посты пользователя',
      currentPage: 'posts',
      isAuthenticated,
      username: isAuthenticated ? 'Администратор' : null,
      posts: userPosts.map(post => ({
        id: post.id,
        heading: post.heading,
        text: post.text,
        author: post.getAuthorName(),
        preview: post.getPreview(100),
        wordCount: post.getWordCount(),
      })),
      postsCount: userPosts.length,
      authorName: userPosts.length > 0 ? userPosts[0].getAuthorName() : 'Пользователь',
    };
  }

  private getSuccessMessage(success?: string): string | null {
    switch (success) {
      case 'post_created':
        return 'Пост успешно создан!';
      case 'post_updated':
        return 'Пост успешно обновлен!';
      case 'post_deleted':
        return 'Пост успешно удален!';
      default:
        return null;
    }
  }

  private getErrorMessage(error?: string): string | null {
    switch (error) {
      case 'post_creation_failed':
        return 'Ошибка при создании поста.';
      case 'update_failed':
        return 'Ошибка при обновлении поста.';
      case 'delete_failed':
        return 'Ошибка при удалении поста.';
      default:
        return null;
    }
  }
}