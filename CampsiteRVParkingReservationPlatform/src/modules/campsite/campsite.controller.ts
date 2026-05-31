import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { CampsiteService } from './campsite.service';
import { Campsite } from './campsite.entity';

@Controller('campsites')
export class CampsiteController {
  constructor(private readonly campsiteService: CampsiteService) {}

  @Post()
  async create(@Body() campsiteData: Partial<Campsite>): Promise<Campsite> {
    return this.campsiteService.create(campsiteData);
  }

  @Get()
  async findAll(
    @Query('city') city?: string,
    @Query('keyword') keyword?: string,
    @Query('minRating') minRating?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<{ list: Campsite[]; total: number }> {
    return this.campsiteService.findAll({
      city,
      keyword,
      minRating: minRating ? parseFloat(minRating) : undefined,
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Campsite> {
    const campsite = await this.campsiteService.findOne(+id);
    if (!campsite) {
      throw new HttpException('Campsite not found', HttpStatus.NOT_FOUND);
    }
    return campsite;
  }

  @Get('owner/:ownerId')
  async findByOwner(@Param('ownerId') ownerId: string): Promise<Campsite[]> {
    return this.campsiteService.findByOwner(+ownerId);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateData: Partial<Campsite>): Promise<Campsite> {
    return this.campsiteService.update(+id, updateData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.campsiteService.remove(+id);
  }
}
