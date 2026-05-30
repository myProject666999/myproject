import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getTypeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: configService.get('database.host'),
  port: configService.get('database.port'),
  username: configService.get('database.username'),
  password: configService.get('database.password'),
  database: configService.get('database.database'),
  entities: [__dirname + '/../entities/**/*.entity{.ts,.js}'],
  synchronize: false,
  logging: configService.get('nodeEnv') === 'development',
  timezone: '+08:00',
  extra: {
    connectionLimit: 20,
  },
});
