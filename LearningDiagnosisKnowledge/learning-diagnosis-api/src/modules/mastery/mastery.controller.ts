import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MasteryService } from './mastery.service';
import { QueryMasteryDto } from './dto/query-mastery.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, PaginationResult } from '../../common/types';
import type { RequestUser } from '../../common/types';
import { KnowledgeMastery } from '../../entities/knowledge-mastery.entity';

@ApiTags('掌握度管理')
@Controller('mastery')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MasteryController {
  constructor(private readonly masteryService: MasteryService) {}

  @Get()
  @ApiOperation({ summary: '获取我的知识点掌握度列表，支持按学科筛选' })
  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN)
  async getMyMasteryList(
    @Query() queryDto: QueryMasteryDto,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<PaginationResult<KnowledgeMastery>> {
    return this.masteryService.getMyMasteryList(queryDto, currentUser);
  }

  @Get('subject/:subjectId')
  @ApiOperation({ summary: '获取某学科的掌握度详情（带知识点树形结构和掌握度）' })
  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN)
  @ApiQuery({ name: 'studentId', required: false, description: '学生ID（老师/管理员查看他人时使用）' })
  async getSubjectMasteryDetail(
    @Param('subjectId') subjectId: number,
    @CurrentUser() currentUser: RequestUser,
    @Query('studentId') studentId?: number,
  ): Promise<any> {
    return this.masteryService.getSubjectMasteryDetail(
      subjectId,
      currentUser,
      studentId,
    );
  }

  @Get('knowledge-point/:kpId')
  @ApiOperation({ summary: '获取某个知识点的掌握度详情（包含计算详情、历史趋势）' })
  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN)
  @ApiQuery({ name: 'studentId', required: false, description: '学生ID（老师/管理员查看他人时使用）' })
  async getKnowledgePointMasteryDetail(
    @Param('kpId') kpId: number,
    @CurrentUser() currentUser: RequestUser,
    @Query('studentId') studentId?: number,
  ): Promise<any> {
    return this.masteryService.getKnowledgePointMasteryDetail(
      kpId,
      currentUser,
      studentId,
    );
  }

  @Get('heatmap/:subjectId')
  @ApiOperation({ summary: '获取掌握度热力图数据（用于可视化）' })
  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN)
  @ApiQuery({ name: 'studentId', required: false, description: '学生ID（老师/管理员查看他人时使用）' })
  async getMasteryHeatmap(
    @Param('subjectId') subjectId: number,
    @CurrentUser() currentUser: RequestUser,
    @Query('studentId') studentId?: number,
  ): Promise<any> {
    return this.masteryService.getMasteryHeatmap(
      subjectId,
      currentUser,
      studentId,
    );
  }

  @Post('recalculate/:studentId')
  @ApiOperation({ summary: '重新计算某个学生的掌握度（admin/teacher）' })
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async recalculateStudentMastery(
    @Param('studentId') studentId: number,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<{ updated: number; message: string }> {
    return this.masteryService.recalculateStudentMastery(studentId, currentUser);
  }

  @Get('history/:kpId')
  @ApiOperation({ summary: '获取某个知识点的掌握度历史趋势' })
  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN)
  @ApiQuery({ name: 'studentId', required: false, description: '学生ID（老师/管理员查看他人时使用）' })
  @ApiQuery({ name: 'days', required: false, description: '查询天数，默认30天' })
  async getMasteryHistory(
    @Param('kpId') kpId: number,
    @CurrentUser() currentUser: RequestUser,
    @Query('studentId') studentId?: number,
    @Query('days') days?: number,
  ): Promise<any> {
    return this.masteryService.getMasteryHistory(
      kpId,
      currentUser,
      studentId,
      days ?? 30,
    );
  }
}
