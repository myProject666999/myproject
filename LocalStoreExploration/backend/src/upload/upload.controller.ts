import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { IsString, IsNotEmpty } from 'class-validator';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class UploadImageDto {
  @IsString()
  @IsNotEmpty()
  image: string;
}

@Controller('upload')
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post('image')
  @UseGuards(JwtAuthGuard)
  async uploadImage(@Body() body: UploadImageDto) {
    const url = await this.uploadService.saveImage(body.image);
    return { url };
  }
}
