import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecycleBinService } from './recycle-bin.service';
import { RecycleBinController } from './recycle-bin.controller';
import { RecycleBin } from './entities/recycle-bin.entity';
import { Document } from '../documents/entities/document.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RecycleBin, Document])],
  controllers: [RecycleBinController],
  providers: [RecycleBinService],
  exports: [RecycleBinService],
})
export class RecycleBinModule {}
