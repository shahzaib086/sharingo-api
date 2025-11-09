# Firebase Cloud Messaging (FCM) Push Notifications Setup

## Overview

This guide explains how to set up and use Firebase Cloud Messaging to send push notifications to user devices. The system is integrated with the notification system and automatically sends push notifications when new products are created.

## Installation

### Step 1: Install Firebase Admin SDK

```bash
npm install firebase-admin
```

Or with yarn:

```bash
yarn add firebase-admin
```

### Step 2: Get Firebase Service Account Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon ⚙️ → Project Settings
4. Navigate to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Save the JSON file securely (e.g., `firebase-service-account.json`)

**⚠️ IMPORTANT:** Never commit this file to version control!

## Configuration

### Option 1: Using File Path (Recommended for Development)

Add to your `.env` file:

```env
# Firebase Configuration
FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json
```

Place your `firebase-service-account.json` file in the `config` directory.

### Option 2: Using JSON String (Recommended for Production)

For production environments (Heroku, AWS, etc.), use environment variable:

```env
# Firebase Configuration (JSON string)
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}'
```

### Update .gitignore

Add to your `.gitignore`:

```
# Firebase credentials
firebase-service-account.json
config/firebase-service-account.json
```

## Service Architecture

### FCM Service (`src/notifications/fcm.service.ts`)

The main service for sending push notifications:

```typescript
@Injectable()
export class FcmService {
  // Send to single token
  async sendToToken(token: string, title: string, body: string, data?: Record<string, any>)
  
  // Send to multiple tokens (batch)
  async sendToTokens(tokens: string[], title: string, body: string, data?: Record<string, any>)
  
  // Send to specific user (all devices)
  async sendToUser(userId: number, title: string, body: string, data?: Record<string, any>)
  
  // Send to all users
  async sendToAllUsers(title: string, body: string, data?: Record<string, any>, excludeUserIds?: number[])
  
  // Check if FCM is enabled
  isEnabled(): boolean
}
```

## Features

✅ **Batch Processing** - Sends to up to 500 tokens per batch  
✅ **Invalid Token Cleanup** - Automatically removes expired/invalid tokens  
✅ **Multi-Device Support** - Sends to all user devices  
✅ **Graceful Degradation** - App works even if FCM is not configured  
✅ **Platform Support** - Android & iOS notifications  
✅ **Custom Data** - Include custom payload for deep linking  
✅ **Auto-Retry** - Built-in retry logic  
✅ **Error Handling** - Comprehensive error logging  

## Usage Examples

### Example 1: Send to Single User

```typescript
import { NotificationsService } from './notifications/notifications.service';

@Injectable()
export class YourService {
  constructor(private notificationsService: NotificationsService) {}

  async notifyUser(userId: number) {
    const result = await this.notificationsService.sendPushNotificationToUser(
      userId,
      'Hello!',
      'You have a new message',
      {
        type: 'message',
        messageId: '123',
        senderId: '456'
      }
    );

    console.log(`Sent to ${result.successCount} devices, ${result.failureCount} failed`);
  }
}
```

### Example 2: Send to All Users

```typescript
async notifyAllUsers() {
  const result = await this.notificationsService.sendPushNotificationToAllUsers(
    '🎉 New Feature!',
    'Check out our new marketplace feature!',
    {
      type: 'announcement',
      screen: 'marketplace'
    },
    [1, 2, 3] // Exclude admin users
  );

  console.log(`Sent to ${result.successCount} devices`);
}
```

### Example 3: Direct FCM Service Usage

```typescript
import { FcmService } from './notifications/fcm.service';

@Injectable()
export class YourService {
  constructor(private fcmService: FcmService) {}

  async sendCustomNotification() {
    // Check if FCM is enabled
    if (!this.fcmService.isEnabled()) {
      console.log('FCM not configured');
      return;
    }

    // Send to specific tokens
    const tokens = ['token1', 'token2', 'token3'];
    const result = await this.fcmService.sendToTokens(
      tokens,
      'Custom Title',
      'Custom Message',
      {
        customData: 'value',
        productId: '123'
      }
    );

    console.log(`Success: ${result.successCount}, Failed: ${result.failureCount}`);
  }
}
```

## Automatic Integration

### New Product Notifications

The system automatically sends push notifications when new products are created:

