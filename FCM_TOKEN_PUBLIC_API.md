# Public FCM Token API Documentation

## Overview

This API endpoint allows updating FCM (Firebase Cloud Messaging) tokens without requiring authentication. It's designed to support both guest users and authenticated users.

## Endpoint

**POST** `/notifications/fcm-token/public`

**Authentication:** None (Public endpoint)

## Features

✅ **No authentication required** - Can be called by guest users  
✅ **Optional user association** - Can link token to a user if `userId` is provided  
✅ **Smart updates** - If `deviceId` exists, updates both `fcmToken` and `userId`  
✅ **Guest to authenticated transition** - Guest user tokens can be associated with user accounts later  
✅ **Idempotent** - Safe to call multiple times with the same device  

## Request

### Headers
```
Content-Type: application/json
```

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `deviceId` | string | ✅ Yes | Unique device identifier (e.g., UUID from device) |
| `fcmToken` | string | ✅ Yes | Firebase Cloud Messaging token |
| `userId` | number | ❌ No | User ID to associate with this device (optional) |

### Example Request (Guest User)
```json
{
  "deviceId": "device-uuid-12345-67890",
  "fcmToken": "fcm_token_xxxxxxxxxxxxxx"
}
```

### Example Request (Authenticated User)
```json
{
  "deviceId": "device-uuid-12345-67890",
  "fcmToken": "fcm_token_xxxxxxxxxxxxxx",
  "userId": 123
}
```

## Response

### Success Response (200 OK)

```json
{
  "message": "FCM token updated successfully",
  "success": true,
  "data": {
    "id": 1,
    "deviceId": "device-uuid-12345-67890",
    "fcmToken": "fcm_token_xxxxxxxxxxxxxx",
    "userId": 123,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Error Response (400 Bad Request)

```json
{
  "message": "Validation failed",
  "success": false,
  "data": null
}
```

## Behavior

### Scenario 1: New Device (First Time Registration)

**Request:**
```json
{
  "deviceId": "new-device-123",
  "fcmToken": "fcm_token_abc"
}
```

**Result:** Creates a new record with `userId` as `null`

---

### Scenario 2: Existing Device (Token Refresh)

**Initial Record:**
```json
{
  "deviceId": "device-123",
  "fcmToken": "old_fcm_token",
  "userId": null
}
```

**Request:**
```json
{
  "deviceId": "device-123",
  "fcmToken": "new_fcm_token"
}
```

**Result:** Updates `fcmToken` to "new_fcm_token", `userId` remains `null`

---

### Scenario 3: Guest User Logs In

**Initial Record (Guest):**
```json
{
  "deviceId": "device-123",
  "fcmToken": "fcm_token_abc",
  "userId": null
}
```

**Request (After Login):**
```json
{
  "deviceId": "device-123",
  "fcmToken": "fcm_token_abc",
  "userId": 456
}
```

**Result:** Updates `userId` to `456`, associates the device with the user

---

### Scenario 4: User Switches Accounts on Same Device

**Initial Record:**
```json
{
  "deviceId": "device-123",
  "fcmToken": "fcm_token_abc",
  "userId": 100
}
```

**Request (Different User):**
```json
{
  "deviceId": "device-123",
  "fcmToken": "fcm_token_xyz",
  "userId": 200
}
```

**Result:** Updates both `fcmToken` and `userId` to new values

---

## Frontend Integration Examples

### React Native / Expo

```javascript
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

// Get or create device ID
const getDeviceId = async () => {
  let deviceId = await AsyncStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = uuidv4();
    await AsyncStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
};

// Register FCM token
const registerFCMToken = async (userId = null) => {
  try {
    // Request permission
    const authStatus = await messaging().requestPermission();
    const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      // Get FCM token
      const fcmToken = await messaging().getToken();
      const deviceId = await getDeviceId();

      // Register with backend
      const body = {
        deviceId,
        fcmToken,
        ...(userId && { userId }) // Include userId if available
      };

      const response = await fetch('https://your-api.com/notifications/fcm-token/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const result = await response.json();
      console.log('FCM token registered:', result);
    }
  } catch (error) {
    console.error('Error registering FCM token:', error);
  }
};

