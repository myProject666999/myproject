import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { AdScheduleService } from './ad-schedule.service';
import { AdSchedule } from '../entities/ad-schedule.entity';

@Controller('api/ad-schedules')
export class AdScheduleController {
  constructor(private readonly adScheduleService: AdScheduleService) {}

  @Get()
  findAll(): Promise<AdSchedule[]> {
    return this.adScheduleService.findAll();
  }

  @Get('current')
  getCurrentSchedules(@Query('adSpaceCode') adSpaceCode?: string): Promise<AdSchedule[]> {
    return this.adScheduleService.getCurrentSchedules(adSpaceCode);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<AdSchedule> {
    return this.adScheduleService.findOne(+id);
  }

  @Post()
  create(@Body() data: Partial<AdSchedule>): Promise<AdSchedule> {
    return this.adScheduleService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<AdSchedule>): Promise<AdSchedule> {
    return this.adScheduleService.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.adScheduleService.remove(+id);
  }

  @Post(':id/impression')
  recordImpression(@Param('id') id: string): Promise<void> {
    return this.adScheduleService.recordImpression(+id);
  }

  @Post(':id/click')
  recordClick(@Param('id') id: string): Promise<void> {
    return this.adScheduleService.recordClick(+id);
  }
}
