import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
  Body,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LikeService } from './like.service';
import { LikeDto } from './dto/like.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Request } from 'express';

@ApiTags('Like')
@Controller('memes')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Post(':memeId/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Like or favorite a meme' })
  toggleLike(
    @Param('memeId', ParseIntPipe) memeId: number,
    @CurrentUser('id') userId: number,
    @Body() dto: LikeDto,
    @Req() req: Request,
  ) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return this.likeService.toggleLike(memeId, userId, dto.type, ip);
  }

  @Delete(':memeId/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove like or favorite' })
  removeLike(
    @Param('memeId', ParseIntPipe) memeId: number,
    @CurrentUser('id') userId: number,
    @Body() dto: LikeDto,
  ) {
    return this.likeService.removeLike(memeId, userId, dto.type);
  }

  @Post(':memeId/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Favorite a meme' })
  favorite(
    @Param('memeId', ParseIntPipe) memeId: number,
    @CurrentUser('id') userId: number,
    @Req() req: Request,
  ) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return this.likeService.toggleLike(memeId, userId, 'favorite', ip);
  }

  @Delete(':memeId/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove favorite' })
  removeFavorite(
    @Param('memeId', ParseIntPipe) memeId: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.likeService.removeLike(memeId, userId, 'favorite');
  }

  @Get(':memeId/like-status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get like/favorite status for a meme' })
  getLikeStatus(
    @Param('memeId', ParseIntPipe) memeId: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.likeService.getLikeStatus(memeId, userId);
  }
}
