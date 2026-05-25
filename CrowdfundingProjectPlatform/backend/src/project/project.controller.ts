import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  findAll(
    @Query()
    query: {
      keyword?: string;
      status?: string;
      page?: string;
      pageSize?: string;
    },
  ) {
    return this.projectService.findAll({
      keyword: query.keyword,
      status: query.status !== undefined ? Number(query.status) : undefined,
      page: query.page ? Number(query.page) : undefined,
      pageSize: query.pageSize ? Number(query.pageSize) : undefined,
    });
  }

  @Get(':id/progress')
  getProgress(@Param('id') id: string) {
    return this.projectService.getProgress(Number(id));
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.projectService.findById(Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateProjectDto) {
    return this.projectService.create(user.id, dto);
  }
}
