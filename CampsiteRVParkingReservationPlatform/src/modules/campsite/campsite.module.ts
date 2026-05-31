import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Campsite } from './campsite.entity';
import { CampsiteService } from './campsite.service';
import { CampsiteController } from './campsite.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Campsite])],
  providers: [CampsiteService],
  controllers: [CampsiteController],
  exports: [CampsiteService],
})
export class CampsiteModule {}
