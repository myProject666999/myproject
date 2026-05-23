import {
  Injectable,
  NestMiddleware,
  Inject,
  Logger,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { DataSource } from 'typeorm';
import { OperationLog } from '../entities/operation-log.entity';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  constructor(@Inject(DataSource) private dataSource: DataSource) {}

  use(req: Request, _res: Response, next: NextFunction) {
    const { method, originalUrl, ip, headers } = req;
    this.logger.log(`${method} ${originalUrl} - ${ip}`);

    if (process.env.LOG_OPERATIONS === 'true') {
      try {
        const repo = this.dataSource.getRepository(OperationLog);
        repo.insert({
          userId: (req as any).user?.userId ?? 0,
          action: `${method} ${originalUrl.split('?')[0]}`,
          ipAddress: ip,
          userAgent: (headers['user-agent'] as string) ?? null,
          detail: JSON.stringify({
            body: (req as any).body,
            query: (req as any).query,
          }).slice(0, 4000),
        });
      } catch (err) {
        this.logger.error('记录操作日志失败', err);
      }
    }

    next();
  }
}
