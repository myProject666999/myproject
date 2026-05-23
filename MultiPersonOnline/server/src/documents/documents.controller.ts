import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  DefaultValuePipe,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { ShareDocumentDto } from './dto/share-document.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { JwtPayload } from '../common/types/jwt-payload.interface';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  create(
    @Body() createDocumentDto: CreateDocumentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.documentsService.create(createDocumentDto, user);
  }

  @Get('mine')
  findByOwner(
    @CurrentUser() user: JwtPayload,
    @Query('folderId', new DefaultValuePipe(0), ParseIntPipe) folderId: number,
  ) {
    return this.documentsService.findByOwner(user.userId, folderId);
  }

  @Public()
  @Get('share/:token')
  findByShareToken(@Param('token') token: string) {
    return this.documentsService.findByShareToken(token);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.documentsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDocumentDto: UpdateDocumentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.documentsService.update(id, updateDocumentDto, user.userId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.documentsService.remove(id, user.userId);
  }

  @Post(':id/share')
  share(
    @Param('id', ParseIntPipe) id: number,
    @Body() shareDto: ShareDocumentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.documentsService.share(id, shareDto, user.userId);
  }
}
