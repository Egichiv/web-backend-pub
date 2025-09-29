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
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  // POST /comments/create - создание комментария (из формы на /about)
  @Post('create')
  @Redirect('/about')
  async create(@Body() createCommentDto: CreateCommentDto) {
    try {
      await this.commentsService.create(createCommentDto);
      return { url: '/about?success=comment_created' };
    } catch (error) {
      return { url: '/about?error=comment_creation_failed' };
    }
  }

  // GET /comments - страница со всеми комментариями
  @Get()
  @Render('about')
  async findAll(@Query('page') page?: string) {
    let pageNumber = 1;
    if (page != null) {
      pageNumber = parseInt(page) || 1;
    }
    const result = await this.commentsService.findAll(pageNumber, 10);

    return {
      title: 'Все комментарии',
      currentPage: 'comments',
      ...result,
      nextPage: result.hasNext ? result.currentPageNumber + 1 : null,
      prevPage: result.hasPrev ? result.currentPageNumber - 1 : null,
      hasPagination: result.totalPages > 1,
    };
  }

  // GET /comments/:id - просмотр отдельного комментария
  @Get(':id')
  @Render('comments/show')
  async findOne(@Param('id') id: string) {
    const comment = await this.commentsService.findOne(+id);

    if (!comment) {
      throw new HttpException('Комментарий не найден', HttpStatus.NOT_FOUND);
    }

    return {
      title: 'Комментарий',
      currentPage: 'comments',
      comment,
    };
  }

  // GET /comments/:id/edit - форма редактирования комментария
  @Get(':id/edit')
  @Render('comments/edit')
  async editForm(@Param('id') id: string) {
    const comment = await this.commentsService.findOne(+id);

    if (!comment) {
      throw new HttpException('Комментарий не найден', HttpStatus.NOT_FOUND);
    }

    return {
      title: 'Редактировать комментарий',
      currentPage: 'comments',
      comment,
    };
  }

  // PATCH /comments/:id - обновление комментария
  @Patch(':id')
  @Redirect()
  async update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto
  ) {
    try {
      await this.commentsService.update(+id, updateCommentDto);
      return { url: `/comments/${id}?success=comment_updated` };
    } catch (error) {
      return { url: `/comments/${id}/edit?error=update_failed` };
    }
  }

  // DELETE /comments/:id - удаление комментария
  @Delete(':id')
  @Redirect('/comments')
  async remove(@Param('id') id: string) {
    try {
      await this.commentsService.remove(+id);
      return { url: '/comments?success=comment_deleted' };
    } catch (error) {
      return { url: '/comments?error=delete_failed' };
    }
  }
}