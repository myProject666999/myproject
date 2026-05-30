import { Controller, Post, Body, UseGuards, Request, Get, Query } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('follows')
export class FollowsController {
  constructor(private followsService: FollowsService) {}

  @Post('toggle')
  @UseGuards(JwtAuthGuard)
  async toggle(
    @Request() req,
    @Body() body: { followingId: number },
  ) {
    return this.followsService.toggle(
      req.user.userId,
      body.followingId,
    );
  }

  @Get('check')
  @UseGuards(JwtAuthGuard)
  async check(
    @Request() req,
    @Query('followingId') followingId: string,
  ) {
    const isFollowing = await this.followsService.checkIsFollowing(
      req.user.userId,
      parseInt(followingId),
    );
    return { isFollowing };
  }

  @Get('followers')
  async getFollowers(@Query('userId') userId: string) {
    return this.followsService.getFollowers(parseInt(userId));
  }

  @Get('following')
  async getFollowing(@Query('userId') userId: string) {
    return this.followsService.getFollowing(parseInt(userId));
  }
}
