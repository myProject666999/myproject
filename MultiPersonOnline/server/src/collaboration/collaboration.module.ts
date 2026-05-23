import { Module } from '@nestjs/common';
import { CollaborationGateway } from './collaboration.gateway';
import { CollaborationService } from './collaboration.service';
import { CollaborationController } from './collaboration.controller';

@Module({
  controllers: [CollaborationController],
  providers: [CollaborationGateway, CollaborationService],
  exports: [CollaborationService, CollaborationGateway],
})
export class CollaborationModule {}
