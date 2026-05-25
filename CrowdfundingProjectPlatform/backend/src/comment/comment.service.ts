import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    userId: number | undefined,
    projectId: number,
    data: { parentId?: number; type?: number; content: string },
  ) {
    if (!data?.content) {
      throw new BadRequestException('内容不能为空');
    }
    if (userId === undefined || userId === null) {
      throw new BadRequestException('请先登录');
    }

    const project = await this.dataSource.query(
      `SELECT id, user_id FROM project WHERE id = ?`,
      [projectId],
    );
    if (!project || project.length === 0) {
      throw new NotFoundException('项目不存在');
    }
    const projectOwnerId = Number(project[0].user_id);

    const type = data.type && Number(data.type) === 1 ? 1 : 0;

    let parentComment: any = null;
    if (data.parentId) {
      const rows = await this.dataSource.query(
        `SELECT id, user_id, project_id, is_answered FROM comment WHERE id = ?`,
        [data.parentId],
      );
      if (!rows || rows.length === 0) {
        throw new NotFoundException('父评论不存在');
      }
      parentComment = rows[0];
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const result = await queryRunner.manager.query(
        `INSERT INTO comment (project_id, user_id, parent_id, type, content, is_answered) VALUES (?, ?, ?, ?, ?, 0)`,
        [
          projectId,
          userId,
          parentComment ? parentComment.id : null,
          type,
          data.content,
        ],
      );

      if (parentComment && Number(userId) === projectOwnerId) {
        await queryRunner.manager.query(
          `UPDATE comment SET is_answered = 1 WHERE id = ?`,
          [parentComment.id],
        );
      }

      await queryRunner.commitTransaction();

      const newId = result[0]?.insertId;
      return this.commentRepo.findOne({ where: { id: newId } });
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findByProject(
    projectId: number,
    query: { page?: number; pageSize?: number; type?: number },
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20));
    const where: any = { projectId };
    if (query.type !== undefined && query.type !== null) {
      const t = Number(query.type);
      if (t === 0 || t === 1) {
        where.type = t;
      }
    }
    const [list, total] = await this.commentRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { list, total, page, pageSize };
  }
}
