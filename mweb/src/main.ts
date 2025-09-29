import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import hbs from 'hbs';
import methodOverride from 'method-override';
import session from 'express-session';
import { registerHandlebarsHelpers } from './helpers/handlebars.helpers';
import { IResponseWithLayout } from './interfaces/IResponseWithLayout';
import { NextFunction } from 'express';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Для сессий
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'your-secret-key-here',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 часа
        httpOnly: true,
      },
    }),
  );

  // Поддержка методов PATCH и DELETE
  app.use(methodOverride('_method'));

  app.useStaticAssets(join(process.cwd(), 'public'));

  app.setBaseViewsDir(join(process.cwd(), 'views'));
  app.setViewEngine('hbs');

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.useGlobalFilters(new AllExceptionsFilter());

  hbs.registerPartials(join(process.cwd(), 'views', 'partials'));

  registerHandlebarsHelpers();

  app.use((req: Request, res: IResponseWithLayout, next: NextFunction) => {
    res.locals.layout = 'layouts/main';
    next();
  });

  app.set('view options', {
    extension: 'hbs',
    map: { html: 'hbs' },
  });

  const config = new DocumentBuilder()
    .setTitle('Quotes & Memes API')
    .setDescription('RESTful API для платформы цитат и мемов')
    .setVersion('1.0')
    .addTag('users', 'Операции с пользователями')
    .addTag('comments', 'Операции с комментариями')
    .addTag('posts', 'Операции с постами')
    .addTag('quotes', 'Операции с цитатами')
    .addTag('memes', 'Операции с мемами')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      showRequestHeaders: true,
      sortByTags: true,
    },
    customSiteTitle: 'Quotes Platform API Documentation',
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info { margin: 20px 0; }
      .swagger-ui .scheme-container { background: #fafafa; padding: 15px; border-radius: 4px; }
    `,
  });

  const configService = app.get(ConfigService);
  const port = Number(configService.get('PORT')) || 3000;

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
