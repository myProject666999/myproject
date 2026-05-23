import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { VersionsService } from './versions.service';
import { CreateVersionDto } from './dto/create-version.dto';
import { UpdateVersionDto } from './dto/update-version.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/types/jwt-payload.interface';

@Controller('versions')
export class VersionsController {
  constructor(private readonly versionsService: VersionsService) {}

  @Post()
  create(
    @Body() createVersionDto: CreateVersionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.versionsService.create(createVersionDto, user.userId);
  }

  @Get('document/:documentId')
  findByDocument(@Param('documentId', ParseIntPipe) documentId: number) {
    return this.versionsService.findByDocument(documentId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.versionsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVersionDto: UpdateVersionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.versionsService.update(id, updateVersionDto, user.userId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.versionsService.remove(id, user.userId);
  }
}
