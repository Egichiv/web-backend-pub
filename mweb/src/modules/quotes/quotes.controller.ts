// mweb/src/modules/quotes/quotes.controller.ts
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
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { Genre } from '@prisma/client';

@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  // POST /quotes/create - создание цитаты (обычно из формы /addQuote)
  @Post('create')
  @Redirect('/addQuote')
  async create(@Body() createQuoteDto: CreateQuoteDto) {
    try {
      await this.quotesService.create(createQuoteDto);
      return { url: '/addQuote?success=quote_created' };
    } catch (error) {
      return { url: '/addQuote?error=quote_creation_failed' };
    }
  }

  // GET /quotes - главная страница цитат
  @Get()
  @Render('quotes/index')
  async findAll(
    @Query('page') page?: string,
    @Query('genre') genre?: string,
    @Query('author') author?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
    @Query('auth') auth?: string,
    @Query('success') success?: string,
    @Query('error') error?: string,
  ) {
    let pageNumber = 1;
    if (page != null) {
      pageNumber = parseInt(page) || 1;
    }
    const isAuthenticated = auth === 'true';

    // Подготавливаем фильтры
    const filters: any = {};
    if (genre && Object.values(Genre).includes(genre as Genre)) {
      filters.genre = genre as Genre;
    }
    if (author) {
      filters.author = author;
    }
    if (search) {
      filters.search = search;
    }
    if (sort) {
      filters.sort = sort;
    }

    const result = await this.quotesService.findAll(pageNumber, 12, filters); // 12 цитат на страницу
    const genreStats = await this.quotesService.getQuotesByGenreStats();

    return {
      title: 'Поиск цитат',
      currentPage: 'quotes',
      isAuthenticated,
      username: isAuthenticated ? 'Администратор' : null,
      successMessage: this.getSuccessMessage(success),
      errorMessage: this.getErrorMessage(error),
      quotes: result.quotes.map(quote => ({
        id: quote.id,
        author: quote.author,
        text: quote.text,
        genre: quote.genre,
        genreName: quote.getGenreName(),
        uploadedAt: quote.uploadedAt,
        uploader: quote.getUploaderName(),
        preview: quote.getPreview(200),
        fullDescription: quote.getFullDescription(),
        isRecentlyUploaded: quote.isRecentlyUploaded(),
      })),
      total: result.total,
      currentPageNumber: result.currentPage,
      totalPages: result.totalPages,
      hasNextPage: result.hasNext,
      hasPrevPage: result.hasPrev,
      nextPage: result.hasNext ? result.currentPage + 1 : null,
      prevPage: result.hasPrev ? result.currentPage - 1 : null,
      hasPagination: result.totalPages > 1,

      selectedGenre: genre || '',
      selectedAuthor: author || '',
      searchTerm: search || '',
      selectedSort: sort || 'id_desc',
      genreOptions: [
        { value: '', name: 'Все жанры' },
        { value: 'SMART', name: 'Умные' },
        { value: 'MOTIVATING', name: 'Мотивирующие' },
        { value: 'REALISTIC', name: 'Реалистичные' },
        { value: 'FUNNY', name: 'Смешные' },
      ],
      genreStats,

      filterParams: this.buildFilterParams({ genre, author, search, sort }),
    };
  }

  // GET /quotes/add - форма добавления цитаты
  @Get('add')
  @Render('quotes/create')
  addForm(@Query('auth') auth?: string) {
    const isAuthenticated = auth === 'true';
    return {
      title: 'Добавить цитату',
      currentPage: 'quotes',
      isAuthenticated,
      username: isAuthenticated ? 'Администратор' : null,
      genreOptions: [
        { value: 'SMART', name: 'Умная' },
        { value: 'MOTIVATING', name: 'Мотивирующая' },
        { value: 'REALISTIC', name: 'Реалистичная' },
        { value: 'FUNNY', name: 'Смешная' },
      ],
    };
  }

  // GET /quotes/random - случайная цитата
  @Get('random')
  @Render('quotes/random')
  async findRandom(@Query('auth') auth?: string) {
    const randomQuote = await this.quotesService.getRandomQuote();
    const isAuthenticated = auth === 'true';

    return {
      title: 'Случайная цитата',
      currentPage: 'quotes',
      isAuthenticated,
      username: isAuthenticated ? 'Администратор' : null,
      quote: randomQuote ? {
        id: randomQuote.id,
        author: randomQuote.author,
        text: randomQuote.text,
        genre: randomQuote.genre,
        genreName: randomQuote.getGenreName(),
        formattedDate: randomQuote.getFormattedUploadedAt(),
        uploader: randomQuote.getUploaderName(),
        fullDescription: randomQuote.getFullDescription(),
      } : null,
    };
  }

  // GET /quotes/genre/:genre - цитаты определенного жанра
  @Get('genre/:genre')
  @Render('quotes/genre')
  async findByGenre(@Param('genre') genre: string, @Query('auth') auth?: string) {
    if (!Object.values(Genre).includes(genre as Genre)) {
      throw new HttpException('Недопустимый жанр', HttpStatus.BAD_REQUEST);
    }

    const quotes = await this.quotesService.findByGenre(genre as Genre);
    const isAuthenticated = auth === 'true';

    // Создаем временный объект для получения названия жанра
    const tempQuote = { genre: genre as Genre, getGenreName: () => {
        const genreMap = {
          [Genre.SMART]: 'Умные',
          [Genre.MOTIVATING]: 'Мотивирующие',
          [Genre.REALISTIC]: 'Реалистичные',
          [Genre.FUNNY]: 'Смешные',
        };
        return genreMap[genre as Genre] || 'Неизвестный жанр';
      }};

    return {
      title: `${tempQuote.getGenreName()} цитаты`,
      currentPage: 'quotes',
      isAuthenticated,
      username: isAuthenticated ? 'Администратор' : null,
      quotes: quotes.map(quote => ({
        id: quote.id,
        author: quote.author,
        text: quote.text,
        genre: quote.genre,
        genreName: quote.getGenreName(),
        formattedDate: quote.getFormattedUploadedAt(),
        uploader: quote.getUploaderName(),
        preview: quote.getPreview(150),
      })),
      quotesCount: quotes.length,
      genreName: tempQuote.getGenreName(),
      selectedGenre: genre,
    };
  }

  // GET /quotes/:id - просмотр отдельной цитаты
  @Get(':id')
  @Render('quotes/show')
  async findOne(@Param('id') id: string, @Query('auth') auth?: string) {
    const quote = await this.quotesService.findOne(+id);

    if (!quote) {
      throw new HttpException('Цитата не найдена', HttpStatus.NOT_FOUND);
    }

    const isAuthenticated = auth === 'true';

    return {
      title: `Цитата от ${quote.author}`,
      currentPage: 'quotes',
      isAuthenticated,
      username: isAuthenticated ? 'Администратор' : null,
      quote: {
        id: quote.id,
        author: quote.author,
        text: quote.text,
        genre: quote.genre,
        genreName: quote.getGenreName(),
        uploadedAt: quote.uploadedAt,
        formattedDate: quote.getFormattedUploadedAt(),
        uploader: quote.getUploaderName(),
        fullDescription: quote.getFullDescription(),
        isRecentlyUploaded: quote.isRecentlyUploaded(),
        isValid: quote.isValid(),
      },
    };
  }

  // GET /quotes/:id/edit - форма редактирования цитаты
  @Get(':id/edit')
  @Render('quotes/edit')
  async editForm(@Param('id') id: string, @Query('auth') auth?: string) {
    const quote = await this.quotesService.findOne(+id);

    if (!quote) {
      throw new HttpException('Цитата не найдена', HttpStatus.NOT_FOUND);
    }

    const isAuthenticated = auth === 'true';

    return {
      title: 'Редактировать цитату',
      currentPage: 'quotes',
      isAuthenticated,
      username: isAuthenticated ? 'Администратор' : null,
      quote: {
        id: quote.id,
        author: quote.author,
        text: quote.text,
        genre: quote.genre,
        uploader: quote.getUploaderName(),
      },
      genreOptions: [
        { value: 'SMART', name: 'Умная' },
        { value: 'MOTIVATING', name: 'Мотивирующая' },
        { value: 'REALISTIC', name: 'Реалистичная' },
        { value: 'FUNNY', name: 'Смешная' },
      ],
    };
  }

  // PATCH /quotes/:id - обновление цитаты
  @Patch(':id')
  @Redirect()
  async update(
    @Param('id') id: string,
    @Body() updateQuoteDto: UpdateQuoteDto
  ) {
    try {
      await this.quotesService.update(+id, updateQuoteDto);
      return { url: `/quotes/${id}?success=quote_updated` };
    } catch (error) {
      return { url: `/quotes/${id}/edit?error=update_failed` };
    }
  }

  // DELETE /quotes/:id - удаление цитаты
  @Delete(':id')
  @Redirect('/quotes')
  async remove(@Param('id') id: string) {
    try {
      await this.quotesService.remove(+id);
      return { url: '/quotes?success=quote_deleted' };
    } catch (error) {
      return { url: '/quotes?error=delete_failed' };
    }
  }

  // GET /quotes/author/:author - цитаты конкретного автора
  @Get('author/:author')
  @Render('quotes/author')
  async findByAuthor(@Param('author') author: string, @Query('auth') auth?: string) {
    const quotes = await this.quotesService.findByAuthor(author);
    const isAuthenticated = auth === 'true';

    return {
      title: `Цитаты ${author}`,
      currentPage: 'quotes',
      isAuthenticated,
      username: isAuthenticated ? 'Администратор' : null,
      quotes: quotes.map(quote => ({
        id: quote.id,
        author: quote.author,
        text: quote.text,
        genre: quote.genre,
        genreName: quote.getGenreName(),
        formattedDate: quote.getFormattedUploadedAt(),
        uploader: quote.getUploaderName(),
        preview: quote.getPreview(150),
      })),
      quotesCount: quotes.length,
      authorName: author,
    };
  }

  // GET /quotes/user/:userId - цитаты конкретного пользователя
  @Get('user/:userId')
  @Render('quotes/user')
  async findByUser(@Param('userId') userId: string, @Query('auth') auth?: string) {
    const userQuotes = await this.quotesService.findByUser(+userId);
    const isAuthenticated = auth === 'true';

    return {
      title: 'Цитаты пользователя',
      currentPage: 'quotes',
      isAuthenticated,
      username: isAuthenticated ? 'Администратор' : null,
      quotes: userQuotes.map(quote => ({
        id: quote.id,
        author: quote.author,
        text: quote.text,
        genre: quote.genre,
        genreName: quote.getGenreName(),
        formattedDate: quote.getFormattedUploadedAt(),
        uploader: quote.getUploaderName(),
        preview: quote.getPreview(100),
      })),
      quotesCount: userQuotes.length,
      uploaderName: userQuotes.length > 0 ? userQuotes[0].getUploaderName() : 'Пользователь',
    };
  }

  private getSuccessMessage(success?: string): string | null {
    switch (success) {
      case 'quote_created':
        return 'Цитата успешно добавлена!';
      case 'quote_updated':
        return 'Цитата успешно обновлена!';
      case 'quote_deleted':
        return 'Цитата успешно удалена!';
      default:
        return null;
    }
  }

  private getErrorMessage(error?: string): string | null {
    switch (error) {
      case 'quote_creation_failed':
        return 'Ошибка при добавлении цитаты.';
      case 'update_failed':
        return 'Ошибка при обновлении цитаты.';
      case 'delete_failed':
        return 'Ошибка при удалении цитаты.';
      default:
        return null;
    }
  }

  private buildFilterParams(filters: { genre?: string; author?: string; search?: string; sort?: string }): string {
    const params = new URLSearchParams();
    if (filters.genre) params.append('genre', filters.genre);
    if (filters.author) params.append('author', filters.author);
    if (filters.search) params.append('search', filters.search);
    if (filters.sort) params.append('sort', filters.sort);
    return params.toString();
  }
}