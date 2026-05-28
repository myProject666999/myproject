import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewLog } from './entities/review-log.entity';
import { Meme } from '../meme/entities/meme.entity';
import { Template } from '../template/entities/template.entity';
import { ReviewActionDto } from './dto/review-action.dto';

const SENSITIVE_WORDS = [
  'violence', 'hate', 'racism', 'sexism', 'terrorism',
  'nazi', 'kill', 'murder', 'suicide', 'drug',
  'porn', 'nude', 'naked', 'abuse', 'harass',
];

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(ReviewLog)
    private reviewLogRepository: Repository<ReviewLog>,
    @InjectRepository(Meme)
    private memeRepository: Repository<Meme>,
    @InjectRepository(Template)
    private templateRepository: Repository<Template>,
  ) {}

  async getPendingList(targetType?: 'meme' | 'template', page: number = 1, limit: number = 20) {
    if (targetType === 'meme' || !targetType) {
      const [memes, memeTotal] = await this.memeRepository.findAndCount({
        where: { status: 'pending' },
        relations: ['creator'],
        order: { created_at: 'ASC' },
        skip: targetType === 'meme' ? (page - 1) * limit : 0,
        take: targetType === 'meme' ? limit : 10,
      });

      if (targetType === 'meme') {
        return { items: memes, total: memeTotal, page, limit };
      }

      const [templates, templateTotal] = await this.templateRepository.findAndCount({
        where: { status: 'pending' },
        relations: ['creator'],
        order: { created_at: 'ASC' },
        skip: (page - 1) * limit - memes.length > 0 ? 0 : 0,
        take: limit - memes.length > 0 ? limit - memes.length : 0,
      });

      return {
        memes: { items: memes, total: memeTotal },
        templates: { items: templates, total: templateTotal },
        page,
        limit,
      };
    }

    const [templates, templateTotal] = await this.templateRepository.findAndCount({
      where: { status: 'pending' },
      relations: ['creator'],
      order: { created_at: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items: templates, total: templateTotal, page, limit };
  }

  async reviewAction(
    targetType: 'meme' | 'template',
    targetId: number,
    reviewerId: number,
    dto: ReviewActionDto,
  ) {
    let target: Meme | Template | null;
    if (targetType === 'meme') {
      target = await this.memeRepository.findOne({ where: { id: targetId } });
    } else {
      target = await this.templateRepository.findOne({ where: { id: targetId } });
    }

    if (!target) {
      throw new NotFoundException(`${targetType} not found`);
    }

    if (target.status !== 'pending') {
      throw new BadRequestException(`${targetType} has already been reviewed`);
    }

    target.status = dto.action === 'approve' ? 'approved' : 'rejected';

    if (targetType === 'meme') {
      await this.memeRepository.save(target);
    } else {
      await this.templateRepository.save(target);
    }

    const reviewLog = this.reviewLogRepository.create({
      target_type: targetType,
      target_id: targetId,
      reviewer_id: reviewerId,
      action: dto.action,
      reason: dto.reason || null,
    });
    await this.reviewLogRepository.save(reviewLog);

    return {
      target_type: targetType,
      target_id: targetId,
      action: dto.action,
      new_status: target.status,
    };
  }

  async getReviewHistory(reviewerId: number, page: number = 1, limit: number = 20) {
    const [items, total] = await this.reviewLogRepository.findAndCount({
      where: { reviewer_id: reviewerId },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit };
  }

  detectSensitiveWords(content: string): string[] {
    if (!content) return [];
    const lowerContent = content.toLowerCase();
    const detected: string[] = [];
    for (const word of SENSITIVE_WORDS) {
      if (lowerContent.includes(word)) {
        detected.push(word);
      }
    }
    return detected;
  }

  async autoReviewContent(targetType: 'meme' | 'template', targetId: number): Promise<{
    passed: boolean;
    detectedWords: string[];
  }> {
    let content: string;
    if (targetType === 'meme') {
      const meme = await this.memeRepository.findOne({ where: { id: targetId } });
      if (!meme) return { passed: true, detectedWords: [] };
      content = meme.title;
      if (meme.canvas_data) {
        const canvasData = meme.canvas_data as any;
        if (canvasData.textLayers && Array.isArray(canvasData.textLayers)) {
          content += ' ' + canvasData.textLayers.map((l: any) => l.text).join(' ');
        }
      }
    } else {
      const template = await this.templateRepository.findOne({ where: { id: targetId } });
      if (!template) return { passed: true, detectedWords: [] };
      content = `${template.name} ${template.description || ''}`;
    }

    const detectedWords = this.detectSensitiveWords(content);
    return {
      passed: detectedWords.length === 0,
      detectedWords,
    };
  }
}
