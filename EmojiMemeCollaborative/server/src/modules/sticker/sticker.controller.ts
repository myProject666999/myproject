import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StickerService } from './sticker.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { IsString, IsOptional, MaxLength } from 'class-validator';

class CreateStickerDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @MaxLength(500)
  image_url: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  category?: string;
}

@ApiTags('Sticker')
@Controller('stickers')
export class StickerController {
  constructor(private readonly stickerService: StickerService) {}

  @Get()
  @ApiOperation({ summary: 'Get sticker list' })
  findAll(
    @Query('category') category?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.stickerService.findAll(category, page ? +page : 1, limit ? +limit : 20);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a sticker' })
  create(@Body() dto: CreateStickerDto, @CurrentUser('id') userId: number) {
    return this.stickerService.create(dto, userId);
  }
}
