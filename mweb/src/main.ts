import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import hbs from 'hbs';
import { registerHandlebarsHelpers } from './helpers/handlebars.helpers';
import { IResponseWithLayout } from './interfaces/IResponseWithLayout';
import { NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'public'));

  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  hbs.registerPartials(join(__dirname, '..', 'views', 'partials'));

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
