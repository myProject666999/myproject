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
import { ExerciseService } from './exercise.service';
import {
  CreateExerciseDto,
  UpdateExerciseDto,
  QueryExerciseDto,
  ExerciseQuestionDto,
} from './dto/create-exercise.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/types';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequestUser } from '../../common/types';

@ApiTags('练习/试卷管理')
@Controller('exercises')
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}

  @Get()
  @ApiOperation({ summary: '分页获取练习列表' })
  async findAll(@Query() query: QueryExerciseDto) {
    return this.exerciseService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取练习详情' })
  @ApiParam({ name: 'id', description: '练习ID' })
  async findOne(@Param('id') id: string) {
    return this.exerciseService.findOne(Number(id));
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建练习' })
  async create(
    @Body() dto: CreateExerciseDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.exerciseService.create(dto, user.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新练习' })
  @ApiParam({ name: 'id', description: '练习ID' })
  async update(@Param('id') id: string, @Body() dto: UpdateExerciseDto) {
    return this.exerciseService.update(Number(id), dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除练习' })
  @ApiParam({ name: 'id', description: '练习ID' })
  async remove(@Param('id') id: string) {
    await this.exerciseService.remove(Number(id));
    return null;
  }

  @Post(':id/questions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '添加题目到练习' })
  @ApiParam({ name: 'id', description: '练习ID' })
  async addQuestions(
    @Param('id') id: string,
    @Body() questions: ExerciseQuestionDto[],
  ) {
    await this.exerciseService.addQuestions(Number(id), questions);
    return null;
  }

  @Delete(':id/questions/:qId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '从练习移除题目' })
  @ApiParam({ name: 'id', description: '练习ID' })
  @ApiParam({ name: 'qId', description: '题目ID' })
  async removeQuestion(@Param('id') id: string, @Param('qId') qId: string) {
    await this.exerciseService.removeQuestion(Number(id), Number(qId));
    return null;
  }
}
