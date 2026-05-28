import { Controller, Get, Param, Query } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.usersService.findById(parseInt(id));
  }

  @Get()
  async getList(@Query('page') page: string, @Query('limit') limit: string) {
    return this.usersService.findAll(parseInt(page) || 1, parseInt(limit) || 20);
  }
}
