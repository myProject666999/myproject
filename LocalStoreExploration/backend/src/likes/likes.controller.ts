import { Controller, Post, Delete, Body, UseGuards, Request, Get, Query } from '@nestjs/common';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LikeTargetType } from '../entities/like.entity';

@Controller('likes')
export class LikesController {
  constructor(private likesService: LikesService) {}

  @Post('toggle')
  @UseGuards(JwtAuthGuard)
  async toggle(
    @Request() req,
    @Body() body: { targetId: number; targetType: LikeTargetType },
  ) {
    return this.likesService.toggle(
      req.user.userId,
      body.targetId,
      body.targetType,
    );
  }

  @Get('check')
  @UseGuards(JwtAuthGuard)
  async check(
    @Request() req,
    @Query('targetId') targetId: string,
    @Query('targetType') targetType: LikeTargetType,
  ) {
    const isLiked = await this.likesService.checkIsLiked(
      req.user.userId,
      parseInt(targetId),
      targetType,
    );
    return { isLiked };
  }

  @Get('count')
  async getCount(
    @Query('targetId') targetId: string,
    @Query('targetType') targetType: LikeTargetType,
  ) {
    const count = await this.likesService.getLikeCount(
      parseInt(targetId),
      targetType,
    );
    return { count };
  }
}
