import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { GoalService } from './goal.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('目标')
@Controller('goals')
export class GoalController {
  constructor(private readonly goalService: GoalService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建目标' })
  async createGoal(@Request() req: any, @Body() dto: CreateGoalDto) {
    return this.goalService.createGoal(req.user.userId, dto);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取我的目标' })
  @ApiQuery({ name: 'groupId', required: false })
  async getMyGoals(@Request() req: any, @Query('groupId') groupId?: string) {
    return this.goalService.getUserGoals(
      req.user.userId,
      groupId ? Number(groupId) : undefined,
    );
  }

  @Get('user/:userId')
  @ApiOperation({ summary: '获取用户目标' })
  async getUserGoals(@Param('userId') userId: string) {
    return this.goalService.getUserGoals(Number(userId));
  }

  @Get('group/:groupId')
  @ApiOperation({ summary: '获取小组目标' })
  async getGroupGoals(@Param('groupId') groupId: string) {
    return this.goalService.getGroupGoals(Number(groupId));
  }

  @Put(':id/progress')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新目标进度' })
  async updateProgress(
    @Request() req: any,
    @Param('id') goalId: string,
    @Body() body: { increment: number },
  ) {
    return this.goalService.updateGoalProgress(
      req.user.userId,
      Number(goalId),
      body.increment || 1,
    );
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新目标状态' })
  async updateStatus(
    @Request() req: any,
    @Param('id') goalId: string,
    @Body() body: { status: string },
  ) {
    return this.goalService.updateGoalStatus(
      req.user.userId,
      Number(goalId),
      body.status,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除目标' })
  async deleteGoal(@Request() req: any, @Param('id') goalId: string) {
    return this.goalService.deleteGoal(req.user.userId, Number(goalId));
  }
}
