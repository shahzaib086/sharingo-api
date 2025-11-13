# Notifications WebSocket - Quick Reference

## 🔌 Connection

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/notifications', {
  auth: { token: yourJWTToken }
});
```

## 📡 Main Event to Listen

### `newNotification` - Triggered when any new notification is created

```javascript
socket.on('newNotification', (data) => {
  // data.notification contains the full notification object
  // data.timestamp contains when it was emitted
  
  // ✅ REFRESH YOUR NOTIFICATION LIST HERE
  refreshNotificationList();
  
  // ✅ UPDATE NOTIFICATION BADGE COUNT
  incrementBadge();
  
  // Optional: Show toast
  showToast(data.notification.title, data.notification.message);
});
```

## 📦 Notification Object Structure

```typescript
{
  notification: {
    id: number;
    userId: number;
    title: string;              // e.g., "New Message"
    message: string;            // e.g., "You have a new message from John"
    module: string;             // 'message' | 'product' | 'order' | 'video' | 'general'
    resourceId: number | null;  // ID of related resource (sender userId for messages)
    payload: {                  // Additional data specific to notification type
      // For message notifications:
      chatId: number;
      senderId: number;
      senderName: string;
      messageContent: string;
      productId: number;
    };
    isRead: boolean;
    createdAt: string;
    updatedAt: string;
  };
  timestamp: string;
}
```

## 🔔 Example for Message Notifications

```javascript
socket.on('newNotification', (data) => {
  if (data.notification.module === 'message') {
    const { chatId, senderName, messageContent } = data.notification.payload;
    
    console.log(`New message from ${senderName}: ${messageContent}`);
    
    // Refresh notifications in header
    fetchAndUpdateNotifications();
    
    // Show notification badge
    updateBadgeCount();
  }
});
```

## 🎯 Other Events (Optional)

```javascript
// When a notification is marked as read
socket.on('notificationRead', (data) => {
  // data.notificationId - ID of the notification that was read
  decrementBadge();
});

// When all notifications are marked as read
socket.on('allNotificationsRead', () => {
  clearBadge();
});

// Connection successful
socket.on('connected', (data) => {
  console.log('Connected to notifications:', data.userId);
});
```

## 🚀 Implementation Checklist

- [ ] Install `socket.io-client`
- [ ] Connect to `/notifications` namespace with JWT token
- [ ] Listen to `newNotification` event
- [ ] Refresh notification list when event received
- [ ] Update notification badge/count
- [ ] Optional: Show toast/sound notification
- [ ] Disconnect socket on logout

## 📞 Socket URL

- **Development:** `http://localhost:3000/notifications`
- **Production:** `https://your-api-domain.com/notifications`
- **Namespace:** `/notifications`

## 🔐 Authentication

Pass JWT token in one of two ways:

```javascript
// Method 1: auth object
io(url, { auth: { token: jwtToken } })

// Method 2: authorization header
io(url, { 
  extraHeaders: { 
    authorization: `Bearer ${jwtToken}` 
  } 
})
```

## 💡 When is `newNotification` Triggered?

✅ When a user receives a new chat message  
✅ When a new product is posted  
✅ When an order status changes  
✅ Any other notification event in the system  

**Result:** Frontend can immediately refresh the notification list in the header without polling!

