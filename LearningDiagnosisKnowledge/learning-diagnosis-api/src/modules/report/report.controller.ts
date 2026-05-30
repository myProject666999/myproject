import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportService } from './report.service';
import { GenerateReportDto } from './dto/generate-report.dto';
import { QueryReportDto } from './dto/query-report.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, PaginationResult } from '../../common/types';
import type { RequestUser } from '../../common/types';
import { LearningReport } from '../../entities/learning-report.entity';

@ApiTags('学情报告')
@Controller('api/reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取报告列表（分页）' })
  async getReportList(
    @Query() queryDto: QueryReportDto,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<PaginationResult<LearningReport>> {
    return this.reportService.getReportList(queryDto, currentUser);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取报告详情' })
  async getReportDetail(
    @Param('id') id: number,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<LearningReport> {
    return this.reportService.getReportDetail(id, currentUser);
  }

  @Post('generate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: '手动生成报告' })
  async generateReport(
    @Body() generateDto: GenerateReportDto,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<LearningReport> {
    return this.reportService.generateReport(generateDto, currentUser);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除报告' })
  async deleteReport(
    @Param('id') id: number,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<void> {
    return this.reportService.deleteReport(id, currentUser);
  }

  @Post(':id/share')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: '生成分享链接' })
  async shareReport(
    @Param('id') id: number,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<{ shareUrl: string; shareToken: string }> {
    return this.reportService.shareReport(id, currentUser);
  }

  @Get('share/:token')
  @ApiOperation({ summary: '通过分享链接查看报告' })
  async getReportByShareToken(
    @Param('token') token: string,
  ): Promise<LearningReport> {
    return this.reportService.getReportByShareToken(token);
  }

  @Get('diagnosis/:exerciseSessionId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: '生成诊断测试报告' })
  async generateDiagnosisReport(
    @Param('exerciseSessionId') exerciseSessionId: number,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<LearningReport> {
    return this.reportService.generateDiagnosisReport(exerciseSessionId, currentUser);
  }
}
