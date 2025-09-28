import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { CommentsModule } from './modules/comments/comments.module';
import { MemesModule } from './modules/memes/memes.module';
import { PostsModule } from './modules/posts/posts.module';
import { QuotesModule } from './modules/quotes/quotes.module';
import { UsersModule } from './modules/users/users.module';
import { MethodOverrideMiddleware } from './middleware/method-override.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,

    CommentsModule,
    MemesModule,
    PostsModule,
    QuotesModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(MethodOverrideMiddleware)
      .forRoutes('*');
  }
}