import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';

interface AuthenticatedSocket extends Socket {
  userId?: number;
}

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private readonly userSockets: Map<number, Set<string>> = new Map();

  constructor(private readonly jwtService: JwtService) {}

  /**
   * Handle client connection
   */
  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract token from handshake
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        this.logger.warn(
          `Client ${client.id} connected without token to notifications namespace`,
        );
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = await this.jwtService.verifyAsync(token);
      const userId = payload.id;
      client.userId = userId;

      // Track user's socket connections
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client.id);

      // Join user to their own room for private notifications
      client.join(`user:${userId}`);

      this.logger.log(
        `User ${client.userId} connected to notifications with socket ${client.id}`,
      );

      // Emit connection success
      client.emit('connected', {
        userId: client.userId,
        message: 'Connected to notifications server',
      });
    } catch (error) {
      this.logger.error(
        `Notifications connection error: ${error.message}`,
      );
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect();
    }
  }

  /**
   * Handle client disconnection
   */
  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      const userSockets = this.userSockets.get(client.userId);
      if (userSockets) {
        userSockets.delete(client.id);
        if (userSockets.size === 0) {
          this.userSockets.delete(client.userId);
        }
      }
      this.logger.log(
        `User ${client.userId} disconnected from notifications (socket ${client.id})`,
      );
    } else {
      this.logger.log(
        `Client ${client.id} disconnected from notifications`,
      );
    }
  }

  /**
   * Emit new notification event to a specific user
   */
  emitNewNotification(userId: number, notification: any): void {
    this.server.to(`user:${userId}`).emit('newNotification', {
      notification,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(
      `Emitted new notification to user ${userId}: ${notification.title}`,
    );
  }

  /**
   * Emit notification marked as read event
   */
  emitNotificationRead(userId: number, notificationId: number): void {
    this.server.to(`user:${userId}`).emit('notificationRead', {
      notificationId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit all notifications marked as read event
   */
  emitAllNotificationsRead(userId: number): void {
    this.server.to(`user:${userId}`).emit('allNotificationsRead', {
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Check if a user is online
   */
  isUserOnline(userId: number): boolean {
    const sockets = this.userSockets.get(userId);
    return this.userSockets.has(userId) && (sockets?.size || 0) > 0;
  }
}

