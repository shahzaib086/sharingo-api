import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserToken } from '../entities/user-token.entity';

// Firebase Admin types (will be imported after package installation)
interface FirebaseApp {
  name: string;
}

interface MessagingPayload {
  notification?: {
    title: string;
    body: string;
    imageUrl?: string;
  };
  data?: Record<string, string>;
}

interface MessagingOptions {
  priority?: 'high' | 'normal';
  timeToLive?: number;
}

interface BatchResponse {
  successCount: number;
  failureCount: number;
  responses: Array<{ success: boolean; error?: any }>;
}

@Injectable()
export class FcmService {
  private readonly logger = new Logger(FcmService.name);
  private firebaseApp: FirebaseApp | null = null;
  private messaging: any = null;

  constructor(
    @InjectRepository(UserToken)
    private readonly userTokenRepository: Repository<UserToken>,
    private readonly configService: ConfigService,
  ) {
    this.initializeFirebase();
  }

  private async initializeFirebase(): Promise<void> {
    try {
      // Dynamically import firebase-admin (optional dependency)
      const admin = await import('firebase-admin');

      const serviceAccountPath = this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT_PATH');
      const serviceAccountJson = this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT_JSON');

      let serviceAccount: any;

      if (serviceAccountJson) {
        // Parse JSON from environment variable
        this.logger.log('Loading Firebase credentials from environment variable');
        serviceAccount = JSON.parse(serviceAccountJson);
      } else if (serviceAccountPath) {
        // Load from file path
        this.logger.log(`Loading Firebase credentials from: ${serviceAccountPath}`);
        const path = require('path');
        const fs = require('fs');
        const fullPath = path.resolve(process.cwd(), serviceAccountPath);
        const fileContent = fs.readFileSync(fullPath, 'utf8');
        serviceAccount = JSON.parse(fileContent);
      } else {
        // Fallback: Try to load from notifications folder
        this.logger.log('Checking for Firebase credentials in notifications folder...');
        const path = require('path');
        const fs = require('fs');
        
        // Try multiple possible locations
        const possiblePaths = [
          path.join(__dirname, 'sharingo-19595-7bb31152e8b6.json'), // Compiled (dist/)
          path.join(process.cwd(), 'src', 'notifications', 'sharingo-19595-7bb31152e8b6.json'), // Source
          path.join(process.cwd(), 'dist', 'notifications', 'sharingo-19595-7bb31152e8b6.json'), // Compiled at root
        ];
        
        let foundPath: string | null = null;
        for (const possiblePath of possiblePaths) {
          if (fs.existsSync(possiblePath)) {
            foundPath = possiblePath;
            break;
          }
        }
        
        if (foundPath) {
          this.logger.log(`Found Firebase credentials at: ${foundPath}`);
          const fileContent = fs.readFileSync(foundPath, 'utf8');
          serviceAccount = JSON.parse(fileContent);
        } else {
          this.logger.warn('Firebase credentials not configured. Push notifications will be disabled.');
          this.logger.warn('Checked locations:');
          possiblePaths.forEach(p => this.logger.warn(`  - ${p}`));
          this.logger.warn('Place firebase service account JSON in src/notifications/ folder or configure environment variables');
          return;
        }
      }

      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      this.messaging = admin.messaging();
      this.logger.log('Firebase Cloud Messaging initialized successfully');
      this.logger.log(`Project ID: ${serviceAccount.project_id}`);
    } catch (error) {
      this.logger.error('Failed to initialize Firebase:', error.message);
      this.logger.warn('Push notifications will be disabled');
    }
  }

  /**
   * Check if FCM is enabled and initialized
   */
  isEnabled(): boolean {
    return this.messaging !== null;
  }

  /**
   * Send push notification to a single device token
   */
  async sendToToken(
    token: string,
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isEnabled()) {
      this.logger.warn('FCM not enabled, skipping push notification');
      return { success: false, error: 'FCM not enabled' };
    }

