import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('动态/帖子')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '发布帖子' })
  async createPost(@Request() req: any, @Body() dto: CreatePostDto) {
    return this.postService.createPost(req.user.userId, dto);
  }

  @Get('feed')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取动态流(关注的小组)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getFeed(
    @Request() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.postService.getFeed(req.user.userId, page, limit);
  }

  @Get()
  @ApiOperation({ summary: '获取帖子列表' })
  @ApiQuery({ name: 'groupId', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getPosts(
    @Query('groupId') groupId?: string,
    @Query('userId') userId?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.postService.getPosts(
      page,
      limit,
      groupId ? Number(groupId) : undefined,
      userId ? Number(userId) : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: '获取帖子详情' })
  async getPostDetail(@Param('id') id: string) {
    return this.postService.getPostDetail(Number(id));
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '评论帖子' })
  async commentPost(
    @Request() req: any,
    @Param('id') postId: string,
    @Body() body: { content: string; parentId?: number },
  ) {
    return this.postService.commentPost(
      req.user.userId,
      Number(postId),
      body.content,
      body.parentId,
    );
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '点赞/取消点赞帖子' })
  async likePost(@Request() req: any, @Param('id') postId: string) {
    return this.postService.likePost(req.user.userId, Number(postId));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除帖子' })
  async deletePost(@Request() req: any, @Param('id') postId: string) {
    return this.postService.deletePost(req.user.userId, Number(postId));
  }

  @Get(':id/has-liked')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '检查是否已点赞' })
  async hasLiked(@Request() req: any, @Param('id') postId: string) {
    const hasLiked = await this.postService.hasLiked(req.user.userId, Number(postId));
    return { hasLiked };
  }
}
