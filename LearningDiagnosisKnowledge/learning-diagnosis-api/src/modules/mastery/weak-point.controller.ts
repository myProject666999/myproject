import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { WeakPointService } from './weak-point.service';
import { QueryMasteryDto } from './dto/query-mastery.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, PaginationResult } from '../../common/types';
import type { RequestUser } from '../../common/types';
import { WeakPoint } from '../../entities/weak-point.entity';

@ApiTags('薄弱点管理')
@Controller('api/weak-points')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class WeakPointController {
  constructor(private readonly weakPointService: WeakPointService) {}

  @Get()
  @ApiOperation({ summary: '获取我的薄弱知识点列表（按薄弱程度排序）' })
  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN)
  async getMyWeakPoints(
    @Query() queryDto: QueryMasteryDto,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<PaginationResult<WeakPoint>> {
    return this.weakPointService.getMyWeakPoints(queryDto, currentUser);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取薄弱点详情' })
  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN)
  async getWeakPointDetail(
    @Param('id') id: number,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<WeakPoint> {
    return this.weakPointService.getWeakPointDetail(id, currentUser);
  }

  @Post('refresh')
  @ApiOperation({ summary: '手动刷新薄弱点检测' })
  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN)
  @ApiQuery({ name: 'studentId', required: false, description: '学生ID（老师/管理员查看他人时使用）' })
  async refreshWeakPoints(
    @CurrentUser() currentUser: RequestUser,
    @Query('studentId') studentId?: number,
  ): Promise<{ updated: number; message: string }> {
    return this.weakPointService.refreshWeakPoints(currentUser, studentId);
  }

  @Get('statistics')
  @ApiOperation({ summary: '获取薄弱点统计数据' })
  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN)
  @ApiQuery({ name: 'studentId', required: false, description: '学生ID（老师/管理员查看他人时使用）' })
  async getWeakPointStatistics(
    @CurrentUser() currentUser: RequestUser,
    @Query('studentId') studentId?: number,
  ): Promise<any> {
    return this.weakPointService.getWeakPointStatistics(currentUser, studentId);
  }
}