    try {
      const message = {
        notification: {
          title,
          body,
        },
        data: data ? this.convertDataToStrings(data) : undefined,
        token,
        android: {
          priority: 'high' as const,
          notification: {
            sound: 'default',
            channelId: 'default',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await this.messaging.send(message);
      this.logger.log(`Push notification sent successfully: ${response}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to send push notification to token ${token}:`, error.message);
      
      // Check if token is invalid and should be removed
      if (this.isInvalidTokenError(error)) {
        await this.removeInvalidToken(token);
      }

      return { success: false, error: error.message };
    }
  }

  /**
   * Send push notification to multiple device tokens
   */
  async sendToTokens(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<{ successCount: number; failureCount: number; invalidTokens: string[] }> {
    if (!this.isEnabled()) {
      this.logger.warn('FCM not enabled, skipping push notifications');
      return { successCount: 0, failureCount: tokens.length, invalidTokens: [] };
    }

    if (tokens.length === 0) {
      return { successCount: 0, failureCount: 0, invalidTokens: [] };
    }

    console.log('tokens=======', tokens);

    try {
      // FCM allows max 500 tokens per batch
      const batchSize = 500;
      let successCount = 0;
      let failureCount = 0;
      const invalidTokens: string[] = [];

      for (let i = 0; i < tokens.length; i += batchSize) {
        const batch = tokens.slice(i, i + batchSize);
        
        const message = {
          notification: {
            title,
            body,
          },
          data: data ? this.convertDataToStrings(data) : undefined,
          android: {
            priority: 'high' as const,
            notification: {
              sound: 'default',
              channelId: 'default',
            },
          },
          apns: {
            payload: {
              aps: {
                sound: 'default',
                badge: 1,
              },
            },
          },
        };

        const response: BatchResponse = await this.messaging.sendEachForMulticast({
          tokens: batch,
          ...message,
        });

        successCount += response.successCount;
        failureCount += response.failureCount;

        // Collect invalid tokens
        response.responses.forEach((resp, idx) => {
          if (!resp.success && this.isInvalidTokenError(resp.error)) {
            invalidTokens.push(batch[idx]);
          }
        });
      }

      // Remove invalid tokens from database
      if (invalidTokens.length > 0) {
        await this.removeInvalidTokens(invalidTokens);
        this.logger.log(`Removed ${invalidTokens.length} invalid tokens from database`);
      }

      this.logger.log(`Push notifications sent: ${successCount} success, ${failureCount} failed`);
      return { successCount, failureCount, invalidTokens };
    } catch (error) {
      this.logger.error('Failed to send batch push notifications:', error.message);
      return { successCount: 0, failureCount: tokens.length, invalidTokens: [] };
    }
  }

  /**
   * Send push notification to a specific user (all their devices)
   */
  async sendToUser(
    userId: number,
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<{ successCount: number; failureCount: number }> {
    const userTokens = await this.userTokenRepository.find({
      where: { userId },
    });

    if (userTokens.length === 0) {
      this.logger.warn(`No FCM tokens found for user ${userId}`);
      return { successCount: 0, failureCount: 0 };
    }

    const tokens = userTokens.map(t => t.fcmToken);
    const result = await this.sendToTokens(tokens, title, body, data);

    return {
      successCount: result.successCount,
      failureCount: result.failureCount,
    };
  }

  /**
   * Send push notification to all users
   */
  async sendToAllUsers(
    title: string,
    body: string,
    data?: Record<string, any>,
    excludeUserIds?: number[],
  ): Promise<{ successCount: number; failureCount: number }> {
    const queryBuilder = this.userTokenRepository
      .createQueryBuilder('userToken')
      .where('userToken.userId IS NOT NULL');

    if (excludeUserIds && excludeUserIds.length > 0) {
      queryBuilder.andWhere('userToken.userId NOT IN (:...excludeUserIds)', { excludeUserIds });
    }

    const userTokens = await queryBuilder.getMany();

    console.log('userTokens=======', userTokens.length);

    if (userTokens.length === 0) {
      this.logger.warn('No FCM tokens found for any users');
      return { successCount: 0, failureCount: 0 };
    }

    const tokens = userTokens.map(t => t.fcmToken);
    const result = await this.sendToTokens(tokens, title, body, data);

    return {
      successCount: result.successCount,
      failureCount: result.failureCount,
    };
  }

  /**
   * Convert data object to strings (FCM requirement)
   */
  private convertDataToStrings(data: Record<string, any>): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== null && value !== undefined) {
        result[key] = typeof value === 'string' ? value : JSON.stringify(value);
      }
    }
    return result;
  }

  /**
   * Check if error indicates invalid token
   */
  private isInvalidTokenError(error: any): boolean {
    if (!error) return false;
    
    const errorCode = error.code || error.errorInfo?.code;
    const invalidCodes = [
      'messaging/invalid-registration-token',
      'messaging/registration-token-not-registered',
      'messaging/invalid-argument',
    ];

    return invalidCodes.includes(errorCode);
  }

  /**
   * Remove invalid token from database
   */
  private async removeInvalidToken(token: string): Promise<void> {
    try {
      const userToken = await this.userTokenRepository.findOne({
        where: { fcmToken: token },
      });

      if (userToken) {
        await this.userTokenRepository.remove(userToken);
        this.logger.log(`Removed invalid token from database: ${token.substring(0, 20)}...`);
      }
    } catch (error) {
      this.logger.error('Failed to remove invalid token:', error.message);
    }
  }

  /**
   * Remove multiple invalid tokens from database
   */
  private async removeInvalidTokens(tokens: string[]): Promise<void> {
    try {
      await this.userTokenRepository
        .createQueryBuilder()
        .delete()
        .where('fcmToken IN (:...tokens)', { tokens })
        .execute();
    } catch (error) {
      this.logger.error('Failed to remove invalid tokens:', error.message);
    }
  }
}

