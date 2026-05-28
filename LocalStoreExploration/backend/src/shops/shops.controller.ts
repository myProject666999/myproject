import { Controller, Get, Param, Query } from '@nestjs/common';
import { ShopsService } from './shops.service';

@Controller('shops')
export class ShopsController {
  constructor(private shopsService: ShopsService) {}

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.shopsService.findById(parseInt(id));
  }

  @Get()
  async getList(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('category') category: string,
  ) {
    return this.shopsService.findAll(
      parseInt(page) || 1,
      parseInt(limit) || 20,
      category,
    );
  }

  @Get('search')
  async search(@Query('keyword') keyword: string) {
    return this.shopsService.search(keyword);
  }
}
