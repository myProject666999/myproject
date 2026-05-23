import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  ParseBoolPipe,
} from '@nestjs/common';
import { CollaborationService } from './collaboration.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/types/jwt-payload.interface';

@Controller('collaboration')
export class CollaborationController {
  constructor(
    private readonly collaborationService: CollaborationService,
  ) {}

  @Get('online/:documentId')
  async getOnlineUsers(@Param('documentId') documentId: string) {
    return this.collaborationService.getOnlineUsers(documentId);
  }

  @Get('operations/:documentId')
  async getOperations(
    @Param('documentId') documentId: string,
    @Query('start') start = 0,
    @Query('end') end = 99,
  ) {
    return this.collaborationService.getOperations(documentId, start, end);
  }
}
