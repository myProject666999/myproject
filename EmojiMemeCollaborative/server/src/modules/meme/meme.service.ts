import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Meme } from './entities/meme.entity';
import { CreateMemeDto } from './dto/create-meme.dto';
import { QueryMemeDto } from './dto/query-meme.dto';
import * as sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MemeService {
  private uploadDir: string;

  constructor(
    @InjectRepository(Meme)
    private memeRepository: Repository<Meme>,
    private configService: ConfigService,
  ) {
    this.uploadDir = this.configService.get<string>('UPLOAD_DIR', './uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async create(dto: CreateMemeDto, userId: number) {
    const meme = this.memeRepository.create({
      title: dto.title,
      template_id: dto.template_id || null,
      canvas_data: dto.canvas_data || null,
      created_by: userId,
      status: 'pending',
    });
    return this.memeRepository.save(meme);
  }

  async findAll(query: QueryMemeDto) {
    const { page = 1, limit = 20, keyword, template_id, created_by, status } = query;
    const where: any = {};
    if (keyword) where.title = Like(`%${keyword}%`);
    if (template_id) where.template_id = template_id;
    if (created_by) where.created_by = created_by;
    if (status) where.status = status;

    const [items, total] = await this.memeRepository.findAndCount({
      where,
      relations: ['creator', 'template'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total, page, limit };
  }

  async findById(id: number) {
    const meme = await this.memeRepository.findOne({
      where: { id },
      relations: ['creator', 'template'],
    });
    if (!meme) {
      throw new NotFoundException('Meme not found');
    }
    await this.memeRepository.increment({ id }, 'view_count', 1);
    meme.view_count += 1;
    return meme;
  }

  async update(id: number, dto: Partial<CreateMemeDto>, userId: number) {
    const meme = await this.memeRepository.findOne({ where: { id, created_by: userId } });
    if (!meme) {
      throw new NotFoundException('Meme not found or you are not the creator');
    }
    if (dto.title !== undefined) meme.title = dto.title;
    if (dto.canvas_data !== undefined) meme.canvas_data = dto.canvas_data;
    if (dto.template_id !== undefined) meme.template_id = dto.template_id;
    meme.status = 'pending';
    return this.memeRepository.save(meme);
  }

  async remove(id: number, userId: number) {
    const meme = await this.memeRepository.findOne({ where: { id, created_by: userId } });
    if (!meme) {
      throw new NotFoundException('Meme not found or you are not the creator');
    }
    await this.memeRepository.remove(meme);
    return { message: 'Meme deleted successfully' };
  }

  async generateImage(id: number) {
    const meme = await this.memeRepository.findOne({ where: { id } });
    if (!meme) {
      throw new NotFoundException('Meme not found');
    }

    if (!meme.canvas_data) {
      throw new NotFoundException('No canvas data available for image generation');
    }

    const canvasData = meme.canvas_data;
    const width = canvasData.width || 800;
    const height = canvasData.height || 600;

    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`;
    svgContent += `<rect width="${width}" height="${height}" fill="${canvasData.backgroundColor || '#ffffff'}"/>`;

    if (canvasData.stickerLayers && Array.isArray(canvasData.stickerLayers)) {
      for (const sticker of canvasData.stickerLayers) {
        svgContent += `<image href="${sticker.stickerId}" x="${sticker.x}" y="${sticker.y}" width="${sticker.width}" height="${sticker.height}" transform="rotate(${sticker.rotation || 0}, ${sticker.x + sticker.width / 2}, ${sticker.y + sticker.height / 2})"/>`;
      }
    }

    if (canvasData.textLayers && Array.isArray(canvasData.textLayers)) {
      for (const text of canvasData.textLayers) {
        svgContent += `<text x="${text.x}" y="${text.y}" font-size="${text.fontSize}" font-family="${text.fontFamily || 'Arial'}" fill="${text.color}" transform="rotate(${text.rotation || 0}, ${text.x}, ${text.y})">${this.escapeXml(text.text)}</text>`;
      }
    }

    svgContent += `</svg>`;

    const filename = `${uuidv4()}.png`;
    const filepath = path.join(this.uploadDir, filename);

    await sharp(Buffer.from(svgContent)).png().toFile(filepath);

    meme.image_url = `/uploads/${filename}`;
    await this.memeRepository.save(meme);

    return { image_url: meme.image_url };
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
