import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecycleBin } from './entities/recycle-bin.entity';
import { Document } from '../documents/entities/document.entity';
import { CreateRecycleBinDto } from './dto/create-recycle-bin.dto';

@Injectable()
export class RecycleBinService {
  constructor(
    @InjectRepository(RecycleBin)
    private readonly recycleBinRepository: Repository<RecycleBin>,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
  ) {}

  async moveToBin(
    createRecycleBinDto: CreateRecycleBinDto,
    userId: number,
  ): Promise<RecycleBin> {
    const doc = await this.documentRepository.findOne({
      where: { id: createRecycleBinDto.documentId },
    });
    if (!doc) throw new NotFoundException('文档不存在');
    if (doc.ownerId !== userId) {
      throw new ForbiddenException('无权删除该文档');
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const record = this.recycleBinRepository.create({
      documentId: doc.id,
      title: createRecycleBinDto.title ?? doc.title,
      ownerId: doc.ownerId,
      deletedBy: userId,
      expiresAt,
    });

    doc.status = 0;
    await this.documentRepository.save(doc);

    return this.recycleBinRepository.save(record);
  }

  async findByOwner(ownerId: number): Promise<RecycleBin[]> {
    return this.recycleBinRepository.find({
      where: { ownerId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<RecycleBin> {
    const record = await this.recycleBinRepository.findOne({ where: { id } });
    if (!record) throw new NotFoundException('回收站记录不存在');
    return record;
  }

  async restore(id: number, userId: number): Promise<void> {
    const record = await this.findOne(id);
    if (record.ownerId !== userId) {
      throw new ForbiddenException('无权恢复该文档');
    }
    const doc = await this.documentRepository.findOne({
      where: { id: record.documentId },
    });
    if (doc) {
      doc.status = 1;
      doc.deletedAt = null;
      await this.documentRepository.save(doc);
    }
    await this.recycleBinRepository.delete(id);
  }

  async permanentDelete(id: number, userId: number): Promise<void> {
    const record = await this.findOne(id);
    if (record.ownerId !== userId) {
      throw new ForbiddenException('无权永久删除该文档');
    }
    await this.documentRepository.delete(record.documentId);
    await this.recycleBinRepository.delete(id);
  }

  async clearExpired(): Promise<void> {
    const now = new Date();
    const expired = await this.recycleBinRepository
      .createQueryBuilder('rb')
      .where('rb.expires_at IS NOT NULL AND rb.expires_at < :now', { now })
      .getMany();
    for (const r of expired) {
      await this.documentRepository.delete(r.documentId);
    }
    await this.recycleBinRepository
      .createQueryBuilder()
      .delete()
      .where('expires_at IS NOT NULL AND expires_at < :now', { now })
      .execute();
  }
}
