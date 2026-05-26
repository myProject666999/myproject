import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { CollaborationService } from './collaboration.service';

@WebSocketGateway({
  namespace: 'collaboration',
  cors: { origin: '*' },
})
export class CollaborationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(CollaborationGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(private readonly collaborationService: CollaborationService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    const userId = client.data?.userId;
    if (userId) {
      await this.collaborationService.removeOnlineStatus(userId);
    }
  }

  private getRoomName(documentId: number): string {
    return `document:${documentId}`;
  }

  @SubscribeMessage('join-document')
  async handleJoinDocument(
    @MessageBody() data: { documentId: number; userId: number },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const { documentId, userId } = data;
    client.data = { ...(client.data || {}), documentId, userId };
    client.join(this.getRoomName(documentId));

    await this.collaborationService.updateOnlineStatus(userId, {
      document_id: documentId,
      connection_id: client.id,
    });

    const collaborators =
      await this.collaborationService.getDocumentCollaborators(documentId);
    client.emit('document-collaborators', collaborators);

    client.to(this.getRoomName(documentId)).emit('user-joined', {
      documentId,
      userId,
    });

    this.logger.log(`User ${userId} joined document ${documentId}`);
  }

  @SubscribeMessage('leave-document')
  async handleLeaveDocument(
    @MessageBody() data: { documentId: number; userId: number },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const { documentId, userId } = data;
    client.leave(this.getRoomName(documentId));

    await this.collaborationService.updateOnlineStatus(userId, {
      document_id: null,
    });

    this.server
      .to(this.getRoomName(documentId))
      .emit('user-left', { documentId, userId });

    this.logger.log(`User ${userId} left document ${documentId}`);
  }

  @SubscribeMessage('document-change')
  handleDocumentChange(
    @MessageBody() data: { documentId: number; content: string; userId: number },
    @ConnectedSocket() client: Socket,
  ): void {
    const { documentId, ...payload } = data;
    client.to(this.getRoomName(documentId)).emit('document-change', payload);
  }

  @SubscribeMessage('cursor-position')
  handleCursorPosition(
    @MessageBody()
    data: { documentId: number; userId: number; position: unknown },
    @ConnectedSocket() client: Socket,
  ): void {
    const { documentId, ...payload } = data;
    client
      .to(this.getRoomName(documentId))
      .emit('cursor-position', payload);
  }

  broadcastLockAcquired(documentId: number, userId: number, lock: unknown): void {
    this.server
      .to(this.getRoomName(documentId))
      .emit('lock-acquired', { documentId, userId, lock });
  }

  broadcastLockReleased(documentId: number, userId: number): void {
    this.server
      .to(this.getRoomName(documentId))
      .emit('lock-released', { documentId, userId });
  }
}
