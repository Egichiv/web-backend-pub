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
import { MemesService } from './memes.service';
import { CreateMemeDto } from './dto/create-meme.dto';
import { UpdateMemeDto } from './dto/update-meme.dto';

@ApiTags('memes')
@Controller('api/memes')
export class MemesApiController {
  constructor(private readonly memesService: MemesService) {}

  @Post()
  @ApiOperation({ summary: 'Создать новый мем' })
  @ApiBody({ type: CreateMemeDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Мем успешно создан',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Некорректные данные',
  })
  async create(@Body() createMemeDto: CreateMemeDto) {
    return await this.memesService.create(createMemeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список мемов с пагинацией' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Номер страницы' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Количество элементов на странице' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Список мемов с пагинацией',
  })
  async findAll(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 12,
  ) {
    return await this.memesService.findAll(page, limit);
  }

  @Get('count')
  @ApiOperation({ summary: 'Получить общее количество мемов' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Общее количество мемов',
  })
  async getCount() {
    const count = await this.memesService.getTotalCount();
    return { count };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить мем по ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID мема' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Данные мема',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Мем не найден',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.memesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить мем' })
  @ApiParam({ name: 'id', type: Number, description: 'ID мема' })
  @ApiBody({ type: UpdateMemeDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Мем успешно обновлен',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Мем не найден',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMemeDto: UpdateMemeDto,
  ) {
    return await this.memesService.update(id, updateMemeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить мем' })
  @ApiParam({ name: 'id', type: Number, description: 'ID мема' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Мем успешно удален',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Мем не найден',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.memesService.remove(id);
    return { message: 'Мем успешно удален' };
  }
}