import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { RecycleBinService } from './recycle-bin.service';
import { CreateRecycleBinDto } from './dto/create-recycle-bin.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/types/jwt-payload.interface';

@Controller('recycle-bin')
export class RecycleBinController {
  constructor(private readonly recycleBinService: RecycleBinService) {}

  @Post()
  moveToBin(
    @Body() dto: CreateRecycleBinDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.recycleBinService.moveToBin(dto, user.userId);
  }

  @Get()
  findByOwner(@CurrentUser() user: JwtPayload) {
    return this.recycleBinService.findByOwner(user.userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.recycleBinService.findOne(id);
  }

  @Post(':id/restore')
  restore(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.recycleBinService.restore(id, user.userId);
  }

  @Delete(':id')
  permanentDelete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.recycleBinService.permanentDelete(id, user.userId);
  }
}
