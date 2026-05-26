import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { AdMaterialService } from './ad-material.service';
import { AdMaterial } from '../entities/ad-material.entity';

@Controller('api/ad-materials')
export class AdMaterialController {
  constructor(private readonly adMaterialService: AdMaterialService) {}

  @Get()
  findAll(): Promise<AdMaterial[]> {
    return this.adMaterialService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<AdMaterial> {
    return this.adMaterialService.findOne(+id);
  }

  @Post()
  create(@Body() data: Partial<AdMaterial>): Promise<AdMaterial> {
    return this.adMaterialService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<AdMaterial>): Promise<AdMaterial> {
    return this.adMaterialService.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.adMaterialService.remove(+id);
  }
}
