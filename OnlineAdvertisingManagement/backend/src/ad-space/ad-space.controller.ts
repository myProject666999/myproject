import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { AdSpaceService } from './ad-space.service';
import { AdSpace } from '../entities/ad-space.entity';

@Controller('api/ad-spaces')
export class AdSpaceController {
  constructor(private readonly adSpaceService: AdSpaceService) {}

  @Get()
  findAll(): Promise<AdSpace[]> {
    return this.adSpaceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<AdSpace> {
    return this.adSpaceService.findOne(+id);
  }

  @Post()
  create(@Body() data: Partial<AdSpace>): Promise<AdSpace> {
    return this.adSpaceService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<AdSpace>): Promise<AdSpace> {
    return this.adSpaceService.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.adSpaceService.remove(+id);
  }
}
