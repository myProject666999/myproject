import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../entities/audit-log.entity';
import { RequestUser } from '../types';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(
    user: RequestUser,
    action: string,
    resourceType: string,
    resourceId?: number,
    description?: string,
    requestData?: any,
    responseData?: any,
    ipAddress?: string,
    userAgent?: string,
    status: number = 1,
  ): Promise<void> {
    try {
      const sanitizedRequest = this.sanitizeData(requestData);
      const sanitizedResponse = this.sanitizeData(responseData);

      const auditLog = this.auditLogRepository.create({
        userId: user?.id,
        username: user?.username,
        role: user?.role,
        action,
        resourceType,
        resourceId,
        description,
        requestData: sanitizedRequest,
        responseData: sanitizedResponse,
        ipAddress,
        userAgent,
        status,
      });

      await this.auditLogRepository.save(auditLog);
    } catch (error) {
      this.logger.error('审计日志记录失败:', error.message);
    }
  }

  private sanitizeData(data: any): any {
    if (!data) return null;

    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'authorization',
      'cookie',
    ];
    const sanitize = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj.map(sanitize);
      }
      if (obj !== null && typeof obj === 'object') {
        const result: any = {};
        for (const [key, value] of Object.entries(obj)) {
          if (sensitiveFields.includes(key.toLowerCase())) {
            result[key] = '***MASKED***';
          } else {
            result[key] = sanitize(value);
          }
        }
        return result;
      }
      return obj;
    };

    return sanitize(data);
  }

  async findAll(params: {
    page?: number;
    pageSize?: number;
    userId?: number;
    action?: string;
    resourceType?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const {
      page = 1,
      pageSize = 20,
      userId,
      action,
      resourceType,
      startDate,
      endDate,
    } = params;

    const queryBuilder = this.auditLogRepository.createQueryBuilder('log');

    if (userId) {
      queryBuilder.andWhere('log.userId = :userId', { userId });
    }
    if (action) {
      queryBuilder.andWhere('log.action = :action', { action });
    }
    if (resourceType) {
      queryBuilder.andWhere('log.resourceType = :resourceType', {
        resourceType,
      });
    }
    if (startDate) {
      queryBuilder.andWhere('log.createdAt >= :startDate', { startDate });
    }
    if (endDate) {
      queryBuilder.andWhere('log.createdAt <= :endDate', { endDate });
    }

    queryBuilder.orderBy('log.createdAt', 'DESC');

    const [list, total] = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { list, total, page, pageSize };
  }
}