```typescript
// In NotificationsService.notifyAllUsersAboutNewProduct()

// 1. Creates in-app notifications
const savedNotifications = await this.notificationRepository.save(notifications);

// 2. Sends push notifications asynchronously
this.sendPushNotificationsToUsers(
  activeUsers.map(u => u.id),
  '🎉 New Product Posted!',
  'John Doe posted Computer Table for free in New York',
  {
    productId: 123,
    productName: 'Computer Table',
    productSlug: 'computer-table-123456',
    price: 0
  }
).catch(error => {
  console.error('Error sending push notifications:', error);
});
```

## Notification Payload Structure

### Android Notification

```json
{
  "notification": {
    "title": "🎉 New Product Posted!",
    "body": "John Doe posted Computer Table for free"
  },
  "data": {
    "productId": "123",
    "productName": "Computer Table",
    "productSlug": "computer-table-123456",
    "price": "0"
  },
  "android": {
    "priority": "high",
    "notification": {
      "sound": "default",
      "channelId": "default"
    }
  }
}
```

### iOS Notification

```json
{
  "notification": {
    "title": "🎉 New Product Posted!",
    "body": "John Doe posted Computer Table for free"
  },
  "data": {
    "productId": "123",
    "productName": "Computer Table",
    "productSlug": "computer-table-123456",
    "price": "0"
  },
  "apns": {
    "payload": {
      "aps": {
        "sound": "default",
        "badge": 1
      }
    }
  }
}
```

## Frontend Integration

### React Native / Expo

```javascript
import messaging from '@react-native-firebase/messaging';

// Request permission
const authStatus = await messaging().requestPermission();

if (authStatus === messaging.AuthorizationStatus.AUTHORIZED) {
  // Get FCM token
  const fcmToken = await messaging().getToken();
  
  // Register token with backend
  await fetch('/notifications/token/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      deviceId: 'unique-device-id',
      fcmToken: fcmToken,
      userId: 123 // optional
    })
  });
}

// Handle foreground notifications
messaging().onMessage(async remoteMessage => {
  console.log('Notification received:', remoteMessage);
  
  // Show local notification or update UI
  const { title, body } = remoteMessage.notification;
  const data = remoteMessage.data;
  
  // Navigate to product details
  if (data.productSlug) {
    navigation.navigate('ProductDetails', { slug: data.productSlug });
  }
});

// Handle notification tap (app opened from notification)
messaging().onNotificationOpenedApp(remoteMessage => {
  console.log('Notification opened:', remoteMessage);
  
  const data = remoteMessage.data;
  if (data.productSlug) {
    navigation.navigate('ProductDetails', { slug: data.productSlug });
  }
});

// Check if app was opened from notification (app was closed)
messaging()
  .getInitialNotification()
  .then(remoteMessage => {
    if (remoteMessage) {
      console.log('App opened from notification:', remoteMessage);
      // Handle navigation
    }
  });
```

### Web (Firebase SDK)

```javascript
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const messaging = getMessaging();

// Request permission and get token
const token = await getToken(messaging, {
  vapidKey: 'YOUR_VAPID_KEY'
});

// Register token
await fetch('/notifications/token/update', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    deviceId: 'browser-device-id',
    fcmToken: token,
    userId: 123
  })
});

// Handle foreground messages
onMessage(messaging, (payload) => {
  console.log('Message received:', payload);
  
  // Show notification
  new Notification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/icon.png',
    data: payload.data
  });
});
```

## Error Handling

### Invalid Token Handling

The service automatically handles invalid tokens:

```typescript
// If token is invalid, it's automatically removed from database
private isInvalidTokenError(error: any): boolean {
  const invalidCodes = [
    'messaging/invalid-registration-token',
    'messaging/registration-token-not-registered',
    'messaging/invalid-argument',
  ];
  return invalidCodes.includes(error.code);
}

private async removeInvalidToken(token: string): Promise<void> {
  await this.userTokenRepository.delete({ fcmToken: token });
}
```

### Graceful Degradation

If Firebase is not configured, the app continues to work:

```typescript
if (!this.fcmService.isEnabled()) {
  console.log('FCM not enabled, skipping push notifications');
  // In-app notifications still work
  return;
}
```

## Testing

### Test Push Notification

Create a test endpoint:

