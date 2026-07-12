import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL ?? 'http://localhost:5173' },
  namespace: 'incidents',
})
export class IncidentsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(IncidentsGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token as string | undefined;
      if (!token) throw new Error('missing token');
      this.jwtService.verify(token);
    } catch {
      this.logger.warn(`Rejecting unauthenticated socket ${client.id}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Socket disconnected: ${client.id}`);
  }

  @SubscribeMessage('incident:join')
  handleJoin(client: Socket, incidentId: string) {
    client.join(this.roomName(incidentId));
  }

  @SubscribeMessage('incident:leave')
  handleLeave(client: Socket, incidentId: string) {
    client.leave(this.roomName(incidentId));
  }

  emitIncidentUpdated(incidentId: string, payload: unknown) {
    this.server.to(this.roomName(incidentId)).emit('incident:updated', payload);
  }

  emitNewEvent(incidentId: string, payload: unknown) {
    this.server.to(this.roomName(incidentId)).emit('incident:event', payload);
  }

  emitIncidentCreated(payload: unknown) {
    this.server.emit('incident:created', payload);
  }

  private roomName(incidentId: string) {
    return `incident:${incidentId}`;
  }
}