import {
  Controller,
  Get,
  Post,
  Render,
  Query,
  Body,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Param,
  Redirect,
} from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Главная страница
  @Get()
  @Render('index')
  getIndexPage(@Query('auth') auth?: string) {
    // Временные данные для тестирования
    const isAuthenticated = auth === 'true';

    return {
      title: 'Главная',
      currentPage: 'home',
      isMainPage: true,
      isAuthenticated,
      username: isAuthenticated ? 'Администратор' : null,
      posts: [
        {
          id: 1,
          title: 'Добро пожаловать на обновленный сайт!',
          text: 'Мы рады представить вам новую версию сайта с улучшенным дизайном и функциональностью.',
        },
        {
          id: 2,
          title: 'Новая функция: добавление цитат',
          text: 'Теперь каждый пользователь может предложить свою любимую цитату для публикации на сайте.',
        },
      ],
      latestQuotes: [
        {
          text: 'Жизнь — это то, что происходит с тобой, пока ты строишь планы.',
          author: 'Джон Леннон',
        },
        {
          text: 'В конце концов, все будет хорошо. Если все плохо, значит это еще не конец.',
          author: 'Пауло Коэльо',
        },
      ],
    };
  }

  // Страница поиска цитат
  @Get('quotes')
  @Render('quotes')
  getQuotesPage(
    @Query('auth') auth?: string,
    @Query('search') search?: string,
    @Query('author') author?: string,
    @Query('genre') genre?: string,
    @Query('sort') sort?: string,
    @Query('page') page: string = '1',
  ) {
    const isAuthenticated = auth === 'true';
    const currentPage = parseInt(page);

    // Временные данные для тестирования
    const allQuotes = [
      {
        id: 1,
        author: 'Альберт Эйнштейн',
        text: 'Воображение важнее знания.',
        genre: 'Умная',
        date: new Date('2024-01-15'),
      },
      {
        id: 2,
        author: 'Стив Джобс',
        text: 'Оставайтесь голодными, оставайтесь безрассудными.',
        genre: 'Мотивирующая',
        date: new Date('2024-01-16'),
      },
      {
        id: 3,
        author: 'Марк Твен',
        text: 'Бросить курить легко. Я сам бросал тысячу раз.',
        genre: 'Смешная',
        date: new Date('2024-01-17'),
      },
      {
        id: 4,
        author: 'Конфуций',
        text: 'Выберите себе работу по душе, и вам не придется работать ни одного дня в своей жизни.',
        genre: 'Мотивирующая',
        date: new Date('2024-01-18'),
      },
      {
        id: 5,
        author: 'Оскар Уайльд',
        text: 'Будь собой. Остальные роли уже заняты.',
        genre: 'Реалистичная',
        date: new Date('2024-01-19'),
      },
    ];

    // Простая фильтрация
    let filteredQuotes = allQuotes;
    if (search) {
      filteredQuotes = filteredQuotes.filter((q) =>
        q.text.toLowerCase().includes(search.toLowerCase()),
      );
    }
    if (author) {
      filteredQuotes = filteredQuotes.filter((q) =>
        q.author.toLowerCase().includes(author.toLowerCase()),
      );
    }
    if (genre) {
      const genreMap: Record<string, string> = {
        smart: 'Умная',
        motivating: 'Мотивирующая',
        realistic: 'Реалистичная',
        funny: 'Смешная',
      };
      filteredQuotes = filteredQuotes.filter(
        (q) => q.genre === genreMap[genre],
      );
    }

    const itemsPerPage = 3;
    const totalPages = Math.ceil(filteredQuotes.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedQuotes = filteredQuotes.slice(
      startIndex,
      startIndex + itemsPerPage,
    );

    return {
      title: 'Поиск цитат',
      currentPage: 'quotes',
      isAuthenticated,
      username: isAuthenticated ? 'Администратор' : null,
      quotes: paginatedQuotes,
      quotesCount: filteredQuotes.length,
      searchQuery: search,
      authorFilter: author,
      genreFilter: genre,
      sortBy: sort || 'date_desc',
      hasPagination: totalPages > 1,
      hasPrevPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
      prevPage: currentPage - 1,
      nextPage: currentPage + 1,
      totalPages,
    };
  }

  // Страница добавления цитаты
  @Get('addQuote')
  @Render('addQuote')
  getAddQuotePage(@Query('auth') auth?: string) {
    const isAuthenticated = auth === 'true';

    return {
      title: 'Добавить цитату',
      currentPage: 'addQuote',
      isAuthenticated,
      username: isAuthenticated ? 'Администратор' : null,
      userQuotes: isAuthenticated
        ? [
            {
              text: 'Тестовая цитата 1',
              author: 'Автор 1',
              status: 'published',
            },
            { text: 'Тестовая цитата 2', author: 'Автор 2', status: 'pending' },
          ]
        : [],
    };
  }

  // Страница "О сайте"
  @Get('about')
  @Render('about')
  getAboutPage(
    @Query('auth') auth?: string,
    @Query('page') page: string = '1',
  ) {
    const isAuthenticated = auth === 'true';
    const currentPage = parseInt(page);

    // Временные данные
    const allComments = [
      {
        id: 1,
        author: 'Иван',
        text: 'Отличный сайт! Много интересных цитат.',
        date: new Date('2024-01-20'),
      },
      {
        id: 2,
        author: 'Мария',
        text: 'Удобный поиск и красивый дизайн.',
        date: new Date('2024-01-21'),
      },
      {
        id: 3,
        author: 'Петр',
        text: 'Спасибо за вдохновляющие цитаты!',
        date: new Date('2024-01-22'),
      },
      {
        id: 4,
        author: 'Анна',
        text: 'Каждый день захожу за новой порцией мудрости.',
        date: new Date('2024-01-23'),
      },
    ];

    const itemsPerPage = 3;
    const totalPages = Math.ceil(allComments.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedComments = allComments.slice(
      startIndex,
      startIndex + itemsPerPage,
    );

    return {
      title: 'О сайте',
      currentPage: 'about',
      isAuthenticated,
      username: isAuthenticated ? 'Администратор' : null,
      comments: paginatedComments,
      commentsCount: allComments.length,
      stats: {
        totalQuotes: 1250,
        totalAuthors: 380,
        totalUsers: 42,
        totalComments: allComments.length,
      },
      hasPagination: totalPages > 1,
      hasPrevPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
      prevPage: currentPage - 1,
      nextPage: currentPage + 1,
      totalPages,
    };
  }

  // Страница с мемами
  @Get('memes')
  @Render('memes')
  getMemesPage(@Query('auth') auth?: string) {
    const isAuthenticated = auth === 'true';

    return {
      title: 'Мемы',
      currentPage: 'memes',
      isAuthenticated,
      username: isAuthenticated ? 'Администратор' : null,
      memes: [
        {
          id: 1,
          url: '/images/meme1.jpg',
          alt: 'Мем про программирование',
          caption: 'Когда код работает с первого раза',
        },
        {
          id: 2,
          url: '/images/meme2.jpg',
          alt: 'Мем про дедлайны',
          caption: 'Дедлайн был вчера',
        },
        {
          id: 3,
          url: '/images/meme3.jpg',
          alt: 'Мем про баги',
          caption: 'Это не баг, это фича',
        },
      ],
      memesCount: 3,
      viewsCount: 1337,
      lastUpdate: '19 января 2024',
      hasMore: false,
    };
  }

  // Страница авторизации
  @Get('login')
  @Render('login')
  getLoginPage(@Query('error') error?: string) {
    return {
      title: 'Вход в систему',
      currentPage: 'login',
      isAuthenticated: false,
      error: error === 'true' ? 'Неверный логин или пароль' : null,
      redirectUrl: '/',
    };
  }

  // Обработка формы авторизации (простейшая реализация)
  @Post('auth/login')
  @Redirect('/')
  postLogin(@Body() body: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { username, password } = body;

    // Простейшая проверка для демо
    if (username === 'admin' && password === 'admin') {
      // В реальном приложении здесь должна быть работа с сессиями
      return { url: '/?auth=true' };
    } else {
      return { url: '/login?error=true' };
    }
  }

  // Выход из системы
  @Get('logout')
  @Redirect('/')
  logout() {
    return { url: '/?auth=false' };
  }

  // Заглушки для POST запросов
  @Post('posts/create')
  @Redirect('/')
  createPost(@Body() body: any) {
    console.log('Creating post:', body);
    return { url: '/?auth=true&success=post_created' };
  }

  @Post('quotes/create')
  @Redirect('/addQuote')
  createQuote(@Body() body: any) {
    console.log('Creating quote:', body);
    return { url: '/addQuote?auth=true&success=quote_created' };
  }

  @Post('comments/create')
  @Redirect('/about')
  createComment(@Body() body: any) {
    console.log('Creating comment:', body);
    return { url: '/about?auth=true&success=comment_created' };
  }
}
