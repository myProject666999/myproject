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
import { KnowledgePointService } from './knowledge-point.service';
import { KnowledgePoint } from '../../entities/knowledge-point.entity';
import { CreateKnowledgePointDto } from './dto/create-knowledge-point.dto';
import { UpdateKnowledgePointDto } from './dto/update-knowledge-point.dto';
import { QueryKnowledgeDto } from './dto/query-knowledge.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, PaginationResult } from '../../common/types';

export type KnowledgePointWithChildren = Omit<KnowledgePoint, 'children'> & {
  children?: KnowledgePointWithChildren[];
};

@ApiTags('知识点管理')
@Controller('api/knowledge-points')
@UseGuards(JwtAuthGuard, RolesGuard)
export class KnowledgePointController {
  constructor(private readonly kpService: KnowledgePointService) {}

  @Get()
  @ApiOperation({
    summary: '获取知识点列表，支持按学科、父节点筛选，返回树形结构',
  })
  @ApiQuery({
    name: 'subjectId',
    required: false,
    description: '学科ID',
    type: Number,
  })
  @ApiQuery({
    name: 'parentId',
    required: false,
    description: '父节点ID',
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
    @Query() query: QueryKnowledgeDto,
  ): Promise<PaginationResult<KnowledgePointWithChildren> | KnowledgePointWithChildren[]> {
    return this.kpService.findAll(query);
  }

  @Get('tree/:subjectId')
  @ApiOperation({ summary: '获取学科知识点完整树形结构' })
  @ApiParam({ name: 'subjectId', description: '学科ID', type: Number })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '学科不存在' })
  async getTree(
    @Param('subjectId') subjectId: string,
  ): Promise<KnowledgePointWithChildren[]> {
    return this.kpService.getTree(Number(subjectId));
  }

  @Get(':id')
  @ApiOperation({ summary: '获取知识点详情，包含子节点和关联关系' })
  @ApiParam({ name: 'id', description: '知识点ID', type: Number })
  @ApiResponse({ status: 200, description: '获取成功', type: KnowledgePoint })
  @ApiResponse({ status: 404, description: '知识点不存在' })
  async findOne(@Param('id') id: string): Promise<KnowledgePointWithChildren> {
    return this.kpService.findOne(Number(id));
  }

  @Get(':id/graph')
  @ApiOperation({
    summary: '获取知识点图谱数据（节点和边），用于前端图谱可视化',
  })
  @ApiParam({ name: 'id', description: '知识点ID', type: Number })
  @ApiQuery({
    name: 'depth',
    required: false,
    description: '遍历深度，默认2',
    type: Number,
  })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '知识点不存在' })
  async getGraph(
    @Param('id') id: string,
    @Query('depth') depth?: string,
  ): Promise<{ nodes: any[]; edges: any[] }> {
    return this.kpService.getGraph(Number(id), depth ? Number(depth) : 2);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建知识点 (admin/teacher)' })
  @ApiResponse({ status: 201, description: '创建成功', type: KnowledgePoint })
  @ApiResponse({ status: 404, description: '学科或父节点不存在' })
  @ApiResponse({ status: 409, description: '知识点编码已存在' })
  async create(@Body() dto: CreateKnowledgePointDto): Promise<KnowledgePoint> {
    return this.kpService.create(dto);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新知识点 (admin/teacher)' })
  @ApiParam({ name: 'id', description: '知识点ID', type: Number })
  @ApiResponse({ status: 200, description: '更新成功', type: KnowledgePoint })
  @ApiResponse({ status: 404, description: '知识点、学科或父节点不存在' })
  @ApiResponse({
    status: 409,
    description: '知识点编码已存在或父节点不能是自身',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateKnowledgePointDto,
  ): Promise<KnowledgePoint> {
    return this.kpService.update(Number(id), dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除知识点 (admin/teacher)' })
  @ApiParam({ name: 'id', description: '知识点ID', type: Number })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: '删除成功' })
  @ApiResponse({ status: 404, description: '知识点不存在' })
  @ApiResponse({ status: 409, description: '该知识点下还有子节点，无法删除' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.kpService.remove(Number(id));
  }
}
