import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationModule } from '../entities/notification.entity';
import { User } from '../entities/user.entity';
import { UserToken } from '../entities/user-token.entity';
import { Product } from '../entities/product.entity';
import { FcmService } from './fcm.service';
import { NotificationsGateway } from './notifications.gateway';

export interface CreateNotificationDto {
  userId: number;
  title: string;
  message: string;
  module: NotificationModule;
  resourceId?: number;
  payload?: any;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserToken)
    private readonly userTokenRepository: Repository<UserToken>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly fcmService: FcmService,
    @Inject(forwardRef(() => NotificationsGateway))
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async createNotification(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create(createNotificationDto);
    const savedNotification = await this.notificationRepository.save(notification);
    
    // Emit WebSocket event to notify user of new notification
    try {
      this.notificationsGateway.emitNewNotification(
        savedNotification.userId,
        savedNotification,
      );
    } catch (error) {
      console.error('Error emitting new notification event:', error);
    }
    
    return savedNotification;
  }

  async getNotificationsByUserId(
    userId: number, 
    page: number = 1, 
    limit: number = 10
  ): Promise<{ 
    notifications: any[]; 
    total: number; 
    page: number; 
    limit: number; 
    totalPages: number;
  }> {
    // Build query with product details
    const queryBuilder = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId })
      .orderBy('notification.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    // Get total count
    const total = await this.notificationRepository.count({
      where: { userId },
    });

    // Get notifications
    const notifications = await queryBuilder.getMany();

    // Fetch product details for notifications with product module
    const notificationsWithProducts = await Promise.all(
      notifications.map(async (notification) => {
        let product: any = null;

        // If notification is about a product, fetch product details
        if (notification.module === 'product' && notification.resourceId) {
          product = await this.productRepository
            .createQueryBuilder('product')
            .select(['product.id', 'product.name', 'product.nameSlug', 'product.image'])
            .where('product.id = :productId', { productId: notification.resourceId })
            .getOne();
        }

        return {
          ...notification,
          product,
        };
      })
    );

    const totalPages = Math.ceil(total / limit);

    return {
      notifications: notificationsWithProducts,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async markAsRead(notificationId: number, userId: number): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.isRead = true;
    const savedNotification = await this.notificationRepository.save(notification);
    
    // Emit WebSocket event
    try {
      this.notificationsGateway.emitNotificationRead(userId, notificationId);
    } catch (error) {
      console.error('Error emitting notification read event:', error);
    }
    
    return savedNotification;
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true }
    );
    
    // Emit WebSocket event
    try {
      this.notificationsGateway.emitAllNotificationsRead(userId);
    } catch (error) {
      console.error('Error emitting all notifications read event:', error);
    }
  }

  async getUnreadCount(userId: number): Promise<number> {
    return await this.notificationRepository.count({
      where: { userId, isRead: false },
    });
  }

  async updateFcmToken(userId: number | null, deviceId: string, fcmToken: string): Promise<UserToken> {
    // Check if token already exists for this device
    let userToken = await this.userTokenRepository.findOne({ 
      where: { deviceId } 
    });

    if (userToken) {
      // Update existing token
      userToken.fcmToken = fcmToken;
      if( userId ) {
        userToken.userId = userId;
      }
    } else {
      // Create new token
      userToken = this.userTokenRepository.create({
        deviceId,
        fcmToken,
        userId: userId || null,
      });
    }

    return await this.userTokenRepository.save(userToken);
  }

  async removeFcmToken(deviceId: string): Promise<void> {
    const userToken = await this.userTokenRepository.findOne({ 
      where: { deviceId } 
    });

    if (userToken) {
      await this.userTokenRepository.remove(userToken);
    }
  }

  async getUserTokensByUserId(userId: number): Promise<UserToken[]> {
    return await this.userTokenRepository.find({
      where: { userId },
    });
  }

  async getAllActiveTokens(): Promise<UserToken[]> {
    return await this.userTokenRepository.find();
  }

  async notifyAndCreateNotification(
    userId: number,
    title: string,
    message: string,
    module: NotificationModule,
    resourceId: number,
    payload: any,
  ): Promise<Notification> {
    const notification = await this.createNotification({
      userId,
      title,
      message,
      module,
      resourceId,
      payload,
    });

    // Send push notification to the user
    await this.sendPushNotificationToUser(userId, title, message, payload);
    await this.notificationsGateway.emitNewNotification(userId, notification);

    return notification;
  }
  async notifyAllUsersAboutNewProduct(
    product: any,
    productOwner: any,
  ): Promise<{ created: number; failed: number }> {
    try {
      // Get all active users except the product owner
      const activeUsers = await this.userRepository
        .createQueryBuilder('user')
        .select(['user.id', 'user.firstName', 'user.lastName'])
        .where('user.status = :status', { status: 1 })
        .andWhere('user.id != :ownerId', { ownerId: productOwner.id })
        .getMany();

      if (activeUsers.length === 0) {
        return { created: 0, failed: 0 };
      }

      // Determine price text
      const priceText = product.price === 0 || product.price === '0' 
        ? 'for free' 
        : `for $${product.price}`;

      // Get location text if available
      const locationText = product.address?.city 
        ? ` in ${product.address.city}` 
        : ' near you';

      // Create notification title and message
      const title = '🎉 New Product Posted!';
      const message = `${productOwner.firstName || 'Someone'} posted ${product.name} ${priceText}${locationText}`;

      // Create payload object
      const payloadData = {
        productId: product.id,
        productName: product.name,
        productSlug: product.nameSlug,
        price: product.price,
        categoryId: product.categoryId,
        ownerId: productOwner.id,
        ownerName: `${productOwner.firstName} ${productOwner.lastName}`.trim(),
      };

      // Prepare notifications for batch insert
      const notifications = activeUsers.map(user => 
        this.notificationRepository.create({
          userId: user.id,
          title,
          message,
          module: NotificationModule.PRODUCT,
          resourceId: product.id,
          payload: payloadData,
          isRead: false,
        })
      );

      // Batch insert notifications
      let created = 0;
      let failed = 0;

      try {
        const savedNotifications = await this.notificationRepository.save(notifications);
        created = savedNotifications.length;

        // Send push notifications to all users asynchronously (don't wait)
        // Exclude the product owner
        this.sendPushNotificationToAllUsers(
          title,
          message,
          payloadData,
          [productOwner.id], // Exclude product owner
        ).catch(error => {
          console.error('Error sending push notifications:', error);
        });
      } catch (error) {
        console.error('Error creating notifications:', error);
        failed = activeUsers.length;
      }

      return { created, failed };
    } catch (error) {
      console.error('Error in notifyAllUsersAboutNewProduct:', error);
      return { created: 0, failed: 0 };
    }
  }

  async notifyUsersAboutNewProductByLocation(
    product: any,
    productOwner: any,
    maxDistanceKm?: number,
  ): Promise<{ created: number; failed: number }> {
    // Future enhancement: notify users based on location preferences
    // For now, we'll use the simple notifyAllUsersAboutNewProduct
    return this.notifyAllUsersAboutNewProduct(product, productOwner);
  }

  /**
   * Send push notifications to specific users
   */
  private async sendPushNotificationsToUsers(
    userIds: number[],
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<void> {
    if (!this.fcmService.isEnabled()) {
      console.log('FCM not enabled, skipping push notifications');
      return;
    }

    try {
      // Get all FCM tokens for these users
      const userTokens = await this.userTokenRepository
        .createQueryBuilder('userToken')
        .where('userToken.userId IN (:...userIds)', { userIds })
        .getMany();

      if (userTokens.length === 0) {
        console.log('No FCM tokens found for users');
        return;
      }

      const tokens = userTokens.map(t => t.fcmToken);

      // Send push notifications
      const result = await this.fcmService.sendToTokens(tokens, title, body, data);

      console.log(
        `Push notifications sent: ${result.successCount} success, ${result.failureCount} failed`,
      );
    } catch (error) {
      console.error('Error sending push notifications to users:', error);
    }
  }

  /**
   * Send push notification to a single user
   */
  async sendPushNotificationToUser(
    userId: number,
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<{ successCount: number; failureCount: number }> {
    return this.fcmService.sendToUser(userId, title, body, data);
  }

  /**
   * Send push notification to all users
   */
  async sendPushNotificationToAllUsers(
    title: string,
    body: string,
    data?: Record<string, any>,
    excludeUserIds?: number[],
  ): Promise<{ successCount: number; failureCount: number }> {
    return this.fcmService.sendToAllUsers(title, body, data, excludeUserIds);
  }
} 