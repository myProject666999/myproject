import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from './document.entity';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { SpacesModule } from '../spaces/spaces.module';
import { RecycleBin } from '../recycle-bin/recycle-bin.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Document, RecycleBin]), SpacesModule],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
