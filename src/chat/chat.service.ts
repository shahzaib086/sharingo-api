import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from '../entities/chat.entity';
import { Message } from '../entities/message.entity';
import { Product } from '../entities/product.entity';
import { User } from '../entities/user.entity';
import { InitiateChatDto } from './dto/initiate-chat.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { GetChatHeadsDto } from './dto/get-chat-heads.dto';
import { GetMessagesDto } from './dto/get-messages.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationModule } from '../entities/notification.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Initiate a new chat or return existing chat
   */
  async initiateChat(
    initiateChatDto: InitiateChatDto,
    userId: number,
  ): Promise<Chat> {
    const { productId, userBId } = initiateChatDto;

    // Validate product exists
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['user'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Validate userB exists
    const userB = await this.userRepository.findOne({
      where: { id: userBId },
    });

    if (!userB) {
      throw new NotFoundException('User not found');
    }

    // userA should be the product owner
    const userAId = product.userId;

    // Prevent users from chatting with themselves
    if (userAId === userBId) {
      throw new BadRequestException('Cannot initiate chat with yourself');
    }

    // Check if the requesting user is either the product owner or userB
    if (userId !== userAId && userId !== userBId) {
      throw new ForbiddenException(
        'You are not authorized to initiate this chat',
      );
    }

    // Check if chat already exists
    let chat = await this.chatRepository.findOne({
      where: {
        productId,
        userAId,
        userBId,
      },
    });

    // If chat doesn't exist, create it
    if (!chat) {
      chat = this.chatRepository.create({
        productId,
        userAId,
        userBId,
      });
      chat = await this.chatRepository.save(chat);
    }

    return chat;
  }

  /**
   * Get all chat heads for a user
   */
  async getChatHeads(
    userId: number,
    getChatHeadsDto: GetChatHeadsDto,
  ): Promise<{
    chats: Chat[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 20 } = getChatHeadsDto;
    const skip = (page - 1) * limit;

    const [chats, total] = await this.chatRepository.findAndCount({
      where: [{ userAId: userId }, { userBId: userId }],
      order: {
        lastMessageAt: 'DESC',
        createdAt: 'DESC',
      },
      skip,
      take: limit,
    });

    return {
      chats,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get all messages for a specific chat
   */
  async getMessages(
    chatId: number,
    userId: number,
    getMessagesDto: GetMessagesDto,
  ): Promise<{
    messages: Message[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 50 } = getMessagesDto;
    const skip = (page - 1) * limit;

    // Verify chat exists and user is part of it
    const chat = await this.chatRepository.findOne({
      where: { id: chatId },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (chat.userAId !== userId && chat.userBId !== userId) {
      throw new ForbiddenException('You are not part of this chat');
    }

    const [messages, total] = await this.messageRepository.findAndCount({
      where: { chatId },
      order: {
        createdAt: 'DESC',
      },
      skip,
      take: limit,
    });

    // Reverse messages to return in chronological order
    messages.reverse();

    return {
      messages,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Send a message in a chat
   */
  async sendMessage(
    sendMessageDto: SendMessageDto,
    userId: number,
    createInAppNotification: boolean = true,
  ): Promise<Message> {
    const { chatId, content } = sendMessageDto;

    // Verify chat exists and user is part of it
    const chat = await this.chatRepository.findOne({
      where: { id: chatId },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (chat.userAId !== userId && chat.userBId !== userId) {
      throw new ForbiddenException('You are not part of this chat');
    }

    // Create the message
    const newMessage = this.messageRepository.create({
      chatId,
      senderId: userId,
      content,
    });

    const savedMessage = await this.messageRepository.save(newMessage);

    // Update chat with last message info
    chat.lastMessage = content.substring(0, 100); // Store first 100 chars
    chat.lastMessageAt = new Date();

    // Increment unread count for the other user
    if (userId === chat.userAId) {
      chat.unreadCountUserB += 1;
    } else {
      chat.unreadCountUserA += 1;
    }

    await this.chatRepository.save(chat);

    // Return message with sender relation loaded
    const messageWithSender = await this.messageRepository.findOne({
      where: { id: savedMessage.id },
    });

    if (!messageWithSender) {
      throw new NotFoundException('Message not found after saving');
    }

    // Create in-app notification for recipient
    try {
      if (createInAppNotification) {
        const recipientId = userId === chat.userAId ? chat.userBId : chat.userAId;
        const sender = messageWithSender.sender;
        const senderName = sender 
          ? `${sender.firstName} ${sender.lastName}`.trim() 
          : 'Someone';

        await this.notificationsService.createNotification({
          userId: recipientId,
          title: 'New Message',
          message: `You have a new message from ${senderName}`,
          module: NotificationModule.MESSAGE,
          resourceId: userId, // sender's userId
          payload: {
            chatId,
            senderId: userId,
            senderName,
            messageContent: content.substring(0, 100),
            productId: chat.productId,
          },
        });
      }
    } catch (notificationError) {
      // Log error but don't fail the message send
      console.error('Error creating in-app notification:', notificationError);
    }

    return messageWithSender;
  }

  /**
   * Mark messages as read in a chat
   */
  async markMessagesAsRead(chatId: number, userId: number): Promise<void> {
    // Verify chat exists and user is part of it
    const chat = await this.chatRepository.findOne({
      where: { id: chatId },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (chat.userAId !== userId && chat.userBId !== userId) {
      throw new ForbiddenException('You are not part of this chat');
    }

    // Mark all unread messages from the other user as read
    await this.messageRepository
      .createQueryBuilder()
      .update(Message)
      .set({ isRead: true, readAt: new Date() })
      .where('chatId = :chatId', { chatId })
      .andWhere('senderId != :userId', { userId })
      .andWhere('isRead = :isRead', { isRead: false })
      .execute();

    // Reset unread count for this user
    if (userId === chat.userAId) {
      chat.unreadCountUserA = 0;
    } else {
      chat.unreadCountUserB = 0;
    }

    await this.chatRepository.save(chat);
  }

  /**
   * Get a specific chat by ID
   */
  async getChatById(chatId: number, userId: number): Promise<Chat> {
    const chat = await this.chatRepository.findOne({
      where: { id: chatId },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (chat.userAId !== userId && chat.userBId !== userId) {
      throw new ForbiddenException('You are not part of this chat');
    }

    return chat;
  }

  /**
   * Get total unread messages count for a user
   */
  async getUnreadCount(userId: number): Promise<number> {
    const chats = await this.chatRepository.find({
      where: [{ userAId: userId }, { userBId: userId }],
    });

    let totalUnread = 0;
    for (const chat of chats) {
      if (chat.userAId === userId) {
        totalUnread += chat.unreadCountUserA;
      } else {
        totalUnread += chat.unreadCountUserB;
      }
    }

    return totalUnread;
  }
}

