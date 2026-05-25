import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectUpdate } from './entities/project-update.entity';
import { UpdateService } from './update.service';
import { UpdateController } from './update.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectUpdate])],
  controllers: [UpdateController],
  providers: [UpdateService],
  exports: [UpdateService],
})
export class UpdateModule {}
