import { Controller, Get, Query } from '@nestjs/common';
import { RankingService } from './ranking.service';

@Controller('ranking')
export class RankingController {
  constructor(private rankingService: RankingService) {}

  @Get('daren')
  async getDarenRanking(@Query('limit') limit: string) {
    return this.rankingService.getDarenRanking(parseInt(limit) || 20);
  }
}
