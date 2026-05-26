import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdMaterial } from '../entities/ad-material.entity';
import { AdMaterialController } from './ad-material.controller';
import { AdMaterialService } from './ad-material.service';

@Module({
  imports: [TypeOrmModule.forFeature([AdMaterial])],
  controllers: [AdMaterialController],
  providers: [AdMaterialService],
  exports: [AdMaterialService],
})
export class AdMaterialModule {}