// Call on app start (guest user)
registerFCMToken();

// Call after login with userId
const handleLogin = async (userId) => {
  await registerFCMToken(userId);
};

// Listen for token refresh
messaging().onTokenRefresh(async (newToken) => {
  const deviceId = await getDeviceId();
  const userId = await getCurrentUserId(); // Your function to get current user
  
  await fetch('https://your-api.com/notifications/fcm-token/public', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      deviceId,
      fcmToken: newToken,
      ...(userId && { userId })
    })
  });
});
```

### Web (Firebase SDK)

```javascript
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Get or create device ID (stored in localStorage)
const getDeviceId = () => {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
};

// Register FCM token
const registerFCMToken = async (userId = null) => {
  try {
    const messaging = getMessaging();
    const fcmToken = await getToken(messaging, {
      vapidKey: 'YOUR_VAPID_KEY'
    });

    const deviceId = getDeviceId();
    const body = {
      deviceId,
      fcmToken,
      ...(userId && { userId })
    };

    const response = await fetch('/notifications/fcm-token/public', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const result = await response.json();
    console.log('FCM token registered:', result);
  } catch (error) {
    console.error('Error registering FCM token:', error);
  }
};

// Call on app initialization
registerFCMToken();

// Call after user logs in
const onUserLogin = (userId) => {
  registerFCMToken(userId);
};

// Call on user logout (remove userId association)
const onUserLogout = async () => {
  const deviceId = getDeviceId();
  const messaging = getMessaging();
  const fcmToken = await getToken(messaging, { vapidKey: 'YOUR_VAPID_KEY' });
  
  await fetch('/notifications/fcm-token/public', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      deviceId,
      fcmToken
      // Note: No userId, so it becomes a guest token again
    })
  });
};
```

## Use Cases

### 1. **Guest User Browsing**
- User opens the app without logging in
- App registers FCM token without `userId`
- User can receive general/broadcast notifications

### 2. **User Login**
- User logs into their account
- App re-registers FCM token with `userId`
- Token is now associated with the user account
- User receives personalized notifications

### 3. **User Logout**
- User logs out
- App re-registers FCM token without `userId`
- Token becomes a guest token again

### 4. **Token Refresh**
- Firebase generates a new token
- App automatically updates the backend with new token
- Device association remains intact

### 5. **Multi-Device User**
- User logs in on phone (device-A)
- User logs in on tablet (device-B)
- Both devices have separate tokens linked to same `userId`
- Notifications can be sent to all user's devices

## Database Constraints

- `deviceId` is **unique** across the entire table
- Only one token record per `deviceId`
- Multiple devices can have the same `userId`
- `userId` can be `null` for guest users

## Best Practices

1. **Generate Persistent Device ID**: Use UUID and store it persistently (AsyncStorage/localStorage)
2. **Register on App Start**: Always register/update token when app opens
3. **Update on Login/Logout**: Re-register token when user authentication state changes
4. **Handle Token Refresh**: Listen for FCM token refresh events and update backend
5. **Error Handling**: Implement retry logic for failed registrations
6. **Privacy**: Don't send userId for guest users unless they explicitly log in

## Related Endpoints

For authenticated users, you can also use:

- **PUT** `/notifications/fcm-token` - Requires authentication, automatically uses logged-in user's ID
- **DELETE** `/notifications/fcm-token/:deviceId` - Remove FCM token (requires authentication)
- **GET** `/notifications/user-tokens` - Get all tokens for current user (requires authentication)

## Migration from Old System

If you're migrating from the old system where `fcmToken` was stored in the `users` table:

1. Keep the old token endpoint for backward compatibility initially
2. Update frontend to use new public endpoint
3. Gradually phase out the old endpoint
4. Run migration script to move existing tokens to new table (see USER_TOKENS_DOCUMENTATION.md)

