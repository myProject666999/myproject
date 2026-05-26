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
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createDocument(
    @Request() req: any,
    @Body()
    data: {
      space_id: number;
      title: string;
      content?: string;
      parent_id?: number;
    },
  ) {
    return this.documentsService.createDocument(
      data.space_id,
      req.user.userId,
      {
        title: data.title,
        content: data.content,
        parent_id: data.parent_id,
      },
    );
  }

  @Get('space/:spaceId')
  async getSpaceDocuments(
    @Request() req: any,
    @Param('spaceId') spaceId: string,
  ) {
    const allowed = await this.documentsService.checkDocumentPermission(
      Number(spaceId),
      req.user.userId,
    );
    if (!allowed) {
      throw new ForbiddenException(
        'You do not have access to this space',
      );
    }
    return this.documentsService.getSpaceDocuments(Number(spaceId));
  }

  @Get('deleted/:spaceId')
  async getDeletedDocuments(
    @Request() req: any,
    @Param('spaceId') spaceId: string,
  ) {
    const allowed = await this.documentsService.checkDocumentPermission(
      Number(spaceId),
      req.user.userId,
    );
    if (!allowed) {
      throw new ForbiddenException(
        'You do not have access to this space',
      );
    }
    return this.documentsService.getDeletedDocuments(Number(spaceId));
  }

  @Get(':id')
  async getDocumentById(@Param('id') id: string) {
    return this.documentsService.getDocumentById(Number(id));
  }

  @Put(':id')
  async updateDocument(
    @Request() req: any,
    @Param('id') id: string,
    @Body() data: { title?: string; content?: string },
  ) {
    return this.documentsService.updateDocument(
      Number(id),
      req.user.userId,
      data,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDocument(
    @Request() req: any,
    @Param('id') id: string,
  ) {
    await this.documentsService.deleteDocument(Number(id), req.user.userId);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  async restoreDocument(@Param('id') id: string) {
    await this.documentsService.restoreDocument(Number(id));
    return { message: 'Document restored successfully' };
  }

  @Delete(':id/permanent')
  @HttpCode(HttpStatus.NO_CONTENT)
  async permanentlyDelete(@Param('id') id: string) {
    await this.documentsService.permanentlyDelete(Number(id));
  }
}
