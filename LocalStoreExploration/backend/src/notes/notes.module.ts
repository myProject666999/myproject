import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Note } from '../entities/note.entity';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { RedisService } from '../redis/redis.service';

@Module({
  imports: [TypeOrmModule.forFeature([Note])],
  controllers: [NotesController],
  providers: [NotesService, RedisService],
  exports: [NotesService],
})
export class NotesModule {}