```typescript
@Controller('test')
export class TestController {
  constructor(private fcmService: FcmService) {}

  @Post('send-push')
  async sendTestPush(@Body() body: { userId: number }) {
    const result = await this.fcmService.sendToUser(
      body.userId,
      'Test Notification',
      'This is a test push notification',
      { type: 'test' }
    );

    return { success: true, result };
  }
}
```

### Manual Testing

1. Register FCM token from mobile app
2. Call test endpoint:
   ```bash
   curl -X POST http://localhost:3000/test/send-push \
     -H "Content-Type: application/json" \
     -d '{"userId": 1}'
   ```
3. Check device for notification

### Check Logs

Monitor console output:

```
Firebase Cloud Messaging initialized successfully
New product notifications sent: 25 created, 0 failed
Push notifications sent: 20 success, 5 failed
Removed 2 invalid tokens from database
```

## Performance Considerations

### Batch Processing

- Processes up to 500 tokens per batch (FCM limit)
- Automatically chunks large user lists
- Asynchronous processing (non-blocking)

### Token Cleanup

- Invalid tokens automatically removed
- Reduces failed notification attempts
- Keeps database clean

### Optimization Tips

1. **Index user_tokens table:**
   ```sql
   CREATE INDEX idx_user_tokens_user ON user_tokens("userId");
   CREATE INDEX idx_user_tokens_device ON user_tokens("deviceId");
   ```

2. **Use async processing:**
   ```typescript
   // Don't await push notifications
   this.sendPushNotifications(...).catch(console.error);
   ```

3. **Implement rate limiting:**
   ```typescript
   // Limit notifications per user per day
   const notificationCount = await this.getNotificationCount(userId, today);
   if (notificationCount > 50) {
     return; // Skip notification
   }
   ```

## Troubleshooting

### FCM Not Sending Notifications

**Check:**
1. Firebase credentials are correctly configured
2. Service account JSON is valid
3. App has correct package name / bundle ID
4. FCM tokens are valid and up-to-date
5. Check Firebase Console for errors

### Notifications Not Received on Device

**Check:**
1. Device has internet connection
2. App has notification permissions
3. FCM token is registered in database
4. Check device logs for errors
5. Test with Firebase Console direct send

### Invalid Token Errors

**Solution:**
- Service automatically cleans up invalid tokens
- Ensure app refreshes tokens on app start
- Implement token refresh listener

## Security Best Practices

1. **Never commit service account JSON:**
   ```bash
   # Add to .gitignore
   **/firebase-service-account*.json
   ```

2. **Use environment variables in production:**
   ```env
   FIREBASE_SERVICE_ACCOUNT_JSON='...'
   ```

3. **Restrict service account permissions:**
   - Only grant Cloud Messaging permissions
   - Don't use Firebase Admin SDK key in frontend

4. **Validate user ownership:**
   ```typescript
   // Only allow users to register their own tokens
   if (req.user.id !== body.userId) {
     throw new ForbiddenException();
   }
   ```

## Monitoring

### Metrics to Track

- Notification delivery rate
- Invalid token rate
- Average delivery time
- User engagement rate

### Logging

```typescript
// Success
console.log(`Push sent: ${result.successCount} success, ${result.failureCount} failed`);

// Invalid tokens
console.log(`Removed ${invalidTokens.length} invalid tokens`);

// Errors
console.error('Failed to send push notification:', error);
```

## Advanced Features

### Scheduled Notifications

```typescript
// Use cron job or task scheduler
@Cron('0 9 * * *') // 9 AM daily
async sendDailyDigest() {
  await this.fcmService.sendToAllUsers(
    'Daily Product Updates',
    'Check out 10 new products near you!',
    { type: 'digest' }
  );
}
```

### Topic-Based Notifications

```typescript
// Subscribe users to topics
await admin.messaging().subscribeToTopic(tokens, 'news');

// Send to topic
await admin.messaging().sendToTopic('news', {
  notification: {
    title: 'Breaking News',
    body: 'Important update!'
  }
});
```

## Cost Considerations

- FCM is **free** for most use cases
- No limit on number of messages
- Monitor Firebase Console for usage
- Consider batching for large user bases

## Next Steps

1. ✅ Install firebase-admin
2. ✅ Configure Firebase credentials
3. ✅ Test with single device
4. ✅ Test with multiple devices
5. ✅ Monitor logs and metrics
6. ✅ Implement frontend notification handling
7. ✅ Add user notification preferences
8. ✅ Set up monitoring and alerts

