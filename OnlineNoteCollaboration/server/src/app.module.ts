import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SpacesModule } from './modules/spaces/spaces.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { CommentsModule } from './modules/comments/comments.module';
import { RecycleBinModule } from './modules/recycle-bin/recycle-bin.module';
import { CollaborationModule } from './modules/collaboration/collaboration.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '127.0.0.1',
      port: 3306,
      username: 'root',
      password: '123456',
      database: 'online_note_collaboration',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
      logging: false,
    }),
    AuthModule,
    UsersModule,
    SpacesModule,
    DocumentsModule,
    CommentsModule,
    RecycleBinModule,
    CollaborationModule,
  ],
})
export class AppModule {}
