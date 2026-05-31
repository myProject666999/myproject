import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RankingService } from './ranking.service';
import { RankingController } from './ranking.controller';
import { User } from '../user/entities/user.entity';
import { GroupMember } from '../group/entities/group-member.entity';
import { StudyGroup } from '../group/entities/study-group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, GroupMember, StudyGroup])],
  controllers: [RankingController],
  providers: [RankingService],
  exports: [RankingService],
})
export class RankingModule {}
