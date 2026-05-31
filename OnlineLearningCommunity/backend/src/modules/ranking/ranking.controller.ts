import { Controller, Get, Param, Query, Post, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RankingService } from './ranking.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('排行榜')
@Controller('rankings')
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

  @Get('group/:groupId')
  @ApiOperation({ summary: '获取小组排行榜' })
  @ApiQuery({ name: 'limit', required: false })
  async getGroupRanking(
    @Param('groupId') groupId: string,
    @Query('limit') limit: number = 20,
  ) {
    return this.rankingService.getGroupRanking(Number(groupId), limit);
  }

  @Get('group/:groupId/streak')
  @ApiOperation({ summary: '获取小组连续打卡排行' })
  @ApiQuery({ name: 'limit', required: false })
  async getGroupStreakRanking(
    @Param('groupId') groupId: string,
    @Query('limit') limit: number = 20,
  ) {
    return this.rankingService.getGroupRankingByStreak(Number(groupId), limit);
  }

  @Get('global')
  @ApiOperation({ summary: '获取全局排行榜' })
  @ApiQuery({ name: 'limit', required: false })
  async getGlobalRanking(@Query('limit') limit: number = 20) {
    return this.rankingService.getGlobalRanking(limit);
  }

  @Get('my-rank')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取我的排名' })
  async getMyRank(@Request() req: any) {
    const globalRank = await this.rankingService.getUserGlobalRank(req.user.userId);
    return { globalRank };
  }

  @Get('group/:groupId/my-rank')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取我在小组的排名' })
  async getMyGroupRank(@Request() req: any, @Param('groupId') groupId: string) {
    const rank = await this.rankingService.getUserGroupRank(
      req.user.userId,
      Number(groupId),
    );
    return { rank };
  }

  @Post('refresh/group/:groupId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '刷新小组排行榜缓存' })
  async refreshGroupRanking(@Param('groupId') groupId: string) {
    await this.rankingService.refreshGroupRanking(Number(groupId));
    return { success: true };
  }
}
