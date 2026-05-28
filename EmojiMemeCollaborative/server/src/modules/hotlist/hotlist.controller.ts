import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HotlistService } from './hotlist.service';
import { HotlistQueryDto } from './dto/hotlist-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Hotlist')
@Controller('hotlist')
export class HotlistController {
  constructor(private readonly hotlistService: HotlistService) {}

  @Get('daily')
  @ApiOperation({ summary: 'Get daily hotlist ranking' })
  getDailyRanking(@Query() query: HotlistQueryDto) {
    return this.hotlistService.getDailyRanking(query);
  }

  @Get('weekly')
  @ApiOperation({ summary: 'Get weekly hotlist ranking' })
  getWeeklyRanking(@Query() query: HotlistQueryDto) {
    return this.hotlistService.getWeeklyRanking(query);
  }

  @Get('monthly')
  @ApiOperation({ summary: 'Get monthly hotlist ranking' })
  getMonthlyRanking(@Query() query: HotlistQueryDto) {
    return this.hotlistService.getMonthlyRanking(query);
  }
}
