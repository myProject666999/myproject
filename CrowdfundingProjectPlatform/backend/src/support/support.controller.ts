import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { SupportService } from './support.service';
import { SupportDto } from './dto/support.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: any, @Body() dto: SupportDto) {
    return this.supportService.create(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  findMy(@CurrentUser() user: any) {
    return this.supportService.findMyOrders(user.id);
  }
}
