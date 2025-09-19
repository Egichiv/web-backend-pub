import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { exec } from 'node:child_process';
import * as hbs from 'hbs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  hbs.registerPartials(join(__dirname, '..', 'views', 'partials'));

  const config = app.get(ConfigService);

  const port = Number(config.get('PORT')) || 3000;
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
  exec(`open http://localhost:${port}`);
}
bootstrap();
