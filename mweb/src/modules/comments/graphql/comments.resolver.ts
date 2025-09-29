import { Resolver, Query, Mutation, Args, ResolveField, Parent, Int, ID } from '@nestjs/graphql';
import { ValidationPipe, UsePipes } from '@nestjs/common';
import { CommentsService } from '../comments.service';
import { CommentType} from './comments.types';
import { UserType } from '../../../common/graphql/user.types';
import { CreateCommentInput, UpdateCommentInput } from './comments.inputs';
import { Comment } from '../entities/comment.entity';

@Resolver(() => CommentType)
export class CommentsResolver {
  constructor(
    private readonly commentsService: CommentsService,
  ) {}

  // ЗАПРОСЫ

  @Query(() => [CommentType], {
    name: 'comments',
    description: 'Получить список комментариев с пагинацией'
  })
  async getComments(
    @Args('page', { type: () => Int, defaultValue: 1, nullable: true }) page: number = 1,
    @Args('limit', { type: () => Int, defaultValue: 10, nullable: true }) limit: number = 10,
  ): Promise<CommentType[]> {
    const result = await this.commentsService.findAll(page, limit);
    return result.comments.map(comment => this.mapCommentToType(comment));
  }

  @Query(() => CommentType, {
    name: 'commentById',
    description: 'Получить комментарий по ID'
  })
  async getCommentById(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<CommentType> {
    const comment = await this.commentsService.findOne(id);
    if (!comment) {
      throw new Error('Комментарий не найден');
    }
    return this.mapCommentToType(comment);
  }

  @Query(() => Int, {
    name: 'commentsCount',
    description: 'Получить общее количество комментариев'
  })
  async getCommentsCount(): Promise<number> {
    return await this.commentsService.getTotalCount();
  }

  @Query(() => [CommentType], {
    name: 'recentComments',
    description: 'Получить последние комментарии'
  })
  async getRecentComments(
    @Args('limit', { type: () => Int, defaultValue: 5, nullable: true }) limit: number = 5,
  ): Promise<CommentType[]> {
    const result = await this.commentsService.findAll(1, limit);
    return result.comments.map(comment => this.mapCommentToType(comment));
  }

  // МУТАЦИИ

  @Mutation(() => CommentType, {
    name: 'createComment',
    description: 'Создать новый комментарий'
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async createComment(
    @Args('input', { type: () => CreateCommentInput })
    input: CreateCommentInput,
  ): Promise<CommentType> {
    const comment = await this.commentsService.create({
      text: input.text,
      author: input.author,
    });

    return this.mapCommentToType(comment);
  }

  @Mutation(() => CommentType, {
    name: 'updateComment',
    description: 'Обновить существующий комментарий'
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateComment(
    @Args('id', { type: () => Int }) id: number,
    @Args('input', { type: () => UpdateCommentInput }) input: UpdateCommentInput,
  ): Promise<CommentType> {
    const comment = await this.commentsService.update(id, input);
    if (!comment) {
      throw new Error('Комментарий не найден');
    }
    return this.mapCommentToType(comment);
  }

  @Mutation(() => Boolean, {
    name: 'deleteComment',
    description: 'Удалить комментарий'
  })
  async deleteComment(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<boolean> {
    await this.commentsService.remove(id);
    return true;
  }

  // FIELD RESOLVERS

  @ResolveField(() => String, { description: 'Форматированная дата создания' })
  formattedCreatedAt(@Parent() comment: CommentType): string {
    const commentEntity = new Comment(comment as any);
    return commentEntity.getFormattedCreatedAt();
  }

  @ResolveField(() => String, { description: 'Имя автора комментария' })
  authorName(@Parent() comment: CommentType): string {
    const commentEntity = new Comment(comment as any);
    return commentEntity.getAuthorName();
  }

  @ResolveField(() => Boolean, { description: 'Был ли комментарий создан недавно' })
  isRecent(@Parent() comment: CommentType): boolean {
    const commentEntity = new Comment(comment as any);
    return commentEntity.isRecent();
  }

  @ResolveField(() => Boolean, { description: 'Валиден ли текст комментария' })
  isValidText(@Parent() comment: CommentType): boolean {
    const commentEntity = new Comment(comment as any);
    return commentEntity.isValidText();
  }

  @ResolveField(() => UserType, { description: 'Информация о пользователе' })
  user(@Parent() comment: CommentType): UserType {
    return comment.user;
  }

  // ВСПОМОГАТЕЛЬНОЕ

  private mapCommentToType(comment: Comment): CommentType {
    return {
      id: comment.id,
      text: comment.text,
      userId: comment.userId,
      user: comment.user as UserType,
      createdAt: comment.createdAt,
      //Заполняются через Field Resolvers
      formattedCreatedAt: '',
      authorName: '',
      isRecent: false,
      isValidText: false,
    };
  }
}