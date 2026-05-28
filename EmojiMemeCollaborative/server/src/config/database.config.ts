import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: configService.get<string>('DB_HOST', '127.0.0.1'),
  port: configService.get<number>('DB_PORT', 3306),
  username: configService.get<string>('DB_USERNAME', 'root'),
  password: configService.get<string>('DB_PASSWORD', '123456'),
  database: configService.get<string>('DB_DATABASE', 'emoji_meme'),
  autoLoadEntities: true,
  synchronize: true,
  logging: false,
  charset: 'utf8mb4',
});
