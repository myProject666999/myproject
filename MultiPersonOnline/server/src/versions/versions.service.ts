import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentVersion } from './entities/document-version.entity';
import { Document } from '../documents/entities/document.entity';
import { CreateVersionDto } from './dto/create-version.dto';
import { UpdateVersionDto } from './dto/update-version.dto';

@Injectable()
export class VersionsService {
  constructor(
    @InjectRepository(DocumentVersion)
    private readonly versionRepository: Repository<DocumentVersion>,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
  ) {}

  async create(
    createVersionDto: CreateVersionDto,
    userId: number,
  ): Promise<DocumentVersion> {
    const doc = await this.documentRepository.findOne({
      where: { id: createVersionDto.documentId },
    });
    if (!doc) throw new NotFoundException('文档不存在');

    const lastVersion = await this.versionRepository.findOne({
      where: { documentId: createVersionDto.documentId },
      order: { version: 'DESC' },
    });
    const nextVersion = (lastVersion?.version ?? 0) + 1;

    const version = this.versionRepository.create({
      documentId: createVersionDto.documentId,
      version: nextVersion,
      content: createVersionDto.content,
      changeSummary: createVersionDto.changeSummary,
      createdBy: userId,
    });

    await this.documentRepository.update(createVersionDto.documentId, {
      contentVersion: nextVersion,
    });

    return this.versionRepository.save(version);
  }

  async findByDocument(documentId: number): Promise<DocumentVersion[]> {
    return this.versionRepository.find({
      where: { documentId },
      order: { version: 'DESC' },
    });
  }

  async findOne(id: number): Promise<DocumentVersion> {
    const version = await this.versionRepository.findOne({ where: { id } });
    if (!version) throw new NotFoundException('版本不存在');
    return version;
  }

  async update(
    id: number,
    updateVersionDto: UpdateVersionDto,
    userId: number,
  ): Promise<DocumentVersion> {
    const version = await this.findOne(id);
    if (version.createdBy !== userId) {
      throw new ForbiddenException('无权修改该版本');
    }
    Object.assign(version, updateVersionDto);
    return this.versionRepository.save(version);
  }

  async remove(id: number, userId: number): Promise<void> {
    const version = await this.findOne(id);
    if (version.createdBy !== userId) {
      throw new ForbiddenException('无权删除该版本');
    }
    await this.versionRepository.delete(id);
  }
}
