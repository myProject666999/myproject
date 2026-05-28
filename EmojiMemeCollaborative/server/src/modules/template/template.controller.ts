import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TemplateService } from './template.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { QueryTemplateDto } from './dto/query-template.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Template')
@Controller('templates')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Get()
  @ApiOperation({ summary: 'Get template list' })
  findAll(@Query() query: QueryTemplateDto) {
    return this.templateService.findAll(query);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all categories' })
  getCategories() {
    return this.templateService.getCategories();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get template by id' })
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.templateService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create template (admin only)' })
  create(@Body() dto: CreateTemplateDto, @CurrentUser('id') userId: number) {
    return this.templateService.create(dto, userId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update template (admin only)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateTemplateDto,
  ) {
    return this.templateService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete template (admin only)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.templateService.remove(id);
  }
}
