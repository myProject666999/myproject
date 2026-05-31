import { Controller, Get, Post, Body, Query, UseGuards, Request, Param } from '@nestjs/common';
import { IsInt, IsString, IsNotEmpty } from 'class-validator';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class CreateCommentDto {
  @IsInt()
  @IsNotEmpty()
  noteId: number;

  @IsString()
  @IsNotEmpty()
  content: string;
}

@Controller('comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Get('note/:noteId')
  async getByNoteId(
    @Param('noteId') noteId: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.commentsService.findByNoteId(
      parseInt(noteId),
      parseInt(page) || 1,
      parseInt(limit) || 20,
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req, @Body() body: CreateCommentDto) {
    return this.commentsService.create(req.user.userId, body.noteId, body.content);
  }
}
