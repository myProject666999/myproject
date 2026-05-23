import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { DocumentPermission } from './entities/document-permission.entity';
import { Document } from '../documents/entities/document.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentPermission, Document])],
  controllers: [PermissionsController],
  providers: [PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule {}
