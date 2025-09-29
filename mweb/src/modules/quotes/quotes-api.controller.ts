import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { QuoteResponseDto } from './dto/quote-response.dto';

@ApiTags('quotes')
@Controller('api/quotes')
export class QuotesApiController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post()
  @ApiOperation({ summary: 'Создать новую цитату' })
  @ApiBody({ type: CreateQuoteDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Цитата успешно создана',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Некорректные данные',
  })
  async create(@Body() createQuoteDto: CreateQuoteDto) {
    const quote = await this.quotesService.create(createQuoteDto);
    return new QuoteResponseDto(quote);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список цитат с пагинацией и фильтрацией' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Номер страницы' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Количество элементов на странице' })
  @ApiQuery({ name: 'genre', required: false, type: String, description: 'Фильтр по жанру (SMART, MOTIVATING, REALISTIC, FUNNY)' })
  @ApiQuery({ name: 'author', required: false, type: String, description: 'Фильтр по автору' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Поиск по тексту цитаты' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Список цитат с пагинацией',
  })
  async findAll(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 12,
    @Query('genre') genre?: string,
    @Query('author') author?: string,
    @Query('search') search?: string,
  ) {
    const filters: any = {};
    if (genre) filters.genre = genre;
    if (author) filters.author = author;
    if (search) filters.search = search;

    return await this.quotesService.findAll(page, limit, filters);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Получить последние цитаты' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Количество цитат' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Список последних цитат',
  })
  async getRecent(@Query('limit', ParseIntPipe) limit: number = 3) {
    return await this.quotesService.findRecentQuotes(limit);
  }

  @Get('stats/by-genre')
  @ApiOperation({ summary: 'Получить статистику цитат по жанрам' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Статистика цитат по жанрам',
  })
  async getStatsByGenre() {
    return await this.quotesService.getQuotesByGenreStats();
  }

  @Get('count')
  @ApiOperation({ summary: 'Получить общее количество цитат' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Общее количество цитат',
  })
  async getCount() {
    const count = await this.quotesService.getTotalCount();
    return { count };
  }

  @Get('authors/count')
  @ApiOperation({ summary: 'Получить количество уникальных авторов' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Количество уникальных авторов',
  })
  async getAuthorsCount() {
    const count = await this.quotesService.getUniqueAuthorsCount();
    return { count };
  }

  @Get('author/:author')
  @ApiOperation({ summary: 'Получить все цитаты конкретного автора' })
  @ApiParam({ name: 'author', type: String, description: 'Имя автора' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Список цитат автора',
  })
  async findByAuthor(@Param('author') author: string) {
    return await this.quotesService.findByAuthor(author);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить цитату по ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID цитаты' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Данные цитаты',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Цитата не найдена',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.quotesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить цитату' })
  @ApiParam({ name: 'id', type: Number, description: 'ID цитаты' })
  @ApiBody({ type: UpdateQuoteDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Цитата успешно обновлена',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Цитата не найдена',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQuoteDto: UpdateQuoteDto,
  ) {
    return await this.quotesService.update(id, updateQuoteDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить цитату' })
  @ApiParam({ name: 'id', type: Number, description: 'ID цитаты' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Цитата успешно удалена',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Цитата не найдена',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.quotesService.remove(id);
    return { message: 'Цитата успешно удалена' };
  }
}