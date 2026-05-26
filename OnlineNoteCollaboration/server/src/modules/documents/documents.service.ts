import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './document.entity';
import { SpacesService } from '../spaces/spaces.service';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    private readonly spacesService: SpacesService,
  ) {}

  async checkDocumentPermission(
    spaceId: number,
    userId: number,
  ): Promise<boolean> {
    const role = await this.spacesService.getUserRoleInSpace(spaceId, userId);
    return role >= 1;
  }

  private async ensureWritable(spaceId: number, userId: number): Promise<void> {
    const role = await this.spacesService.getUserRoleInSpace(spaceId, userId);
    if (role !== 1 && role !== 2) {
      throw new ForbiddenException(
        'You do not have permission to modify documents in this space',
      );
    }
  }

  async createDocument(
    spaceId: number,
    userId: number,
    data: { title: string; content?: string; parent_id?: number },
  ): Promise<Document> {
    await this.ensureWritable(spaceId, userId);

    const document = this.documentRepository.create({
      space_id: spaceId,
      title: data.title,
      content: data.content,
      parent_id: data.parent_id ?? null,
      created_by: userId,
    });
    return this.documentRepository.save(document);
  }

  async getDocumentById(docId: number): Promise<Document> {
    const document = await this.documentRepository.findOne({
      where: { id: docId, is_deleted: 0 },
    });
    if (!document) {
      throw new NotFoundException('Document not found');
    }
    return document;
  }

  async getSpaceDocuments(spaceId: number): Promise<Document[]> {
    return this.documentRepository.find({
      where: { space_id: spaceId, is_deleted: 0 },
      order: { sort_order: 'ASC', created_at: 'DESC' },
    });
  }

  async updateDocument(
    docId: number,
    userId: number,
    data: { title?: string; content?: string },
  ): Promise<Document> {
    const document = await this.getDocumentById(docId);
    await this.ensureWritable(document.space_id, userId);

    if (data.title !== undefined) document.title = data.title;
    if (data.content !== undefined) document.content = data.content;
    document.updated_by = userId;
    document.updated_at = new Date();

    return this.documentRepository.save(document);
  }

  async deleteDocument(docId: number, userId: number): Promise<void> {
    const document = await this.getDocumentById(docId);
    await this.ensureWritable(document.space_id, userId);

    document.is_deleted = 1;
    document.deleted_at = new Date();
    document.updated_by = userId;
    await this.documentRepository.save(document);
  }

  async restoreDocument(docId: number): Promise<void> {
    const document = await this.documentRepository.findOne({
      where: { id: docId, is_deleted: 1 },
    });
    if (!document) {
      throw new NotFoundException('Deleted document not found');
    }

    document.is_deleted = 0;
    document.deleted_at = null;
    await this.documentRepository.save(document);
  }

  async permanentlyDelete(docId: number): Promise<void> {
    const result = await this.documentRepository.delete({ id: docId });
    if (result.affected === 0) {
      throw new NotFoundException('Document not found');
    }
  }

  async getDeletedDocuments(spaceId: number): Promise<Document[]> {
    return this.documentRepository.find({
      where: { space_id: spaceId, is_deleted: 1 },
      order: { deleted_at: 'DESC' },
    });
  }
}
