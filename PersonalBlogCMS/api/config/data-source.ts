import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from './index.js';
import { User } from '../entities/User.js';
import { Category } from '../entities/Category.js';
import { Tag } from '../entities/Tag.js';
import { Article } from '../entities/Article.js';
import { Comment } from '../entities/Comment.js';
import { VisitLog } from '../entities/VisitLog.js';

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: config.database.path,
  synchronize: true,
  logging: false,
  entities: [User, Category, Tag, Article, Comment, VisitLog],
  migrations: [],
  subscribers: [],
  enableWAL: true,
});
