import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  async createComment(
    @Body() data: { document_id: number; content: string; parent_id?: number; mentions?: number[] },
    @Request() req: any,
  ) {
    return this.commentsService.createComment(data.document_id, req.user.userId, {
      content: data.content,
      parent_id: data.parent_id,
      mentions: data.mentions,
    });
  }

  @Get('document/:documentId')
  async getDocumentComments(@Param('documentId') documentId: string) {
    return this.commentsService.getDocumentComments(Number(documentId));
  }

  @Put(':id')
  async updateComment(
    @Param('id') id: string,
    @Body() data: { content: string },
    @Request() req: any,
  ) {
    return this.commentsService.updateComment(Number(id), req.user.userId, data.content);
  }

  @Delete(':id')
  async deleteComment(@Param('id') id: string, @Request() req: any) {
    await this.commentsService.deleteComment(Number(id), req.user.userId);
    return { message: '评论已删除' };
  }

  @Post(':id/resolve')
  async resolveComment(@Param('id') id: string, @Request() req: any) {
    return this.commentsService.resolveComment(Number(id), req.user.userId);
  }

  @Post(':id/unresolve')
  async unresolveComment(@Param('id') id: string, @Request() req: any) {
    return this.commentsService.unresolveComment(Number(id), req.user.userId);
  }
}
