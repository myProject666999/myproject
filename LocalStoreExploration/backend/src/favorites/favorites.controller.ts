import { Controller, Get, Post, Delete, Body, UseGuards, Request, Query } from '@nestjs/common';
import { IsInt, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TargetType, ListType } from '../entities/favorite.entity';

class AddFavoriteDto {
  @IsInt()
  @IsNotEmpty()
  targetId: number;

  @IsEnum(TargetType)
  @IsNotEmpty()
  targetType: TargetType;

  @IsEnum(ListType)
  @IsOptional()
  listType?: ListType;
}

class RemoveFavoriteDto {
  @IsInt()
  @IsNotEmpty()
  targetId: number;

  @IsEnum(TargetType)
  @IsNotEmpty()
  targetType: TargetType;
}

@Controller('favorites')
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getMyFavorites(@Request() req, @Query('listType') listType: ListType) {
    return this.favoritesService.findByUser(req.user.userId, listType);
  }

  @Get('check')
  @UseGuards(JwtAuthGuard)
  async check(
    @Request() req,
    @Query('targetId') targetId: string,
    @Query('targetType') targetType: TargetType,
  ) {
    const isFavorite = await this.favoritesService.checkIsFavorite(
      req.user.userId,
      parseInt(targetId),
      targetType,
    );
    return { isFavorite };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async add(
    @Request() req,
    @Body() body: AddFavoriteDto,
  ) {
    return this.favoritesService.add(
      req.user.userId,
      body.targetId,
      body.targetType,
      body.listType,
    );
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  async remove(
    @Request() req,
    @Body() body: RemoveFavoriteDto,
  ) {
    return this.favoritesService.remove(req.user.userId, body.targetId, body.targetType);
  }
}
