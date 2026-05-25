import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UpdateService } from './update.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('project-updates')
export class UpdateController {
  constructor(private readonly updateService: UpdateService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':id/updates')
  create(
    @CurrentUser() user: any,
    @Param('id') projectId: string,
    @Body() body: { title: string; content: string },
  ) {
    return this.updateService.create(user.id, Number(projectId), body);
  }

  @Get(':id/updates')
  findByProject(@Param('id') projectId: string) {
    return this.updateService.findByProject(Number(projectId));
  }
}
