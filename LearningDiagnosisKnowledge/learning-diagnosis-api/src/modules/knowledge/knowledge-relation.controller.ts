import {
  Controller,
  Get,
  Post,
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
import { KnowledgeRelationService } from './knowledge-relation.service';
import { KnowledgeRelation } from '../../entities/knowledge-relation.entity';
import { CreateKnowledgeRelationDto } from './dto/create-knowledge-relation.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/types';

@ApiTags('知识点关系管理')
@Controller('knowledge-relations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class KnowledgeRelationController {
  constructor(private readonly relationService: KnowledgeRelationService) {}

  @Get(':kpId')
  @ApiOperation({ summary: '获取知识点的所有关联关系' })
  @ApiParam({ name: 'kpId', description: '知识点ID', type: Number })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: [KnowledgeRelation],
  })
  @ApiResponse({ status: 404, description: '知识点不存在' })
  async findByKpId(@Param('kpId') kpId: string): Promise<KnowledgeRelation[]> {
    return this.relationService.findByKpId(Number(kpId));
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建关系 (admin/teacher)' })
  @ApiResponse({
    status: 201,
    description: '创建成功',
    type: KnowledgeRelation,
  })
  @ApiResponse({ status: 404, description: '知识点不存在' })
  @ApiResponse({ status: 409, description: '关系已存在或不能与自身建立关系' })
  async create(
    @Body() dto: CreateKnowledgeRelationDto,
  ): Promise<KnowledgeRelation> {
    return this.relationService.create(dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除关系 (admin/teacher)' })
  @ApiParam({ name: 'id', description: '关系ID', type: Number })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: '删除成功' })
  @ApiResponse({ status: 404, description: '关系不存在' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.relationService.remove(Number(id));
  }
}
