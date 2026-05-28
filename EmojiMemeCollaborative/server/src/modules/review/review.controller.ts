import {
  Controller,
  Get,
  Put,
  Param,
  Query,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewService } from './review.service';
import { ReviewActionDto } from './dto/review-action.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Review')
@Controller('review')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get('pending')
  @Roles('admin', 'reviewer')
  @ApiOperation({ summary: 'Get pending review items' })
  getPendingList(
    @Query('target_type') targetType?: 'meme' | 'template',
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.reviewService.getPendingList(
      targetType,
      page ? +page : 1,
      limit ? +limit : 20,
    );
  }

  @Put(':id/approve')
  @Roles('admin', 'reviewer')
  @ApiOperation({ summary: 'Approve a meme or template' })
  approve(
    @Param('id', ParseIntPipe) id: number,
    @Query('target_type') targetType: 'meme' | 'template',
    @CurrentUser('id') reviewerId: number,
    @Body() dto: ReviewActionDto,
  ) {
    dto.action = 'approve';
    return this.reviewService.reviewAction(targetType, id, reviewerId, dto);
  }

  @Put(':id/reject')
  @Roles('admin', 'reviewer')
  @ApiOperation({ summary: 'Reject a meme or template' })
  reject(
    @Param('id', ParseIntPipe) id: number,
    @Query('target_type') targetType: 'meme' | 'template',
    @CurrentUser('id') reviewerId: number,
    @Body() dto: ReviewActionDto,
  ) {
    dto.action = 'reject';
    return this.reviewService.reviewAction(targetType, id, reviewerId, dto);
  }

  @Get('history')
  @Roles('admin', 'reviewer')
  @ApiOperation({ summary: 'Get review history' })
  getReviewHistory(
    @CurrentUser('id') reviewerId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.reviewService.getReviewHistory(
      reviewerId,
      page ? +page : 1,
      limit ? +limit : 20,
    );
  }
}
