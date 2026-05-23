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
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/types/jwt-payload.interface';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  create(
    @Body() createPermissionDto: CreatePermissionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.permissionsService.create(createPermissionDto, user.userId);
  }

  @Get('document/:documentId')
  findByDocument(@Param('documentId', ParseIntPipe) documentId: number) {
    return this.permissionsService.findByDocument(documentId);
  }

  @Get('user/:userId')
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.permissionsService.findByUser(userId);
  }

  @Get('mine')
  findMine(@CurrentUser() user: JwtPayload) {
    return this.permissionsService.findByUser(user.userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePermissionDto: UpdatePermissionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.permissionsService.update(id, updatePermissionDto, user.userId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.permissionsService.remove(id, user.userId);
  }
}
