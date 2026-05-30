import { Controller, Post, Get, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ExerciseSessionService } from './exercise-session.service';
import { StartExerciseDto } from './dto/start-exercise.dto';
import { QueryAnswerDto } from './dto/query-answer.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, PaginationResult, RequestUser } from '../../common/types';
import { ExerciseSession } from '../../entities/exercise-session.entity';
import { AnswerRecord } from '../../entities/answer-record.entity';

@ApiTags('练习会话')
@Controller('api/exercise-sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STUDENT)
@ApiBearerAuth()
export class ExerciseSessionController {
  constructor(private readonly sessionService: ExerciseSessionService) {}

  @Post('start')
  @ApiOperation({ summary: '开始练习，创建会话' })
  async startExercise(
    @Body() startExerciseDto: StartExerciseDto,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<ExerciseSession> {
    return this.sessionService.startExercise(startExerciseDto, currentUser);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: '提交整个练习，自动计算总分和统计' })
  async submitExercise(
    @Param('id') id: number,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<ExerciseSession> {
    return this.sessionService.submitExercise(id, currentUser);
  }

  @Get()
  @ApiOperation({ summary: '获取我的练习会话列表' })
  async getMySessions(
    @Query() queryDto: QueryAnswerDto,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<PaginationResult<ExerciseSession>> {
    return this.sessionService.getMySessions(queryDto, currentUser);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取练习会话详情（包含各题答题情况）' })
  async getSessionDetail(
    @Param('id') id: number,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<ExerciseSession> {
    return this.sessionService.getSessionDetail(id, currentUser);
  }

  @Get(':id/answers')
  @ApiOperation({ summary: '获取练习的所有答题记录' })
  async getSessionAnswers(
    @Param('id') id: number,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<AnswerRecord[]> {
    return this.sessionService.getSessionAnswers(id, currentUser);
  }
}
