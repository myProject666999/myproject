import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { RecycleBinService } from './recycle-bin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DocumentsService } from '../documents/documents.service';

@Controller('recycle-bin')
@UseGuards(JwtAuthGuard)
export class RecycleBinController {
  constructor(
    private readonly recycleBinService: RecycleBinService,
    private readonly documentsService: DocumentsService,
  ) {}

  @Get('space/:spaceId')
  async getRecycleBinList(
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
    return this.recycleBinService.getRecycleBinList(Number(spaceId));
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  async restoreFromRecycleBin(
    @Request() req: any,
    @Param('id') id: string,
  ) {
    await this.recycleBinService.restoreFromRecycleBin(
      Number(id),
      req.user.userId,
    );
    return { message: 'Document restored successfully' };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async permanentlyDelete(
    @Request() req: any,
    @Param('id') id: string,
  ) {
    await this.recycleBinService.permanentlyDelete(
      Number(id),
      req.user.userId,
    );
  }
}
