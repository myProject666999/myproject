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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { MemeService } from './meme.service';
import { CreateMemeDto } from './dto/create-meme.dto';
import { QueryMemeDto } from './dto/query-meme.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@ApiTags('Meme')
@Controller('memes')
export class MemeController {
  constructor(private readonly memeService: MemeService) {}

  @Get()
  @ApiOperation({ summary: 'Get meme list' })
  findAll(@Query() query: QueryMemeDto) {
    return this.memeService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get meme by id' })
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.memeService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a meme' })
  create(@Body() dto: CreateMemeDto, @CurrentUser('id') userId: number) {
    return this.memeService.create(dto, userId);
  }

  @Post(':id/upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          const ext = path.parse(file.originalname).ext;
          cb(null, `${uuidv4()}${ext}`);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload meme image' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return { image_url: `/uploads/${file.filename}` };
  }

  @Post(':id/generate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Server-side image generation from canvas data' })
  generateImage(@Param('id', ParseIntPipe) id: number) {
    return this.memeService.generateImage(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a meme' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateMemeDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.memeService.update(id, dto, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a meme' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.memeService.remove(id, userId);
  }
}
