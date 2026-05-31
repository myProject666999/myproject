import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { SpotService } from './spot.service';
import { Spot, SpotType } from './spot.entity';

@Controller('spots')
export class SpotController {
  constructor(private readonly spotService: SpotService) {}

  @Post()
  async create(@Body() spotData: Partial<Spot>): Promise<Spot> {
    return this.spotService.create(spotData);
  }

  @Get()
  async findAll(
    @Query('campsiteId') campsiteId?: string,
    @Query('typeId') typeId?: string,
  ): Promise<Spot[]> {
    return this.spotService.findAll(
      campsiteId ? +campsiteId : undefined,
      typeId ? +typeId : undefined,
    );
  }

  @Get('types')
  async findAllSpotTypes(): Promise<SpotType[]> {
    return this.spotService.findAllSpotTypes();
  }

  @Get('available')
  async findAvailableSpots(
    @Query('campsiteId') campsiteId: string,
    @Query('checkinDate') checkinDate: string,
    @Query('checkoutDate') checkoutDate: string,
  ): Promise<Spot[]> {
    if (!campsiteId || !checkinDate || !checkoutDate) {
      throw new HttpException('Missing required parameters', HttpStatus.BAD_REQUEST);
    }
    return this.spotService.findAvailableSpots(
      +campsiteId,
      new Date(checkinDate),
      new Date(checkoutDate),
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Spot> {
    const spot = await this.spotService.findOne(+id);
    if (!spot) {
      throw new HttpException('Spot not found', HttpStatus.NOT_FOUND);
    }
    return spot;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateData: Partial<Spot>): Promise<Spot> {
    return this.spotService.update(+id, updateData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.spotService.remove(+id);
  }
}
