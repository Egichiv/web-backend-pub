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
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';
import { CacheOneHour } from '../../common/decorators/cache-control.decorator';

@ApiTags('comments')
@Controller('api/comments')
export class CommentsApiController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ApiOperation({ summary: 'Создать новый комментарий' })
  @ApiBody({ type: CreateCommentDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Комментарий успешно создан',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Некорректные данные',
  })
  async create(@Body() createCommentDto: CreateCommentDto) {
    const comment = await this.commentsService.create(createCommentDto);
    return new CommentResponseDto(comment);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список комментариев с пагинацией' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Номер страницы' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Количество элементов на странице' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Список комментариев с пагинацией',
  })
  async findAll(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    const result = await this.commentsService.findAll(page, limit);
    return {
      ...result,
      comments: result.comments.map(c => new CommentResponseDto(c)),
    };
  }

  @Get('count')
  @ApiOperation({ summary: 'Получить общее количество комментариев' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Общее количество комментариев',
  })
  async getCount() {
    const count = await this.commentsService.getTotalCount();
    return { count };
  }

  @Get(':id')
  @CacheOneHour()
  @ApiOperation({ summary: 'Получить комментарий по ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID комментария' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Данные комментария',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Комментарий не найден',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const comment = await this.commentsService.findOne(id);
    return new CommentResponseDto(comment);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить комментарий' })
  @ApiParam({ name: 'id', type: Number, description: 'ID комментария' })
  @ApiBody({ type: UpdateCommentDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Комментарий успешно обновлен',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Комментарий не найден',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return await this.commentsService.update(id, updateCommentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить комментарий' })
  @ApiParam({ name: 'id', type: Number, description: 'ID комментария' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Комментарий успешно удален',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Комментарий не найден',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.commentsService.remove(id);
    return { message: 'Комментарий успешно удален' };
  }
}