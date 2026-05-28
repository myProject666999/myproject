import { Controller, Get, Param, Query, Post, Body, UseGuards, Request } from '@nestjs/common';
import { NotesService } from './notes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notes')
export class NotesController {
  constructor(private notesService: NotesService) {}

  @Get('nearby')
  async getNearby(
    @Query('lng') lng: string,
    @Query('lat') lat: string,
    @Query('radius') radius: string,
    @Query('category') category: string,
  ) {
    return this.notesService.findNearby(
      parseFloat(lng),
      parseFloat(lat),
      parseInt(radius) || 5,
      category,
    );
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const note = await this.notesService.findById(parseInt(id));
    if (note) {
      await this.notesService.incrementViews(parseInt(id));
    }
    return note;
  }

  @Get('shop/:shopId')
  async getByShopId(
    @Param('shopId') shopId: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.notesService.findByShopId(
      parseInt(shopId),
      parseInt(page) || 1,
      parseInt(limit) || 20,
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req, @Body() body: any) {
    return this.notesService.create(req.user.userId, body);
  }
}
