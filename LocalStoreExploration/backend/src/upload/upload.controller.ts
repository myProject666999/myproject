import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('upload')
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post('image')
  @UseGuards(JwtAuthGuard)
  async uploadImage(@Body() body: { image: string }) {
    const url = await this.uploadService.saveImage(body.image);
    return { url };
  }
}
