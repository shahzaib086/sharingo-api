# User Tokens (FCM) Documentation

## Overview

The User Tokens feature provides a robust system for managing Firebase Cloud Messaging (FCM) tokens for push notifications. This system supports both authenticated users and guest users, allowing multiple devices per user.

## Database Schema

### Table: `user_tokens`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Auto-incrementing unique identifier |
| `deviceId` | VARCHAR(255) | UNIQUE NOT NULL | Unique device identifier (e.g., UUID) |
| `fcmToken` | TEXT | NOT NULL | Firebase Cloud Messaging token |
| `userId` | INTEGER | NULLABLE, FK to users(id) | User ID (null for guest users) |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Timestamp when token was created |
| `updatedAt` | TIMESTAMP | DEFAULT NOW() | Timestamp when token was last updated |

### Indexes

- `idx_user_tokens_user` - Index on `userId` for fast user token lookups
- `idx_user_tokens_device` - Index on `deviceId` for fast device lookups

### Foreign Keys

- `fk_user_token_user` - Foreign key to `users(id)` with CASCADE delete

## Entity

**File:** `src/entities/user-token.entity.ts`

```typescript
@Entity('user_tokens')
export class UserToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, unique: true })
  deviceId: string;

  @Column({ type: 'text' })
  fcmToken: string;

  @Column({ nullable: true })
  userId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
```

## API Endpoints

### 1. Update/Register FCM Token

**Endpoint:** `PUT /notifications/fcm-token`

**Authentication:** Required (Bearer Token)

**Description:** Register or update an FCM token for a device. If the device already exists, it updates the token and associates it with the current user.

**Request Body:**
```json
{
  "deviceId": "device-uuid-12345",
  "fcmToken": "fcm_token_example_here"
}
```

**Response:**
```json
{
  "message": "FCM token updated successfully",
  "success": true,
  "data": {
    "id": 1,
    "deviceId": "device-uuid-12345",
    "fcmToken": "fcm_token_example_here",
    "userId": 123,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. Remove FCM Token

**Endpoint:** `DELETE /notifications/fcm-token/:deviceId`

**Authentication:** Required (Bearer Token)

**Description:** Remove an FCM token for a specific device.

**URL Parameters:**
- `deviceId` - The unique device identifier

**Response:**
```json
{
  "message": "FCM token removed successfully",
  "success": true,
  "data": null
}
```

### 3. Get User Tokens

**Endpoint:** `GET /notifications/user-tokens`

**Authentication:** Required (Bearer Token)

**Description:** Get all FCM tokens associated with the current user.

**Response:**
```json
{
  "message": "User tokens retrieved successfully",
  "success": true,
  "data": [
    {
      "id": 1,
      "deviceId": "device-uuid-12345",
      "fcmToken": "fcm_token_example_1",
      "userId": 123,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "deviceId": "device-uuid-67890",
      "fcmToken": "fcm_token_example_2",
      "userId": 123,
      "createdAt": "2024-01-02T00:00:00.000Z",
      "updatedAt": "2024-01-02T00:00:00.000Z"
    }
  ]
}
```

## Service Methods

**File:** `src/notifications/notifications.service.ts`

### `updateFcmToken(userId: number | null, deviceId: string, fcmToken: string): Promise<UserToken>`

Updates or creates an FCM token for a device. If the device already exists, it updates the token and userId. Supports guest users (userId can be null).

### `removeFcmToken(deviceId: string): Promise<void>`

Removes an FCM token by device ID.

### `getUserTokensByUserId(userId: number): Promise<UserToken[]>`

Retrieves all FCM tokens associated with a specific user.

### `getAllActiveTokens(): Promise<UserToken[]>`

Retrieves all active FCM tokens in the system (useful for sending broadcast notifications).

## Migration

**File:** `src/database/migrations/create-user-tokens-table.sql`

To create the table, run the SQL migration file:

```bash
psql -U your_username -d your_database -f src/database/migrations/create-user-tokens-table.sql
```

Or if using TypeORM synchronize in development, the table will be created automatically.

## Key Features

1. **Guest User Support**: Tokens can be stored for users who aren't logged in (userId is nullable)
2. **Multiple Devices**: Users can have multiple devices registered, each with its own token
3. **Device Uniqueness**: Each device is uniquely identified by `deviceId` (prevents duplicate registrations)
4. **Auto-Update**: If a device updates its token, the existing record is updated rather than creating a duplicate
5. **Cascade Delete**: When a user is deleted, all their tokens are automatically removed
6. **User Association**: When a guest user logs in, their existing device token can be associated with their user account

## Usage Examples

### Frontend Implementation (Example)

```javascript
// Generate a unique device ID (store this in localStorage/AsyncStorage)
const deviceId = localStorage.getItem('deviceId') || generateUUID();
localStorage.setItem('deviceId', deviceId);

// Get FCM token from Firebase
const fcmToken = await messaging.getToken();

// Register/Update the token
await fetch('/notifications/fcm-token', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    deviceId: deviceId,
    fcmToken: fcmToken
  })
});
```

### Sending Notifications

```typescript
// Get all tokens for a specific user
const userTokens = await notificationsService.getUserTokensByUserId(userId);

// Send notification to all user's devices
for (const token of userTokens) {
  await sendPushNotification(token.fcmToken, {
    title: 'New Message',
    body: 'You have a new message!'
  });
}
```

## Migration from Old System

The previous system stored a single FCM token in the `users.fcmToken` field. This new system allows multiple tokens per user. To migrate:

1. Run the migration SQL to create the `user_tokens` table
2. Optionally, migrate existing tokens from `users.fcmToken` to the new table
3. Update your frontend to send `deviceId` along with `fcmToken`

### Migration Script (Optional)

```sql
-- Migrate existing tokens from users table to user_tokens table
INSERT INTO user_tokens ("deviceId", "fcmToken", "userId", "createdAt", "updatedAt")
SELECT 
  'legacy-' || id::text as "deviceId",
  "fcmToken",
  id as "userId",
  NOW() as "createdAt",
  NOW() as "updatedAt"
FROM users
WHERE "fcmToken" IS NOT NULL AND "fcmToken" != '';
```

## Notes

- The `deviceId` should be a persistent identifier generated on the client side (UUID recommended)
- FCM tokens can expire or change, so update them whenever Firebase provides a new token
- The system automatically handles token updates for existing devices
- Tokens are automatically removed when a user is deleted (CASCADE)

