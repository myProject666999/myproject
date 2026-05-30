import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { NotesModule } from './notes/notes.module';
import { ShopsModule } from './shops/shops.module';
import { FavoritesModule } from './favorites/favorites.module';
import { CommentsModule } from './comments/comments.module';
import { RankingModule } from './ranking/ranking.module';
import { UploadModule } from './upload/upload.module';
import { LikesModule } from './likes/likes.module';
import { FollowsModule } from './follows/follows.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '127.0.0.1',
      port: 3306,
      username: 'root',
      password: '123456',
      database: 'local_store_exploration',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
      logging: true,
    }),
    RedisModule,
    AuthModule,
    UsersModule,
    NotesModule,
    ShopsModule,
    FavoritesModule,
    CommentsModule,
    RankingModule,
    UploadModule,
    LikesModule,
    FollowsModule,
  ],
})
export class AppModule {}
