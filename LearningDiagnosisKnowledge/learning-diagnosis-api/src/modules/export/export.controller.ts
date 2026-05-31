import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Res,
  Ip,
  Headers,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ExportService } from './export.service';
import { CreateExportDto } from './dto/create-export.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/types';
import * as fs from 'fs';

@ApiTags('数据导出')
@Controller('exports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Post()
  @ApiOperation({ summary: '申请导出（异步处理）' })
  async createExport(
    @Body() dto: CreateExportDto,
    @CurrentUser() user: RequestUser,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.exportService.createExport(dto, user, ipAddress, userAgent);
  }

  @Get()
  @ApiOperation({ summary: '获取我的导出记录列表' })
  @ApiQuery({ name: 'page', description: '页码', required: false })
  @ApiQuery({ name: 'pageSize', description: '每页数量', required: false })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @CurrentUser() user: RequestUser,
  ) {
    return this.exportService.findAll(user, page, pageSize);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取导出任务状态和详情' })
  @ApiParam({ name: 'id', description: '导出记录ID' })
  async findOne(
    @Param('id', ParseIntPipe) id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.exportService.findOne(Number(id), user);
  }

  @Get(':id/download')
  @ApiOperation({ summary: '下载导出文件' })
  @ApiParam({ name: 'id', description: '导出记录ID' })
  async download(
    @Param('id', ParseIntPipe) id: string,
    @CurrentUser() user: RequestUser,
    @Res() res: Response,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const { path, filename, record } = await this.exportService.getDownloadPath(
      Number(id),
      user,
      ipAddress,
      userAgent,
    );

    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      csv: 'text/csv; charset=utf-8',
      json: 'application/json; charset=utf-8',
    };

    const ext = filename.split('.').pop() || '';
    const mimeType = mimeTypes[ext] || 'application/octet-stream';

    const encodedFilename = encodeURIComponent(filename);

    res.setHeader('Content-Type', mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`,
    );
    res.setHeader('Content-Length', record.fileSize || 0);
    res.setHeader('Cache-Control', 'no-cache');

    const fileStream = fs.createReadStream(path);
    fileStream.pipe(res);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除导出记录' })
  @ApiParam({ name: 'id', description: '导出记录ID' })
  async remove(
    @Param('id', ParseIntPipe) id: string,
    @CurrentUser() user: RequestUser,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    await this.exportService.delete(Number(id), user, ipAddress, userAgent);
    return null;
  }
}
