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
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserStatsResponseDto } from './dto/user-stats-response-dto';

@ApiTags('users')
@Controller('api/users')
export class UsersApiController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Создать нового пользователя' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Пользователь успешно создан',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Некорректные данные',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Пользователь с таким nickname уже существует',
  })
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return new UserResponseDto(user);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список пользователей с пагинацией' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Номер страницы' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Количество элементов на странице' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Список пользователей с пагинацией',
  })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    return await this.usersService.findAll(pageNum, limitNum);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить пользователя по ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID пользователя' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Данные пользователя',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Пользователь не найден',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    return new UserResponseDto(user);
  }

  @Get(':id/content')
  @ApiOperation({ summary: 'Получить весь контент пользователя (посты, цитаты, мемы, комментарии)' })
  @ApiParam({ name: 'id', type: Number, description: 'ID пользователя' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Контент пользователя',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Пользователь не найден',
  })
  async getUserContent(@Param('id', ParseIntPipe) id: number) {

    return await this.usersService.getUserWithContent(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Получить статистику пользователя' })
  @ApiParam({ name: 'id', type: Number, description: 'ID пользователя' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Статистика пользователя',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Пользователь не найден',
  })
  async getUserStats(@Param('id', ParseIntPipe) id: number) {
    const stats = await this.usersService.getUserStats(id);
    return new UserStatsResponseDto(stats);
  }

  @Get(':id/comments')
  @ApiOperation({ summary: 'Получить все комментарии пользователя' })
  @ApiParam({ name: 'id', type: Number, description: 'ID пользователя' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Комментарии пользователя',
  })
  async getUserComments(@Param('id', ParseIntPipe) id: number) {
    const userWithContent = await this.usersService.getUserWithContent(id);
    return userWithContent?.recentComments || [];
  }

  @Get(':id/quotes')
  @ApiOperation({ summary: 'Получить все цитаты пользователя' })
  @ApiParam({ name: 'id', type: Number, description: 'ID пользователя' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Цитаты пользователя',
  })
  async getUserQuotes(@Param('id', ParseIntPipe) id: number) {
    const userWithContent = await this.usersService.getUserWithContent(id);
    return userWithContent?.recentQuotes || [];
  }

  @Get(':id/memes')
  @ApiOperation({ summary: 'Получить все мемы пользователя' })
  @ApiParam({ name: 'id', type: Number, description: 'ID пользователя' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Мемы пользователя',
  })
  async getUserMemes(@Param('id', ParseIntPipe) id: number) {
    const userWithContent = await this.usersService.getUserWithContent(id);
    return userWithContent?.recentMemes || [];
  }

  @Get(':id/posts')
  @ApiOperation({ summary: 'Получить все посты пользователя' })
  @ApiParam({ name: 'id', type: Number, description: 'ID пользователя' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Посты пользователя',
  })
  async getUserPosts(@Param('id', ParseIntPipe) id: number) {
    const userWithContent = await this.usersService.getUserWithContent(id);
    return userWithContent?.recentPosts || [];
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить данные пользователя' })
  @ApiParam({ name: 'id', type: Number, description: 'ID пользователя' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Пользователь успешно обновлен',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Пользователь не найден',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Пользователь с таким nickname уже существует',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить пользователя' })
  @ApiParam({ name: 'id', type: Number, description: 'ID пользователя' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Пользователь успешно удален',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Пользователь не найден',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.usersService.remove(id);
    return { message: 'Пользователь успешно удален' };
  }
}