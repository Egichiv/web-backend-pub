// mweb/src/modules/memes/memes.controller.ts
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
import { MemesService } from './memes.service';
import { CreateMemeDto } from './dto/create-meme.dto';
import { UpdateMemeDto } from './dto/update-meme.dto';

@Controller('memes')
export class MemesController {
  constructor(private readonly memesService: MemesService) {}

  // POST /memes/create - создание мема
  @Post('create')
  @Redirect('/memes')
  async create(@Body() createMemeDto: CreateMemeDto) {
    try {
      await this.memesService.create(createMemeDto);
      return { url: '/memes?success=meme_created' };
    } catch (error) {
      return { url: '/memes?error=meme_creation_failed' };
    }
  }

  // GET /memes - главная страница мемов с пагинацией
  @Get()
  @Render('memes/index')
  async findAll(
    @Query('page') page?: string,
    @Query('auth') auth?: string,
    @Query('success') success?: string,
    @Query('error') error?: string,
  ) {
    let pageNumber = 1;
    if (page != null) {
      pageNumber = parseInt(page) || 1;
    }
    const result = await this.memesService.findAll(pageNumber, 12); // 12 мемов на страницу
    const isAuthenticated = auth === 'true';

    return {
      title: 'Галерея мемов',
      currentPage: 'memes',
      isAuthenticated,
      username: isAuthenticated ? 'Администратор' : null,
      successMessage: this.getSuccessMessage(success),
      errorMessage: this.getErrorMessage(error),
      memes: result.memes.map(meme => ({
        id: meme.id,
        link: meme.link,
        uploader: meme.getUploaderName(),
        domain: meme.getDomain(),
        shortLink: meme.getShortLink(30),
        isFromPopular: meme.isFromPopularPlatform(),
        isValidLink: meme.isValidLink(),
        isImageLink: meme.isImageLink(),
      })),
      total: result.total,
      currentPageNumber: result.currentPage,
      totalPages: result.totalPages,
      hasNextPage: result.hasNext,
      hasPrevPage: result.hasPrev,
      nextPage: result.hasNext ? result.currentPage + 1 : null,
      prevPage: result.hasPrev ? result.currentPage - 1 : null,
      hasPagination: result.totalPages > 1,
      hasMore: result.hasNext, // для кнопки "Загрузить еще"
    };
  }

  // GET /memes/add - форма добавления мема
  @Get('add')
  @Render('memes/create')
  addForm(@Query('auth') auth?: string) {
    const isAuthenticated = auth === 'true';
    return {
      title: 'Добавить мем',
      currentPage: 'memes',
      isAuthenticated,
      username: isAuthenticated ? 'Администратор' : null,
    };
  }

  // GET /memes/popular - мемы с популярных платформ
  @Get('popular')
  @Render('memes/popular')
  async findPopular(@Query('auth') auth?: string) {
    const popularMemes = await this.memesService.findPopularPlatformMemes();
    const isAuthenticated = auth === 'true';

    return {
      title: 'Популярные мемы',
      currentPage: 'memes',
      isAuthenticated,
      username: isAuthenticated ? 'Администратор' : null,
      memes: popularMemes.map(meme => ({
        id: meme.id,
        link: meme.link,
        uploader: meme.getUploaderName(),
        domain: meme.getDomain(),
        shortLink: meme.getShortLink(30),
      })),
      memesCount: popularMemes.length,
    };
  }

  // GET /memes/:id - просмотр отдельного мема
  @Get(':id')
  @Render('memes/show')
  async findOne(@Param('id') id: string, @Query('auth') auth?: string) {
    const meme = await this.memesService.findOne(+id);

    if (!meme) {
      throw new HttpException('Мем не найден', HttpStatus.NOT_FOUND);
    }

    const isAuthenticated = auth === 'true';

    return {
      title: `Мем #${meme.id}`,
      currentPage: 'memes',
      isAuthenticated,
      username: isAuthenticated ? 'Администратор' : null,
      meme: {
        id: meme.id,
        link: meme.link,
        uploader: meme.getUploaderName(),
        domain: meme.getDomain(),
        isFromPopular: meme.isFromPopularPlatform(),
        isValidLink: meme.isValidLink(),
        isImageLink: meme.isImageLink(),
      },
    };
  }

  // GET /memes/:id/edit - форма редактирования мема
  @Get(':id/edit')
  @Render('memes/edit')
  async editForm(@Param('id') id: string, @Query('auth') auth?: string) {
    const meme = await this.memesService.findOne(+id);

    if (!meme) {
      throw new HttpException('Мем не найден', HttpStatus.NOT_FOUND);
    }

    const isAuthenticated = auth === 'true';

    return {
      title: 'Редактировать мем',
      currentPage: 'memes',
      isAuthenticated,
      username: isAuthenticated ? 'Администратор' : null,
      meme: {
        id: meme.id,
        link: meme.link,
        uploader: meme.getUploaderName(),
      },
    };
  }

  // PATCH /memes/:id - обновление мема
  @Patch(':id')
  @Redirect()
  async update(
    @Param('id') id: string,
    @Body() updateMemeDto: UpdateMemeDto
  ) {
    try {
      await this.memesService.update(+id, updateMemeDto);
      return { url: `/memes/${id}?success=meme_updated` };
    } catch (error) {
      return { url: `/memes/${id}/edit?error=update_failed` };
    }
  }

  // DELETE /memes/:id - удаление мема
  @Delete(':id')
  @Redirect('/memes')
  async remove(@Param('id') id: string) {
    try {
      await this.memesService.remove(+id);
      return { url: '/memes?success=meme_deleted' };
    } catch (error) {
      return { url: '/memes?error=delete_failed' };
    }
  }

  // GET /memes/user/:userId - мемы конкретного пользователя
  @Get('user/:userId')
  @Render('memes/user')
  async findByUser(@Param('userId') userId: string, @Query('auth') auth?: string) {
    const userMemes = await this.memesService.findByUser(+userId);
    const isAuthenticated = auth === 'true';

    return {
      title: 'Мемы пользователя',
      currentPage: 'memes',
      isAuthenticated,
      username: isAuthenticated ? 'Администратор' : null,
      memes: userMemes.map(meme => ({
        id: meme.id,
        link: meme.link,
        uploader: meme.getUploaderName(),
        domain: meme.getDomain(),
        shortLink: meme.getShortLink(30),
      })),
      memesCount: userMemes.length,
      uploaderName: userMemes.length > 0 ? userMemes[0].getUploaderName() : 'Пользователь',
    };
  }

  private getSuccessMessage(success?: string): string | null {
    switch (success) {
      case 'meme_created':
        return 'Мем успешно добавлен!';
      case 'meme_updated':
        return 'Мем успешно обновлен!';
      case 'meme_deleted':
        return 'Мем успешно удален!';
      default:
        return null;
    }
  }

  private getErrorMessage(error?: string): string | null {
    switch (error) {
      case 'meme_creation_failed':
        return 'Ошибка при добавлении мема.';
      case 'update_failed':
        return 'Ошибка при обновлении мема.';
      case 'delete_failed':
        return 'Ошибка при удалении мема.';
      default:
        return null;
    }
  }
}