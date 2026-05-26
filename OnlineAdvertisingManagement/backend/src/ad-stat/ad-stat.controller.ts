import { Controller, Get, Query, Param } from '@nestjs/common';
import { AdStatService } from './ad-stat.service';
import { AdStat } from '../entities/ad-stat.entity';

@Controller('api/ad-stats')
export class AdStatController {
  constructor(private readonly adStatService: AdStatService) {}

  @Get()
  findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<AdStat[]> {
    return this.adStatService.findAll(startDate, endDate);
  }

  @Get('summary')
  getSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<any> {
    return this.adStatService.getSummary(startDate, endDate);
  }

  @Get('schedule/:scheduleId')
  findBySchedule(
    @Param('scheduleId') scheduleId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<AdStat[]> {
    return this.adStatService.findBySchedule(+scheduleId, startDate, endDate);
  }
}
