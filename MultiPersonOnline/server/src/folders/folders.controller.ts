import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { FoldersService } from './folders.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/types/jwt-payload.interface';

@Controller('folders')
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Post()
  create(
    @Body() createFolderDto: CreateFolderDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.foldersService.create(createFolderDto, user.userId);
  }

  @Get()
  findByOwner(
    @CurrentUser() user: JwtPayload,
    @Query('parentId', new DefaultValuePipe(0), ParseIntPipe) parentId: number,
  ) {
    return this.foldersService.findByOwner(user.userId, parentId);
  }

  @Get('tree')
  getFolderTree(@CurrentUser() user: JwtPayload) {
    return this.foldersService.getFolderTree(user.userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.foldersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFolderDto: UpdateFolderDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.foldersService.update(id, updateFolderDto, user.userId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.foldersService.remove(id, user.userId);
  }
}
