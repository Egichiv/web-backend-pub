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
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostResponseDto } from './dto/post-response.dto';

@ApiTags('posts')
@Controller('api/posts')
export class PostsApiController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @ApiOperation({ summary: 'Создать новый пост' })
  @ApiBody({ type: CreatePostDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Пост успешно создан',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Некорректные данные',
  })
  async create(@Body() createPostDto: CreatePostDto) {
    const post = await this.postsService.create(createPostDto);
    return new PostResponseDto(post);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список постов с пагинацией' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Номер страницы' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Количество элементов на странице' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Список постов с пагинацией',
  })
  async findAll(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    const result = await this.postsService.findAll(page, limit);
    return {
      ...result,
      posts: result.posts.map(p => new PostResponseDto(p)),
    };
  }

  @Get('recent')
  @ApiOperation({ summary: 'Получить последние посты' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Количество постов' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Список последних постов',
  })
  async getRecent(@Query('limit', ParseIntPipe) limit: number = 3) {
    const posts = await this.postsService.findRecentPosts(limit);
    return posts.map(p => new PostResponseDto(p));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить пост по ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID поста' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Данные поста',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Пост не найден',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.postsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить пост' })
  @ApiParam({ name: 'id', type: Number, description: 'ID поста' })
  @ApiBody({ type: UpdatePostDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Пост успешно обновлен',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Пост не найден',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return await this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить пост' })
  @ApiParam({ name: 'id', type: Number, description: 'ID поста' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Пост успешно удален',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Пост не найден',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.postsService.remove(id);
    return { message: 'Пост успешно удален' };
  }
}