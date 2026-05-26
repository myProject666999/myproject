import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { RecycleBin } from './recycle-bin.entity';
import { DocumentsService } from '../documents/documents.service';

@Injectable()
export class RecycleBinService {
  constructor(
    @InjectRepository(RecycleBin)
    private readonly recycleBinRepository: Repository<RecycleBin>,
    private readonly documentsService: DocumentsService,
  ) {}

  async moveToRecycleBin(
    documentId: number,
    spaceId: number,
    deletedBy: number,
  ): Promise<RecycleBin> {
    const document = await this.documentsService.getDocumentById(documentId);

    if (document.space_id !== spaceId) {
      throw new BadRequestException(
        'Document does not belong to the specified space',
      );
    }

    const existing = await this.recycleBinRepository.findOne({
      where: { document_id: documentId },
    });
    if (existing) {
      throw new BadRequestException('Document is already in recycle bin');
    }

    await this.documentsService.deleteDocument(documentId, deletedBy, true);

    const expireAt = new Date();
    expireAt.setDate(expireAt.getDate() + 30);

    const record = this.recycleBinRepository.create({
      document_id: documentId,
      space_id: spaceId,
      original_title: document.title,
      original_content: document.content,
      deleted_by: deletedBy,
      expire_at: expireAt,
    });

    return this.recycleBinRepository.save(record);
  }

  async getRecycleBinList(spaceId: number): Promise<RecycleBin[]> {
    return this.recycleBinRepository.find({
      where: { space_id: spaceId },
      order: { created_at: 'DESC' },
    });
  }

  async restoreFromRecycleBin(
    recycleId: number,
    userId: number,
  ): Promise<void> {
    const record = await this.recycleBinRepository.findOne({
      where: { id: recycleId },
    });
    if (!record) {
      throw new NotFoundException('Recycle bin record not found');
    }

    await this.documentsService.restoreDocument(record.document_id);
    await this.recycleBinRepository.delete({ id: recycleId });
  }

  async permanentlyDelete(
    recycleId: number,
    userId: number,
  ): Promise<void> {
    const record = await this.recycleBinRepository.findOne({
      where: { id: recycleId },
    });
    if (!record) {
      throw new NotFoundException('Recycle bin record not found');
    }

    await this.documentsService.permanentlyDelete(record.document_id);
    await this.recycleBinRepository.delete({ id: recycleId });
  }

  async cleanExpired(): Promise<void> {
    const now = new Date();
    const expiredRecords = await this.recycleBinRepository.find({
      where: { expire_at: LessThan(now) },
    });

    for (const record of expiredRecords) {
      try {
        await this.documentsService.permanentlyDelete(record.document_id);
      } catch (err) {
        // ignore if document already deleted
      }
    }

    await this.recycleBinRepository.delete({
      expire_at: LessThan(now),
    });
  }
}
