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
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TimingInterceptor } from './common/interceptors/timing.interceptor';
import { CacheModule } from '@nestjs/cache-manager';
import { ETagInterceptor } from './common/interceptors/etag.interceptor';
import { CacheControlInterceptor } from './common/interceptors/cache-control.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,

    CacheModule.register({
      ttl: parseInt(process.env.CACHE_TTL || '5') * 1000,
      max: parseInt(process.env.CACHE_MAX_ITEMS || '100'),
    }),

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      introspection: true,
    }),

    CommentsModule,
    MemesModule,
    PostsModule,
    QuotesModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TimingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ETagInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheControlInterceptor,
    },],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(MethodOverrideMiddleware)
      .forRoutes('*');
  }
}