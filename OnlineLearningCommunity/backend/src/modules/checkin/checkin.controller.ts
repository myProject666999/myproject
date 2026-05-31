import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CheckinService } from './checkin.service';
import { CreateCheckinDto } from './dto/create-checkin.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('打卡')
@Controller('checkins')
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) {}

  @Post('group/:groupId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '在小组内打卡' })
  async checkin(
    @Request() req: any,
    @Param('groupId') groupId: string,
    @Body() dto: CreateCheckinDto,
  ) {
    return this.checkinService.checkin(req.user.userId, Number(groupId), dto);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取我的打卡记录' })
  @ApiQuery({ name: 'groupId', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getMyCheckins(
    @Request() req: any,
    @Query('groupId') groupId?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.checkinService.getUserCheckins(
      req.user.userId,
      groupId ? Number(groupId) : undefined,
      page,
      limit,
    );
  }

  @Get('user/:userId')
  @ApiOperation({ summary: '获取用户打卡记录' })
  @ApiQuery({ name: 'groupId', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getUserCheckins(
    @Param('userId') userId: string,
    @Query('groupId') groupId?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.checkinService.getUserCheckins(
      Number(userId),
      groupId ? Number(groupId) : undefined,
      page,
      limit,
    );
  }

  @Get('group/:groupId')
  @ApiOperation({ summary: '获取小组打卡记录' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getGroupCheckins(
    @Param('groupId') groupId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.checkinService.getGroupCheckins(Number(groupId), page, limit);
  }

  @Get('today/group/:groupId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '检查今天是否已打卡' })
  async hasCheckedInToday(@Request() req: any, @Param('groupId') groupId: string) {
    const hasChecked = await this.checkinService.hasCheckedInToday(
      req.user.userId,
      Number(groupId),
    );
    return { hasChecked };
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取打卡统计' })
  async getCheckinStats(@Request() req: any) {
    return this.checkinService.getCheckinStats(req.user.userId);
  }
}
