import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RecommendationService } from './recommendation.service';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { QueryRecommendationDto } from './dto/query-recommendation.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, PaginationResult } from '../../common/types';
import type { RequestUser } from '../../common/types';
import { Recommendation } from '../../entities/recommendation.entity';

@ApiTags('推荐练习')
@Controller('recommendations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STUDENT)
@ApiBearerAuth()
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @Get()
  @ApiOperation({ summary: '获取我的推荐练习列表' })
  async getRecommendations(
    @Query() queryDto: QueryRecommendationDto,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<PaginationResult<Recommendation>> {
    return this.recommendationService.getRecommendations(queryDto, currentUser);
  }

  @Get('statistics')
  @ApiOperation({ summary: '获取推荐练习完成统计' })
  async getStatistics(
    @CurrentUser() currentUser: RequestUser,
  ): Promise<any> {
    return this.recommendationService.getStatistics(currentUser);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取推荐练习详情' })
  async getRecommendationDetail(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<Recommendation> {
    return this.recommendationService.getRecommendationDetail(id, currentUser);
  }

  @Post('generate')
  @ApiOperation({ summary: '手动生成推荐练习' })
  async generateRecommendation(
    @Body() createDto: CreateRecommendationDto,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<Recommendation> {
    return this.recommendationService.generateRecommendation(createDto, currentUser);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: '标记推荐练习完成' })
  async completeRecommendation(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<Recommendation> {
    return this.recommendationService.completeRecommendation(id, currentUser);
  }
}
