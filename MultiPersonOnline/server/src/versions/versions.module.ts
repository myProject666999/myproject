import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VersionsService } from './versions.service';
import { VersionsController } from './versions.controller';
import { DocumentVersion } from './entities/document-version.entity';
import { Document } from '../documents/entities/document.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentVersion, Document])],
  controllers: [VersionsController],
  providers: [VersionsService],
  exports: [VersionsService],
})
export class VersionsModule {}
