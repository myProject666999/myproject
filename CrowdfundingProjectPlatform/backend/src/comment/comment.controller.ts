import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('project-comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  create(
    @CurrentUser() user: any,
    @Param('id') projectId: string,
    @Body()
    body: { parentId?: number; type?: number; content: string },
  ) {
    return this.commentService.create(user?.id, Number(projectId), body);
  }

  @Get(':id/comments')
  findByProject(
    @Param('id') projectId: string,
    @Query() query: { page?: string; pageSize?: string; type?: string },
  ) {
    return this.commentService.findByProject(Number(projectId), {
      page: query.page ? Number(query.page) : undefined,
      pageSize: query.pageSize ? Number(query.pageSize) : undefined,
      type: query.type !== undefined ? Number(query.type) : undefined,
    });
  }
}
