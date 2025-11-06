import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtService } from '@nestjs/jwt';
import { Logger, UnauthorizedException } from '@nestjs/common';

interface AuthenticatedSocket extends Socket {
  userId?: number;
}

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private userSockets: Map<number, Set<string>> = new Map();

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

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
        this.logger.warn(`Client ${client.id} connected without token`);
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

      // Join user to their own room for private messaging
      client.join(`user:${userId}`);

      this.logger.log(
        `User ${client.userId} connected with socket ${client.id}`,
      );

      // Emit connection success
      client.emit('connected', {
        userId: client.userId,
        message: 'Connected to chat server',
      });
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
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
        `User ${client.userId} disconnected (socket ${client.id})`,
      );
    } else {
      this.logger.log(`Client ${client.id} disconnected`);
    }
  }

  /**
   * Handle sending a message via WebSocket
   */
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: SendMessageDto,
  ) {
    try {
      if (!client.userId) {
        throw new UnauthorizedException('User not authenticated');
      }

      // Save message using service
      const message = await this.chatService.sendMessage(data, client.userId);

      // Get chat details to find the recipient
      const chat = await this.chatService.getChatById(
        data.chatId,
        client.userId,
      );

      // Determine recipient user ID
      const recipientId =
        chat.userAId === client.userId ? chat.userBId : chat.userAId;

      // Emit to sender (all their connected devices)
      this.server.to(`user:${client.userId}`).emit('newMessage', {
        message,
        chatId: data.chatId,
      });

      // Emit to recipient (all their connected devices)
      this.server.to(`user:${recipientId}`).emit('newMessage', {
        message,
        chatId: data.chatId,
      });

      // Emit chat head update to both users
      this.server.to(`user:${client.userId}`).emit('chatUpdated', {
        chatId: data.chatId,
        lastMessage: message.content.substring(0, 100),
        lastMessageAt: new Date(),
      });

      this.server.to(`user:${recipientId}`).emit('chatUpdated', {
        chatId: data.chatId,
        lastMessage: message.content.substring(0, 100),
        lastMessageAt: new Date(),
      });

      return { success: true, message };
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`);
      client.emit('error', {
        message: error.message || 'Failed to send message',
      });
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle joining a chat room
   */
  @SubscribeMessage('joinChat')
  async handleJoinChat(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: number },
  ) {
    try {
      if (!client.userId) {
        throw new UnauthorizedException('User not authenticated');
      }

      // Verify user is part of the chat
      await this.chatService.getChatById(data.chatId, client.userId);

      // Join the chat room
      client.join(`chat:${data.chatId}`);

      this.logger.log(
        `User ${client.userId} joined chat room ${data.chatId}`,
      );

      return { success: true, chatId: data.chatId };
    } catch (error) {
      this.logger.error(`Error joining chat: ${error.message}`);
      client.emit('error', {
        message: error.message || 'Failed to join chat',
      });
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle leaving a chat room
   */
  @SubscribeMessage('leaveChat')
  handleLeaveChat(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: number },
  ) {
    client.leave(`chat:${data.chatId}`);
    this.logger.log(`User ${client.userId} left chat room ${data.chatId}`);
    return { success: true, chatId: data.chatId };
  }

  /**
   * Handle typing indicator
   */
  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: number; isTyping: boolean },
  ) {
    try {
      if (!client.userId) {
        throw new UnauthorizedException('User not authenticated');
      }

      // Get chat to find recipient
      const chat = await this.chatService.getChatById(
        data.chatId,
        client.userId,
      );

      const recipientId =
        chat.userAId === client.userId ? chat.userBId : chat.userAId;

      // Emit typing status to recipient only
      this.server.to(`user:${recipientId}`).emit('userTyping', {
        chatId: data.chatId,
        userId: client.userId,
        isTyping: data.isTyping,
      });

      return { success: true };
    } catch (error) {
      this.logger.error(`Error handling typing: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle marking messages as read
   */
  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: number },
  ) {
    try {
      if (!client.userId) {
        throw new UnauthorizedException('User not authenticated');
      }

      await this.chatService.markMessagesAsRead(data.chatId, client.userId);

      // Get chat to find the other user
      const chat = await this.chatService.getChatById(
        data.chatId,
        client.userId,
      );

      const otherUserId =
        chat.userAId === client.userId ? chat.userBId : chat.userAId;

      // Notify the other user that their messages were read
      this.server.to(`user:${otherUserId}`).emit('messagesRead', {
        chatId: data.chatId,
        readBy: client.userId,
      });

      return { success: true };
    } catch (error) {
      this.logger.error(`Error marking as read: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if a user is online
   */
  isUserOnline(userId: number): boolean {
    const sockets = this.userSockets.get(userId);
    return this.userSockets.has(userId) && (sockets?.size || 0) > 0;
  }

  /**
   * Get online status for multiple users
   */
  @SubscribeMessage('checkOnlineStatus')
  handleCheckOnlineStatus(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { userIds: number[] },
  ) {
    const onlineStatus: Record<number, boolean> = {};
    
    for (const userId of data.userIds) {
      onlineStatus[userId] = this.isUserOnline(userId);
    }

    return { success: true, onlineStatus };
  }
}

