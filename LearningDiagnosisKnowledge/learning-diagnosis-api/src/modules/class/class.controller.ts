import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ClassService } from './class.service';
import { ClassStatisticsService } from './class-statistics.service';
import { ClassEntity } from '../../entities/class.entity';
import { CreateClassDto, AddStudentDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { QueryClassDto } from './dto/query-class.dto';
import {
  ClassComparisonDto,
  ClassTrendComparisonDto,
} from './dto/class-comparison.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/types';
import type { PaginationResult, RequestUser } from '../../common/types';

@ApiTags('班级管理')
@Controller('api/classes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClassController {
  constructor(
    private readonly classService: ClassService,
    private readonly statsService: ClassStatisticsService,
  ) {}

  @Get('my')
  @ApiOperation({
    summary: '获取我管理的班级（teacher）或我所在的班级（student）',
  })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: '获取成功' })
  async getMyClasses(
    @CurrentUser() currentUser: RequestUser,
  ): Promise<ClassEntity[]> {
    return this.classService.getMyClasses(currentUser);
  }

  @Get()
  @ApiOperation({ summary: '获取班级列表（分页）' })
  @ApiBearerAuth()
  @ApiQuery({
    name: 'name',
    required: false,
    description: '班级名称模糊搜索',
    type: String,
  })
  @ApiQuery({
    name: 'grade',
    required: false,
    description: '年级',
    type: String,
  })
  @ApiQuery({
    name: 'subject',
    required: false,
    description: '学科',
    type: String,
  })
  @ApiQuery({
    name: 'teacherId',
    required: false,
    description: '教师ID',
    type: Number,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: '状态 1-正常 0-禁用',
    type: Number,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: '页码',
    type: Number,
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: '每页数量',
    type: Number,
  })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(
    @Query() query: QueryClassDto,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<PaginationResult<ClassEntity>> {
    return this.classService.findAll(query, currentUser);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取班级详情，包含学生列表' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: '班级ID', type: Number })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '班级不存在' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<ClassEntity & { students?: any[] }> {
    return this.classService.findOne(Number(id), currentUser);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建班级 (admin/teacher)' })
  @ApiResponse({ status: 201, description: '创建成功', type: ClassEntity })
  @ApiResponse({ status: 409, description: '同年级下班级名称已存在' })
  async create(
    @Body() dto: CreateClassDto,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<ClassEntity> {
    return this.classService.create(dto, currentUser);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新班级 (admin/teacher)' })
  @ApiParam({ name: 'id', description: '班级ID', type: Number })
  @ApiResponse({ status: 200, description: '更新成功', type: ClassEntity })
  @ApiResponse({ status: 404, description: '班级不存在' })
  @ApiResponse({ status: 409, description: '同年级下班级名称已存在' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateClassDto,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<ClassEntity> {
    return this.classService.update(Number(id), dto, currentUser);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除班级 (admin)' })
  @ApiParam({ name: 'id', description: '班级ID', type: Number })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: '删除成功' })
  @ApiResponse({ status: 404, description: '班级不存在' })
  @ApiResponse({ status: 409, description: '班级中还有学生，无法删除' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<void> {
    await this.classService.remove(Number(id), currentUser);
  }

  @Post(':id/students')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '添加学生到班级 (admin/teacher)' })
  @ApiParam({ name: 'id', description: '班级ID', type: Number })
  @ApiResponse({ status: 200, description: '添加完成' })
  @ApiResponse({ status: 404, description: '班级不存在' })
  async addStudents(
    @Param('id') classId: string,
    @Body() dto: AddStudentDto,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<{ added: number; alreadyExists: number; failed: number }> {
    return this.classService.addStudents(Number(classId), dto, currentUser);
  }

  @Delete(':id/students/:studentId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '从班级移除学生 (admin/teacher)' })
  @ApiParam({ name: 'id', description: '班级ID', type: Number })
  @ApiParam({ name: 'studentId', description: '学生ID', type: Number })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: '移除成功' })
  @ApiResponse({ status: 404, description: '班级或学生不存在' })
  async removeStudent(
    @Param('id') classId: string,
    @Param('studentId') studentId: string,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<void> {
    await this.classService.removeStudent(
      Number(classId),
      Number(studentId),
      currentUser,
    );
  }

  @Get(':id/statistics')
  @ApiOperation({ summary: '获取班级学情统计' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: '班级ID', type: Number })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '班级不存在' })
  async getClassStatistics(
    @Param('id') classId: string,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<any> {
    return this.statsService.getClassStatistics(Number(classId), currentUser);
  }

  @Get(':id/statistics/:subjectId')
  @ApiOperation({ summary: '获取班级某学科的详细学情统计' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: '班级ID', type: Number })
  @ApiParam({ name: 'subjectId', description: '学科ID', type: Number })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '班级或学科不存在' })
  async getSubjectStatistics(
    @Param('id') classId: string,
    @Param('subjectId') subjectId: string,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<any> {
    return this.statsService.getSubjectStatistics(
      Number(classId),
      Number(subjectId),
      currentUser,
    );
  }

  @Get(':id/student-ranking/:subjectId')
  @ApiOperation({
    summary: '获取班级学生学科排名（隐私保护：只显示排名，不显示具体分数）',
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: '班级ID', type: Number })
  @ApiParam({ name: 'subjectId', description: '学科ID', type: Number })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '班级或学科不存在' })
  async getStudentRanking(
    @Param('id') classId: string,
    @Param('subjectId') subjectId: string,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<any[]> {
    return this.statsService.getStudentRanking(
      Number(classId),
      Number(subjectId),
      currentUser,
    );
  }

  @Get(':id/mastery-distribution/:subjectId')
  @ApiOperation({ summary: '获取班级掌握度分布数据' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: '班级ID', type: Number })
  @ApiParam({ name: 'subjectId', description: '学科ID', type: Number })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '班级或学科不存在' })
  async getMasteryDistribution(
    @Param('id') classId: string,
    @Param('subjectId') subjectId: string,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<any> {
    return this.statsService.getMasteryDistribution(
      Number(classId),
      Number(subjectId),
      currentUser,
    );
  }

  @Get(':id/weak-points')
  @ApiOperation({ summary: '获取班级薄弱知识点汇总' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: '班级ID', type: Number })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '班级不存在' })
  async getWeakPoints(
    @Param('id') classId: string,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<any[]> {
    return this.statsService.getWeakPoints(Number(classId), currentUser);
  }

  @Post(':id/statistics/refresh')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '手动刷新班级统计数据 (admin/teacher)' })
  @ApiParam({ name: 'id', description: '班级ID', type: Number })
  @ApiResponse({ status: 200, description: '刷新成功' })
  @ApiResponse({ status: 404, description: '班级不存在' })
  async refreshStatistics(
    @Param('id') classId: string,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<{ success: boolean; message: string; updatedCount: number }> {
    return this.statsService.refreshStatistics(Number(classId), currentUser);
  }

  @Post('comparison')
  @ApiOperation({ summary: '多班级学情对比分析' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: '对比完成' })
  async compareClasses(
    @Body() dto: ClassComparisonDto,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<any[]> {
    return this.statsService.compareClasses(dto, currentUser);
  }

  @Get('comparison/trend')
  @ApiOperation({ summary: '班级学情趋势对比' })
  @ApiBearerAuth()
  @ApiQuery({
    name: 'classIds',
    required: true,
    description: '要对比的班级ID列表',
    type: [Number],
    isArray: true,
  })
  @ApiQuery({
    name: 'subjectId',
    required: false,
    description: '学科ID',
    type: Number,
  })
  @ApiQuery({
    name: 'days',
    required: false,
    description: '统计天数，默认30天',
    type: Number,
  })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getTrendComparison(
    @Query() query: ClassTrendComparisonDto,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<any[]> {
    return this.statsService.getTrendComparison(query, currentUser);
  }
}
