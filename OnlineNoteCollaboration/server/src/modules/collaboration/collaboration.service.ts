import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { DocumentLock } from './document-lock.entity';
import { OnlineUser } from './online-user.entity';
import { DocumentsService } from '../documents/documents.service';

@Injectable()
export class CollaborationService {
  private readonly logger = new Logger(CollaborationService.name);

  constructor(
    @InjectRepository(DocumentLock)
    private readonly lockRepository: Repository<DocumentLock>,
    @InjectRepository(OnlineUser)
    private readonly onlineUserRepository: Repository<OnlineUser>,
    private readonly documentsService: DocumentsService,
  ) {}

  async acquireLock(
    documentId: number,
    userId: number,
    lockType: number = 1,
  ): Promise<DocumentLock | null> {
    const existing = await this.lockRepository.findOne({
      where: { document_id: documentId },
    });

    const now = new Date();
    if (existing) {
      if (existing.expire_at && existing.expire_at <= now) {
        await this.lockRepository.delete(existing.id);
      } else if (existing.user_id !== userId) {
        return null;
      }
    }

    const expireAt = new Date(now.getTime() + 5 * 60 * 1000);

    if (existing && existing.user_id === userId) {
      existing.lock_type = lockType;
      existing.acquired_at = now;
      existing.expire_at = expireAt;
      return this.lockRepository.save(existing);
    }

    const lock = this.lockRepository.create({
      document_id: documentId,
      user_id: userId,
      lock_type: lockType,
      expire_at: expireAt,
    });

    return this.lockRepository.save(lock);
  }

  async releaseLock(documentId: number, userId: number): Promise<void> {
    const result = await this.lockRepository.delete({
      document_id: documentId,
      user_id: userId,
    });
    if (result.affected === 0) {
      this.logger.warn(
        `No lock found to release for document ${documentId} by user ${userId}`,
      );
    }
  }

  async getLockInfo(documentId: number): Promise<DocumentLock | null> {
    return this.lockRepository.findOne({
      where: { document_id: documentId },
    });
  }

  async updateOnlineStatus(
    userId: number,
    data: { space_id?: number; document_id?: number; connection_id?: string },
  ): Promise<OnlineUser> {
    const existing = await this.onlineUserRepository.findOne({
      where: { user_id: userId },
    });

    if (existing) {
      if (data.space_id !== undefined) existing.space_id = data.space_id;
      if (data.document_id !== undefined) existing.document_id = data.document_id;
      if (data.connection_id !== undefined)
        existing.connection_id = data.connection_id;
      existing.last_active = new Date();
      return this.onlineUserRepository.save(existing);
    }

    const record = this.onlineUserRepository.create({
      user_id: userId,
      space_id: data.space_id ?? null,
      document_id: data.document_id ?? null,
      connection_id: data.connection_id ?? null,
    });

    return this.onlineUserRepository.save(record);
  }

  async removeOnlineStatus(userId: number): Promise<void> {
    await this.onlineUserRepository.delete({ user_id: userId });
  }

  async getOnlineUsers(spaceId: number): Promise<OnlineUser[]> {
    const cutoff = new Date(Date.now() - 5 * 60 * 1000);
    return this.onlineUserRepository.find({
      where: {
        space_id: spaceId,
        last_active: MoreThan(cutoff),
      },
    });
  }

  async getDocumentCollaborators(documentId: number): Promise<OnlineUser[]> {
    const cutoff = new Date(Date.now() - 5 * 60 * 1000);
    return this.onlineUserRepository.find({
      where: {
        document_id: documentId,
        last_active: MoreThan(cutoff),
      },
    });
  }
}
