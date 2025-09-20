import { Controller, Get, Post, Query, Body, Render, Redirect, Session } from '@nestjs/common';
import { AppService } from './app.service';
import { CommentsService } from './modules/comments/comments.service';
import { QuotesService } from './modules/quotes/quotes.service';
import { PostsService } from './modules/posts/posts.service';
import { MemesService } from './modules/memes/memes.service';
import { UsersService } from './modules/users/users.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly commentsService: CommentsService,
    private readonly quotesService: QuotesService,
    private readonly postsService: PostsService,
    private readonly memesService: MemesService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  @Render('index')
  async getHello(
    @Query('auth') auth?: string,
    @Query('success') success?: string,
    @Session() session?: any
  ) {
    const isAuthenticated = session?.isAuthenticated || auth === 'true';
    const username = session?.user?.nickname || (isAuthenticated ? 'Администратор' : null);

    const [recentPosts, latestQuotes] = await Promise.all([
      this.postsService.findRecentPosts(3),
      this.quotesService.findRecentQuotes(3),
    ]);

    return {
      title: 'Главная',
      currentPage: 'index',
      isAuthenticated,
      username,
      successMessage: this.getSuccessMessage(success),
      posts: recentPosts.map(post => ({
        id: post.id,
        title: post.heading,
        content: post.getPreview(200),
        author: post.getAuthorName(),
        wordCount: post.getWordCount(),
      })),
      latestQuotes: latestQuotes.map(quote => ({
        text: quote.text,
        author: quote.author,
        genre: quote.getGenreName(),
      })),
    };
  }

  // Страница "О сайте"
  @Get('about')
  @Render('about')
  async getAboutPage(
    @Query('auth') auth?: string,
    @Query('success') success?: string,
    @Query('error') error?: string,
    @Query('page') page?: string,
    @Session() session?: any
  ) {
    const isAuthenticated = session?.isAuthenticated || auth === 'true';
    const username = session?.user?.nickname || (isAuthenticated ? 'Администратор' : null);
    let pageNumber = 1;
    if (page != null) {
      pageNumber = parseInt(page) || 1;
    }

    const [commentsData, totalComments, totalQuotes, totalUsers] = await Promise.all([
      this.commentsService.findAll(pageNumber, 5),
      this.commentsService.getTotalCount(),
      this.quotesService.getTotalCount(),
      this.usersService.getTotalCount(),
    ]);

    const uniqueAuthorsCount = await this.quotesService.getUniqueAuthorsCount();

    return {
      title: 'О сайте',
      currentPage: 'about',
      isAuthenticated,
      username,
      commentSuccess: success === 'comment_created',
      commentError: error === 'comment_creation_failed',
      comments: commentsData.comments.map(comment => ({
        id: comment.id,
        text: comment.text,
        createdAt: comment.createdAt,
        author: comment.getAuthorName(),
      })),
      commentsCount: commentsData.total,
      currentPageNumber: commentsData.currentPageNumber,
      totalPages: commentsData.totalPages,
      hasNextPage: commentsData.hasNext,
      hasPrevPage: commentsData.hasPrev,
      nextPage: commentsData.hasNext ? commentsData.currentPageNumber + 1 : null,
      prevPage: commentsData.hasPrev ? commentsData.currentPageNumber - 1 : null,
      hasPagination: commentsData.totalPages > 1,
      stats: {
        totalComments,
        totalQuotes,
        totalAuthors: uniqueAuthorsCount,
        totalUsers,
      },
    };
  }

  @Get('quotes')
  @Render('quotes')
  async getQuotesPage(
    @Query('auth') auth?: string,
    @Query('genre') genre?: string,
    @Query('search') search?: string,
    @Session() session?: any
  ) {
    const isAuthenticated = session?.isAuthenticated || auth === 'true';
    const username = session?.user?.nickname || (isAuthenticated ? 'Администратор' : null);

    // Подготавливаем фильтры
    const filters: any = {};
    if (genre) filters.genre = genre;
    if (search) filters.search = search;

    const [quotesData, genreStats] = await Promise.all([
      this.quotesService.findAll(1, 12, filters), // первая страница, 12 цитат
      this.quotesService.getQuotesByGenreStats(),
    ]);

    return {
      title: 'Цитаты',
      currentPage: 'quotes',
      isAuthenticated,
      username,
      quotes: quotesData.quotes.map(quote => ({
        id: quote.id,
        text: quote.text,
        author: quote.author,
        genre: quote.genre,
        genreName: quote.getGenreName(),
        preview: quote.getPreview(150),
      })),
      quotesCount: quotesData.total,
      genreFilter: genre || null,
      searchTerm: search || '',
      genreStats,
    };
  }

  @Get('addQuote')
  @Render('addQuote')
  getAddQuotePage(
    @Query('auth') auth?: string,
    @Query('success') success?: string,
    @Query('error') error?: string,
    @Session() session?: any
  ) {
    const isAuthenticated = session?.isAuthenticated || auth === 'true';
    const username = session?.user?.nickname || (isAuthenticated ? 'Администратор' : null);

    return {
      title: 'Добавить цитату',
      currentPage: 'addQuote',
      isAuthenticated,
      username,
      successMessage: this.getSuccessMessage(success),
      errorMessage: this.getErrorMessage(error),
      genreOptions: [
        { value: 'SMART', name: 'Умная' },
        { value: 'MOTIVATING', name: 'Мотивирующая' },
        { value: 'REALISTIC', name: 'Реалистичная' },
        { value: 'FUNNY', name: 'Смешная' },
      ],
    };
  }

  @Get('memes')
  @Render('memes')
  async getMemesPage(
    @Query('auth') auth?: string,
    @Query('page') page?: string,
    @Session() session?: any
  ) {
    const isAuthenticated = session?.isAuthenticated || auth === 'true';
    const username = session?.user?.nickname || (isAuthenticated ? 'Администратор' : null);
    let pageNumber = 1;
    if (page != null) {
      pageNumber = parseInt(page) || 1;
    }

    const memesData = await this.memesService.findAll(pageNumber, 12); // 12 мемов на страницу

    return {
      title: 'Мемы',
      currentPage: 'memes',
      isAuthenticated,
      username,
      memes: memesData.memes.map(meme => ({
        id: meme.id,
        link: meme.link,
        uploader: meme.getUploaderName(),
        domain: meme.getDomain(),
        isFromPopular: meme.isFromPopularPlatform(),
        shortLink: meme.getShortLink(40),
      })),
      memesCount: memesData.total,
      currentPageNumber: memesData.currentPage,
      hasMore: memesData.hasNext,
      hasNextPage: memesData.hasNext,
      hasPrevPage: memesData.hasPrev,
      nextPage: memesData.hasNext ? memesData.currentPage + 1 : null,
      prevPage: memesData.hasPrev ? memesData.currentPage - 1 : null,
    };
  }

  @Get('login')
  @Render('login')
  getLoginPage(@Query('error') error?: string, @Query('success') success?: string) {
    return {
      title: 'Вход в систему',
      currentPage: 'login',
      isAuthenticated: false,
      error: error === 'true' ? 'Неверный логин или пароль' : null,
      errorMessage: this.getErrorMessage(error),
      successMessage: this.getSuccessMessage(success),
    };
  }

  @Get('register')
  @Render('register')
  getRegisterPage(@Query('error') error?: string) {
    return {
      title: 'Регистрация',
      currentPage: 'register',
      isAuthenticated: false,
      errorMessage: this.getErrorMessage(error),
    };
  }

  @Post('auth/login')
  @Redirect('/')
  async postLogin(@Body() body: any, @Session() session: any) {
    const { username, password } = body;

    try {
      const user = await this.usersService.login({
        nickname: username,
        password: password,
      });

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

  @Get('logout')
  @Redirect('/')
  logout(@Session() session: any) {
    if (session) {
      session.destroy();
    }
    return { url: '/?auth=false&success=logout_successful' };
  }

  private getSuccessMessage(success?: string): string | null {
    switch (success) {
      case 'post_created':
        return 'Пост успешно создан!';
      case 'quote_created':
        return 'Цитата успешно добавлена!';
      case 'comment_created':
        return 'Комментарий успешно добавлен!';
      case 'login_successful':
        return 'Добро пожаловать!';
      case 'logout_successful':
        return 'Вы успешно вышли из системы.';
      case 'registration_successful':
        return 'Регистрация прошла успешно!';
      default:
        return null;
    }
  }

  private getErrorMessage(error?: string): string | null {
    switch (error) {
      case 'creation_failed':
        return 'Ошибка при создании. Попробуйте еще раз.';
      case 'comment_creation_failed':
        return 'Ошибка при добавлении комментария.';
      case 'quote_creation_failed':
        return 'Ошибка при добавлении цитаты.';
      case 'invalid_credentials':
        return 'Неверное имя пользователя или пароль.';
      case 'user_exists':
        return 'Пользователь с таким именем уже существует.';
      case 'registration_failed':
        return 'Ошибка при регистрации.';
      default:
        return null;
    }
  }
}