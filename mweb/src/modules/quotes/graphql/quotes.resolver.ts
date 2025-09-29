import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
  ID,
  Int,
} from '@nestjs/graphql';
import { ValidationPipe, UsePipes } from '@nestjs/common';
import { QuotesService } from '../quotes.service';
import { QuoteType } from './quotes.types';
import { UserType } from '../../../common/graphql/user.types';
import { CreateQuoteInput, UpdateQuoteInput, QuoteFiltersInput } from './quotes.inputs';
import { Quote } from '../entities/quote.entity';

@Resolver(() => QuoteType)
export class QuotesResolver {
  constructor(
    private readonly quotesService: QuotesService,
  ) {}

  // ЗАПРОСЫ

  @Query(() => [QuoteType], {
    name: 'quotes',
    description: 'Получить список цитат с фильтрацией'
  })
  async getQuotes(
    @Args('filters', { type: () => QuoteFiltersInput, nullable: true })
    filters?: QuoteFiltersInput,
  ): Promise<QuoteType[]> {
    const quotes = await this.quotesService.findAll(1, 100, {
      genre: filters?.genre,
      author: filters?.author,
      search: filters?.search,
    });

    return quotes.quotes.map(quote => this.mapQuoteToType(quote));
  }

  @Query(() => QuoteType, {
    name: 'quoteById',
    description: 'Получить цитату по ID'
  })
  async getQuoteById(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<QuoteType> {
    const quote = await this.quotesService.findOne(Number(id));
    return this.mapQuoteToType(quote!);
  }

  @Query(() => QuoteType, {
    name: 'randomQuote',
    description: 'Получить случайную цитату'
  })
  async getRandomQuote(): Promise<QuoteType> {
    const quote = await this.quotesService.getRandomQuote();
    if (!quote) {
      throw new Error('Цитаты не найдены');
    }
    return this.mapQuoteToType(quote);
  }

  @Query(() => [QuoteType], {
    name: 'quotesByAuthor',
    description: 'Получить все цитаты конкретного автора'
  })
  async getQuotesByAuthor(
    @Args('author', { type: () => String }) author: string,
  ): Promise<QuoteType[]> {
    const quotes = await this.quotesService.findByAuthor(author);
    return quotes.map(quote => this.mapQuoteToType(quote));
  }

  @Query(() => [QuoteType], {
    name: 'quotesByGenre',
    description: 'Получить все цитаты определенного жанра'
  })
  async getQuotesByGenre(
    @Args('genre', { type: () => String }) genre: string,
  ): Promise<QuoteType[]> {
    const quotes = await this.quotesService.findByGenre(genre as any);
    return quotes.map(quote => this.mapQuoteToType(quote));
  }

  @Query(() => [QuoteType], {
    name: 'quotesByUser',
    description: 'Получить все цитаты, загруженные конкретным пользователем'
  })
  async getQuotesByUser(
    @Args('userId', { type: () => Int }) userId: number,
  ): Promise<QuoteType[]> {
    const quotes = await this.quotesService.findByUser(userId);
    return quotes.map(quote => this.mapQuoteToType(quote));
  }

  // МУТАЦИИ

  @Mutation(() => QuoteType, {
    name: 'createQuote',
    description: 'Создать новую цитату'
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async createQuote(
    @Args('input', { type: () => CreateQuoteInput })
    input: CreateQuoteInput,
  ): Promise<QuoteType> {
    const quote = await this.quotesService.create({
      author: input.author,
      text: input.text,
      genre: input.genre,
      uploader: input.uploader,
    });

    return this.mapQuoteToType(quote);
  }

  @Mutation(() => QuoteType, {
    name: 'updateQuote',
    description: 'Обновить существующую цитату'
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateQuote(
    @Args('id', { type: () => Int }) id: number,
    @Args('input', { type: () => UpdateQuoteInput }) input: UpdateQuoteInput,
  ): Promise<QuoteType> {
    const quote = await this.quotesService.update(id, input);
    return this.mapQuoteToType(quote!);
  }

  @Mutation(() => Boolean, {
    name: 'deleteQuote',
    description: 'Удалить цитату'
  })
  async deleteQuote(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<boolean> {
    await this.quotesService.remove(id);
    return true;
  }

  // FIELD RESOLVERS

  @ResolveField(() => String, { description: 'Название жанра на русском языке' })
  genreName(@Parent() quote: QuoteType): string {
    const quoteEntity = new Quote(quote as any);
    return quoteEntity.getGenreName();
  }

  @ResolveField(() => String, { description: 'Форматированная дата загрузки' })
  formattedUploadedAt(@Parent() quote: QuoteType): string {
    const quoteEntity = new Quote(quote as any);
    return quoteEntity.getFormattedUploadedAt();
  }

  @ResolveField(() => String, { description: 'Имя загрузившего пользователя' })
  uploaderName(@Parent() quote: QuoteType): string {
    const quoteEntity = new Quote(quote as any);
    return quoteEntity.getUploaderName();
  }

  @ResolveField(() => String, { description: 'Полное описание цитаты' })
  fullDescription(@Parent() quote: QuoteType): string {
    const quoteEntity = new Quote(quote as any);
    return quoteEntity.getFullDescription();
  }

  @ResolveField(() => Boolean, { description: 'Была ли цитата загружена недавно' })
  isRecentlyUploaded(@Parent() quote: QuoteType): boolean {
    const quoteEntity = new Quote(quote as any);
    return quoteEntity.isRecentlyUploaded();
  }

  @ResolveField(() => Boolean, { description: 'Прошла ли цитата валидацию' })
  isValid(@Parent() quote: QuoteType): boolean {
    const quoteEntity = new Quote(quote as any);
    return quoteEntity.isValid();
  }

  @ResolveField(() => UserType, { description: 'Информация о пользователе' })
  user(@Parent() quote: QuoteType): UserType {
    return quote.user;
  }

  // ВСПОМОГАТЕЛЬНОЕ

  private mapQuoteToType(quote: Quote): QuoteType {
    return {
      id: quote.id,
      author: quote.author,
      text: quote.text,
      genre: quote.genre,
      userId: quote.userId,
      user: quote.user as UserType,
      uploadedAt: quote.uploadedAt,
      //Заполняются через Field Resolvers
      genreName: '',
      formattedUploadedAt: '',
      uploaderName: '',
      fullDescription: '',
      isRecentlyUploaded: false,
      isValid: false,
    };
  }
}