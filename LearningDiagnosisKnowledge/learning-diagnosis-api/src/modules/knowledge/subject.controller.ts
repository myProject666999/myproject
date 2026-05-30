import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
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
} from '@nestjs/swagger';
import { SubjectService } from './subject.service';
import { Subject } from '../../entities/subject.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/types';

@ApiTags('学科管理')
@Controller('api/subjects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  @Get()
  @ApiOperation({ summary: '获取所有学科列表' })
  @ApiResponse({ status: 200, description: '获取成功', type: [Subject] })
  async findAll(): Promise<Subject[]> {
    return this.subjectService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取学科详情' })
  @ApiParam({ name: 'id', description: '学科ID', type: Number })
  @ApiResponse({ status: 200, description: '获取成功', type: Subject })
  @ApiResponse({ status: 404, description: '学科不存在' })
  async findOne(@Param('id') id: string): Promise<Subject> {
    return this.subjectService.findOne(Number(id));
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建学科 (admin)' })
  @ApiResponse({ status: 201, description: '创建成功', type: Subject })
  @ApiResponse({ status: 409, description: '学科编码已存在' })
  async create(@Body() createSubjectDto: Partial<Subject>): Promise<Subject> {
    return this.subjectService.create(createSubjectDto);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新学科 (admin)' })
  @ApiParam({ name: 'id', description: '学科ID', type: Number })
  @ApiResponse({ status: 200, description: '更新成功', type: Subject })
  @ApiResponse({ status: 404, description: '学科不存在' })
  @ApiResponse({ status: 409, description: '学科编码已存在' })
  async update(
    @Param('id') id: string,
    @Body() updateSubjectDto: Partial<Subject>,
  ): Promise<Subject> {
    return this.subjectService.update(Number(id), updateSubjectDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除学科 (admin)' })
  @ApiParam({ name: 'id', description: '学科ID', type: Number })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: '删除成功' })
  @ApiResponse({ status: 404, description: '学科不存在' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.subjectService.remove(Number(id));
  }
}
