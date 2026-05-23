import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { CollaborationService } from './collaboration.service';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/collaboration',
})
export class CollaborationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger('CollaborationGateway');

  constructor(private readonly collaborationService: CollaborationService) {}

  async handleConnection(client: Socket) {
    this.logger.log(`客户端连接: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`客户端断开: ${client.id}`);
    const rooms = Array.from(client.rooms);
    for (const room of rooms) {
      if (room.startsWith('doc:')) {
        const docId = room.replace('doc:', '');
        await this.collaborationService.leaveDocument(
          docId,
          client.data?.userId,
        );
        this.server.to(room).emit('user:leave', {
          userId: client.data?.userId,
          socketId: client.id,
        });
      }
    }
  }

  @SubscribeMessage('doc:join')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { documentId: string; userId: number; nickname?: string },
  ) {
    const { documentId, userId, nickname } = data;
    client.data = { userId, nickname };
    client.join(`doc:${documentId}`);

    const onlineUsers = await this.collaborationService.joinDocument(
      documentId,
      userId,
      nickname,
    );
    this.server.to(`doc:${documentId}`).emit('user:join', {
      userId,
      nickname,
      socketId: client.id,
    });
    this.server.to(client.id).emit('doc:online', onlineUsers);
    return { event: 'joined', data: { documentId, onlineUsers } };
  }

  @SubscribeMessage('doc:leave')
  async handleLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { documentId: string; userId: number },
  ) {
    const { documentId, userId } = data;
    client.leave(`doc:${documentId}`);
    const onlineUsers = await this.collaborationService.leaveDocument(
      documentId,
      userId,
    );
    this.server.to(`doc:${documentId}`).emit('user:leave', {
      userId,
      socketId: client.id,
    });
    return { event: 'left', data: { documentId, onlineUsers } };
  }

  @SubscribeMessage('doc:operation')
  async handleOperation(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      documentId: string;
      userId: number;
      operation: any;
      version: number;
    },
  ) {
    const { documentId, operation, version } = data;
    client
      .to(`doc:${documentId}`)
      .emit('doc:operation', { ...data, socketId: client.id });

    await this.collaborationService.saveOperation(
      documentId,
      operation,
      version,
      data.userId,
    );
    return { event: 'operation:ack', data: { version, ok: true } };
  }

  @SubscribeMessage('doc:cursor')
  handleCursor(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      documentId: string;
      userId: number;
      cursor: { position: number; selection?: [number, number] };
    },
  ) {
    client.to(`doc:${data.documentId}`).emit('doc:cursor', {
      ...data,
      socketId: client.id,
    });
  }
}
