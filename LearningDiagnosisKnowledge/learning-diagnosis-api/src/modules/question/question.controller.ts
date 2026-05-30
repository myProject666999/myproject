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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { QuestionService } from './question.service';
import {
  CreateQuestionDto,
  KnowledgePointDto,
} from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QueryQuestionDto } from './dto/query-question.dto';
import { BatchImportDto } from './dto/batch-import.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/types';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequestUser } from '../../common/types';

@ApiTags('题目管理')
@Controller('api/questions')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Get()
  @ApiOperation({ summary: '分页获取题目列表' })
  async findAll(@Query() query: QueryQuestionDto) {
    return this.questionService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取题目详情' })
  @ApiParam({ name: 'id', description: '题目ID' })
  async findOne(@Param('id') id: string) {
    return this.questionService.findOne(Number(id));
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建题目' })
  async create(
    @Body() dto: CreateQuestionDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.questionService.create(dto, user.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新题目' })
  @ApiParam({ name: 'id', description: '题目ID' })
  async update(@Param('id') id: string, @Body() dto: UpdateQuestionDto) {
    return this.questionService.update(Number(id), dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除题目' })
  @ApiParam({ name: 'id', description: '题目ID' })
  async remove(@Param('id') id: string) {
    await this.questionService.remove(Number(id));
    return null;
  }

  @Post('batch-import')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '批量导入题目' })
  async batchImport(
    @Body() dto: BatchImportDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.questionService.batchImport(dto, user.id);
  }

  @Post(':id/knowledge-points')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '关联知识点' })
  @ApiParam({ name: 'id', description: '题目ID' })
  async attachKnowledgePoints(
    @Param('id') id: string,
    @Body() knowledgePoints: KnowledgePointDto[],
  ) {
    await this.questionService.attachKnowledgePoints(
      Number(id),
      knowledgePoints,
    );
    return null;
  }

  @Delete(':id/knowledge-points/:kpId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '移除知识点关联' })
  @ApiParam({ name: 'id', description: '题目ID' })
  @ApiParam({ name: 'kpId', description: '知识点ID' })
  async detachKnowledgePoint(
    @Param('id') id: string,
    @Param('kpId') kpId: string,
  ) {
    await this.questionService.detachKnowledgePoint(Number(id), Number(kpId));
    return null;
  }
}
