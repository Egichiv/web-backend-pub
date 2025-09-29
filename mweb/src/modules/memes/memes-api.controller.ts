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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { MemesService } from './memes.service';
import { CreateMemeDto } from './dto/create-meme.dto';
import { UpdateMemeDto } from './dto/update-meme.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from '../../s3/s3.service';
import { MemeResponseDto } from './dto/meme-response.dto';

@ApiTags('memes')
@Controller('api/memes')
export class MemesApiController {
  constructor(private readonly memesService: MemesService,
              private readonly s3Service: S3Service,) {}

  @Post('upload')
  @ApiOperation({ summary: 'Загрузить мем с файлом картинки' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Файл картинки (JPG, PNG, GIF, WEBP)',
        },
        uploader: {
          type: 'string',
          description: 'Имя загрузившего (опционально)',
        },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadMeme(
    @UploadedFile() file: Express.Multer.File,
    @Body('uploader') uploader?: string,
  ) {
    // Валидация файла
    if (!file) {
      throw new BadRequestException('Файл не загружен');
    }

    // Проверка MIME типа
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Недопустимый формат файла. Разрешены: JPG, PNG, GIF, WEBP',
      );
    }

    // Проверка размера (5MB максимум)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('Файл слишком большой. Максимальный размер: 5MB');
    }

    // Генерируем уникальное имя файла
    const fileExtension = file.originalname.split('.').pop();
    const uniqueFileName = `${crypto.randomUUID()}.${fileExtension}`;
    const key = `memes/${uniqueFileName}`;

    // Загружаем в S3
    await this.s3Service.upload(file.buffer, key, file.mimetype);

    // Получаем публичный URL
    const imageUrl = this.s3Service.publicUrl(key);

    if (!imageUrl) {
      throw new BadRequestException('Не удалось получить публичный URL файла');
    }

    // Сохраняем мем в БД с URL из S3
    const meme = await this.memesService.create({
      link: imageUrl,
      uploader: uploader || 'anonymous',
    });

    return {
      message: 'Мем успешно загружен',
      meme: new MemeResponseDto(meme),
    };
  }

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