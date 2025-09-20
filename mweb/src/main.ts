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

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Настройка сессий
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

  // Поддержка методов PATCH и DELETE через формы
  app.use(methodOverride('_method'));

  app.useStaticAssets(join(process.cwd(), 'public'));

  app.setBaseViewsDir(join(process.cwd(), 'views'));
  app.setViewEngine('hbs');

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

  const config = app.get(ConfigService);
  const port = Number(config.get('PORT')) || 3000;

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
