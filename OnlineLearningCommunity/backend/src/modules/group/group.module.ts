import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { StudyGroup } from './entities/study-group.entity';
import { GroupMember } from './entities/group-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StudyGroup, GroupMember])],
  controllers: [GroupController],
  providers: [GroupService],
  exports: [GroupService],
})
export class GroupModule {}
