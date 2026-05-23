import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentPermission } from './entities/document-permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Document } from '../documents/entities/document.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(DocumentPermission)
    private readonly permissionRepository: Repository<DocumentPermission>,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
  ) {}

  async create(
    createPermissionDto: CreatePermissionDto,
    userId: number,
  ): Promise<DocumentPermission> {
    const doc = await this.documentRepository.findOne({
      where: { id: createPermissionDto.documentId },
    });
    if (!doc) throw new NotFoundException('文档不存在');
    if (doc.ownerId !== userId) {
      throw new ForbiddenException('无权设置该文档的权限');
    }

    const existing = await this.permissionRepository.findOne({
      where: {
        documentId: createPermissionDto.documentId,
        userId: createPermissionDto.userId,
      },
    });
    if (existing) {
      throw new ConflictException('该用户已拥有此文档的权限');
    }

    const permission = this.permissionRepository.create({
      ...createPermissionDto,
      source: createPermissionDto.source ?? 1,
    });
    return this.permissionRepository.save(permission);
  }

  async findByDocument(documentId: number): Promise<DocumentPermission[]> {
    return this.permissionRepository.find({ where: { documentId } });
  }

  async findByUser(userId: number): Promise<DocumentPermission[]> {
    return this.permissionRepository.find({ where: { userId } });
  }

  async update(
    id: number,
    updatePermissionDto: UpdatePermissionDto,
    userId: number,
  ): Promise<DocumentPermission> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });
    if (!permission) throw new NotFoundException('权限记录不存在');

    const doc = await this.documentRepository.findOne({
      where: { id: permission.documentId },
    });
    if (!doc || doc.ownerId !== userId) {
      throw new ForbiddenException('无权修改该权限');
    }

    Object.assign(permission, updatePermissionDto);
    return this.permissionRepository.save(permission);
  }

  async remove(id: number, userId: number): Promise<void> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });
    if (!permission) throw new NotFoundException('权限记录不存在');

    const doc = await this.documentRepository.findOne({
      where: { id: permission.documentId },
    });
    if (!doc || doc.ownerId !== userId) {
      throw new ForbiddenException('无权删除该权限');
    }
    await this.permissionRepository.delete(id);
  }

  async hasPermission(
    documentId: number,
    userId: number,
    requireEdit = false,
  ): Promise<boolean> {
    const doc = await this.documentRepository.findOne({
      where: { id: documentId },
    });
    if (!doc) return false;
    if (doc.ownerId === userId) return true;

    const perm = await this.permissionRepository.findOne({
      where: { documentId, userId },
    });
    if (!perm) return false;
    if (requireEdit) return perm.permissionType === 2;
    return true;
  }
}
