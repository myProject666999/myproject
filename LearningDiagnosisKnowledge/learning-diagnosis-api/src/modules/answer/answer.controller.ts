import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnswerService } from './answer.service';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { QueryAnswerDto } from './dto/query-answer.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, PaginationResult, RequestUser } from '../../common/types';
import { AnswerRecord } from '../../entities/answer-record.entity';

@ApiTags('答题记录')
@Controller('answers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STUDENT)
@ApiBearerAuth()
export class AnswerController {
  constructor(private readonly answerService: AnswerService) {}

  @Post('submit')
  @ApiOperation({ summary: '提交单题答案' })
  async submitAnswer(
    @Body() submitAnswerDto: SubmitAnswerDto,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<AnswerRecord> {
    return this.answerService.submitAnswer(submitAnswerDto, currentUser);
  }

  @Get()
  @ApiOperation({ summary: '获取我的答题记录' })
  async getMyAnswerRecords(
    @Query() queryDto: QueryAnswerDto,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<PaginationResult<AnswerRecord>> {
    return this.answerService.getMyAnswerRecords(queryDto, currentUser);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取答题记录详情' })
  async getAnswerRecordDetail(
    @Param('id') id: number,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<AnswerRecord> {
    return this.answerService.getAnswerRecordDetail(id, currentUser);
  }

  @Get('question/:questionId/history')
  @ApiOperation({ summary: '获取某题我的历史答题记录' })
  async getQuestionHistory(
    @Param('questionId') questionId: number,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<AnswerRecord[]> {
    return this.answerService.getQuestionHistory(questionId, currentUser);
  }

  @Get('wrong')
  @ApiOperation({ summary: '获取我的错题本' })
  async getWrongBook(
    @Query() queryDto: QueryAnswerDto,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<PaginationResult<AnswerRecord>> {
    return this.answerService.getWrongBook(queryDto, currentUser);
  }

  @Post(':id/redo')
  @ApiOperation({ summary: '重做错题' })
  async redoWrongQuestion(
    @Param('id') id: number,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<AnswerRecord> {
    return this.answerService.redoWrongQuestion(id, currentUser);
  }
}
