import { db } from '../config/database.js';
import type { PaginatedResult } from '../../shared/types.js';

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export abstract class BaseRepository<T extends { id: number }> {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  protected rowToEntity(row: Record<string, unknown>): T {
    return row as T;
  }

  protected rowsToEntities(rows: Record<string, unknown>[]): T[] {
    return rows.map((r) => this.rowToEntity(r));
  }

  async findById(id: number): Promise<T | null> {
    const row = db.prepare(`SELECT * FROM ${this.tableName} WHERE id = ?`).get(id) as Record<string, unknown> | undefined;
    return row ? this.rowToEntity(row) : null;
  }

  async findAll(where?: string, params: unknown[] = [], orderBy = 'id DESC'): Promise<T[]> {
    const sql = where
      ? `SELECT * FROM ${this.tableName} WHERE ${where} ORDER BY ${orderBy}`
      : `SELECT * FROM ${this.tableName} ORDER BY ${orderBy}`;
    const rows = db.prepare(sql).all(...params) as Record<string, unknown>[];
    return this.rowsToEntities(rows);
  }

  async paginate(
    page: number,
    pageSize: number,
    where?: string,
    params: unknown[] = [],
    orderBy = 'id DESC',
    countWhere?: string,
    countParams: unknown[] = []
  ): Promise<PaginatedResult<T>> {
    const whereClause = where ? `WHERE ${where}` : '';
    const countWhereClause = countWhere ? `WHERE ${countWhere}` : whereClause;

    const countSql = `SELECT COUNT(*) as cnt FROM ${this.tableName} ${countWhereClause}`;
    const countRow = db.prepare(countSql).get(...(countParams.length > 0 ? countParams : params)) as { cnt: number };
    const total = countRow?.cnt || 0;

    const sql = `SELECT * FROM ${this.tableName} ${whereClause} ORDER BY ${orderBy} LIMIT ? OFFSET ?`;
    const rows = db.prepare(sql).all(...params, pageSize, (page - 1) * pageSize) as Record<string, unknown>[];

    return {
      list: this.rowsToEntities(rows),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async create(data: Record<string, unknown>): Promise<T> {
    const keys = Object.keys(data).filter((k) => data[k] !== undefined);
    const columns = keys.map((k) => toSnakeCase(k));
    const placeholders = columns.map(() => '?').join(', ');
    const values = keys.map((k) => data[k]);

    const sql = `INSERT INTO ${this.tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
    const result = db.prepare(sql).run(...values);
    const id = result.lastInsertRowid as number;
    return this.findById(id) as Promise<T>;
  }

  async update(id: number, data: Record<string, unknown>): Promise<T | null> {
    const keys = Object.keys(data).filter((k) => data[k] !== undefined);
    if (keys.length === 0) return this.findById(id);

    const setClause = keys.map((k) => `${toSnakeCase(k)} = ?`).join(', ');
    const values = keys.map((k) => data[k]);

    const sql = `UPDATE ${this.tableName} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    db.prepare(sql).run(...values, id);
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = db.prepare(`DELETE FROM ${this.tableName} WHERE id = ?`).run(id);
    return (result.changes ?? 0) > 0;
  }

  async count(where?: string, params: unknown[] = []): Promise<number> {
    const sql = where
      ? `SELECT COUNT(*) as cnt FROM ${this.tableName} WHERE ${where}`
      : `SELECT COUNT(*) as cnt FROM ${this.tableName}`;
    const row = db.prepare(sql).get(...params) as { cnt: number };
    return row?.cnt || 0;
  }

  async exists(where: string, params: unknown[] = []): Promise<boolean> {
    const sql = `SELECT 1 FROM ${this.tableName} WHERE ${where} LIMIT 1`;
    const row = db.prepare(sql).get(...params);
    return !!row;
  }
}
