import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Document } from './entities/document.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { ShareDocumentDto } from './dto/share-document.dto';
import { JwtPayload } from '../common/types/jwt-payload.interface';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
  ) {}

  async create(
    createDocumentDto: CreateDocumentDto,
    user: JwtPayload,
  ): Promise<Document> {
    const doc = this.documentRepository.create({
      title: createDocumentDto.title ?? '未命名文档',
      content: createDocumentDto.content ?? '',
      folderId: createDocumentDto.folderId ?? 0,
      ownerId: user.userId,
    });
    return this.documentRepository.save(doc);
  }

  async findByOwner(ownerId: number, folderId: number = 0): Promise<Document[]> {
    const whereCondition: any = { ownerId, status: 1 };
    if (folderId > 0) {
      whereCondition.folderId = folderId;
    }
    return this.documentRepository.find({
      where: whereCondition,
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Document> {
    const doc = await this.documentRepository.findOne({
      where: { id, status: 1 },
    });
    if (!doc) throw new NotFoundException('文档不存在');
    return doc;
  }

  async findByShareToken(token: string): Promise<Document> {
    const doc = await this.documentRepository.findOne({
      where: { shareToken: token, status: 1 },
    });
    if (!doc) throw new NotFoundException('分享链接无效或已过期');
    return doc;
  }

  async update(
    id: number,
    updateDocumentDto: UpdateDocumentDto,
    userId: number,
  ): Promise<Document> {
    const doc = await this.findOne(id);
    if (doc.ownerId !== userId) {
      throw new ForbiddenException('无权修改该文档');
    }
    Object.assign(doc, updateDocumentDto);
    return this.documentRepository.save(doc);
  }

  async remove(id: number, userId: number): Promise<void> {
    const doc = await this.findOne(id);
    if (doc.ownerId !== userId) {
      throw new ForbiddenException('无权删除该文档');
    }
    doc.status = 0;
    await this.documentRepository.save(doc);
    await this.documentRepository.softDelete(id);
  }

  async share(
    id: number,
    shareDto: ShareDocumentDto,
    userId: number,
  ): Promise<Document> {
    const doc = await this.findOne(id);
    if (doc.ownerId !== userId) {
      throw new ForbiddenException('无权分享该文档');
    }
    doc.shareType = shareDto.shareType;
    if (shareDto.shareType === 0) {
      doc.shareToken = null;
    } else if (!doc.shareToken) {
      doc.shareToken = uuidv4();
    }
    return this.documentRepository.save(doc);
  }

  async updateContent(
    id: number,
    content: string,
    version: number,
  ): Promise<Document> {
    const doc = await this.findOne(id);
    doc.content = content;
    doc.contentVersion = version;
    return this.documentRepository.save(doc);
  }
}
