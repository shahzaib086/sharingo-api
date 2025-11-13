# Notifications WebSocket Documentation

## Overview
This document describes how to connect to and use the Notifications WebSocket to receive real-time notification updates in the frontend application.

## WebSocket Connection Details

### Namespace
```
/notifications
```

### Full URL
```javascript
// Development
const SOCKET_URL = 'http://localhost:3000/notifications';

// Production
const SOCKET_URL = 'https://your-api-domain.com/notifications';
```

### CORS Configuration
The WebSocket accepts connections from:
- `http://localhost:5173` (Vite default)
- `http://localhost:3000`
- (Add your production frontend URL as needed)

---

## Connection Setup

### Using Socket.IO Client

**Installation:**
```bash
npm install socket.io-client
```

**Basic Connection:**
```javascript
import { io } from 'socket.io-client';

// Get JWT token from your auth state/storage
const token = localStorage.getItem('authToken'); // or from your auth context

const notificationSocket = io('http://localhost:3000/notifications', {
  auth: {
    token: token  // JWT token for authentication
  },
  // Alternative: pass token in authorization header
  // extraHeaders: {
  //   authorization: `Bearer ${token}`
  // }
});
```

---

## Events

### 1. Connection Events

#### `connected`
Emitted when successfully connected to the notifications server.

**Payload:**
```typescript
{
  userId: number;
  message: string; // "Connected to notifications server"
}
```

**Example:**
```javascript
notificationSocket.on('connected', (data) => {
  console.log('Connected to notifications:', data);
  // { userId: 123, message: "Connected to notifications server" }
});
```

#### `error`
Emitted when there's a connection or authentication error.

**Payload:**
```typescript
{
  message: string; // Error description
}
```

**Example:**
```javascript
notificationSocket.on('error', (error) => {
  console.error('Notification socket error:', error);
  // { message: "Authentication failed" }
});
```

---

### 2. Notification Events

#### `newNotification` ⭐ **MAIN EVENT**
Emitted when a new in-app notification is created for the user.

**When triggered:**
- New message received
- New product posted
- Order status change
- Any other notification event

**Payload:**
```typescript
{
  notification: {
    id: number;
    userId: number;
    title: string;
    message: string;
    module: 'order' | 'product' | 'video' | 'message' | 'general';
    resourceId: number | null;
    payload: any; // Additional data specific to notification type
    isRead: boolean;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
  };
  timestamp: string; // ISO date string
}
```

**Example - Message Notification:**
```javascript
notificationSocket.on('newNotification', (data) => {
  console.log('New notification received:', data);
  
  // Example data for a message notification:
  // {
  //   notification: {
  //     id: 456,
  //     userId: 123,
  //     title: "New Message",
  //     message: "You have a new message from John Doe",
  //     module: "message",
  //     resourceId: 789, // sender's userId
  //     payload: {
  //       chatId: 101,
  //       senderId: 789,
  //       senderName: "John Doe",
  //       messageContent: "Hey, is this still available?",
  //       productId: 555
  //     },
  //     isRead: false,
  //     createdAt: "2025-11-12T10:30:00.000Z",
  //     updatedAt: "2025-11-12T10:30:00.000Z"
  //   },
  //   timestamp: "2025-11-12T10:30:00.123Z"
  // }
  
  // REFRESH YOUR NOTIFICATION LIST HERE
  refreshNotificationList();
  
  // Update notification badge count
  incrementNotificationBadge();
  
  // Optionally show a toast/snackbar
  showToast(data.notification.title, data.notification.message);
});
```

#### `notificationRead`
Emitted when a single notification is marked as read.

**Payload:**
```typescript
{
  notificationId: number;
  timestamp: string; // ISO date string
}
```

**Example:**
```javascript
notificationSocket.on('notificationRead', (data) => {
  console.log('Notification marked as read:', data);
  // { notificationId: 456, timestamp: "2025-11-12T10:35:00.123Z" }
  
  // Update UI to show notification as read
  markNotificationAsReadInUI(data.notificationId);
});
```

#### `allNotificationsRead`
Emitted when all notifications are marked as read for the user.

**Payload:**
```typescript
{
  timestamp: string; // ISO date string
}
```

**Example:**
```javascript
notificationSocket.on('allNotificationsRead', (data) => {
  console.log('All notifications marked as read:', data);
  // { timestamp: "2025-11-12T10:40:00.123Z" }
  
  // Update UI to show all notifications as read
  markAllNotificationsAsReadInUI();
  
  // Clear notification badge
  clearNotificationBadge();
});
```

---

## Complete React Example

### Notification Context/Hook
```typescript
// hooks/useNotificationSocket.ts
import { useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth'; // Your auth hook

let notificationSocket: Socket | null = null;

export const useNotificationSocket = () => {
  const { token, user } = useAuth();

  const connectNotificationSocket = useCallback(() => {
    if (!token || notificationSocket?.connected) return;

    notificationSocket = io('http://localhost:3000/notifications', {
      auth: { token }
    });

    notificationSocket.on('connected', (data) => {
      console.log('✅ Connected to notifications:', data);
    });

    notificationSocket.on('error', (error) => {
      console.error('❌ Notification socket error:', error);
    });

    notificationSocket.on('disconnect', () => {
      console.log('🔌 Disconnected from notifications');
    });

    return notificationSocket;
  }, [token]);

  const disconnectNotificationSocket = useCallback(() => {
    if (notificationSocket) {
      notificationSocket.disconnect();
      notificationSocket = null;
    }
  }, []);

  useEffect(() => {
    if (token && user) {
      connectNotificationSocket();
    }

    return () => {
      disconnectNotificationSocket();
    };
  }, [token, user, connectNotificationSocket, disconnectNotificationSocket]);

  return { notificationSocket, connectNotificationSocket, disconnectNotificationSocket };
};
```

### Header Component with Notification Bell
```typescript
// components/Header.tsx
import { useEffect, useState } from 'react';
import { useNotificationSocket } from '../hooks/useNotificationSocket';
import { getNotifications, getUnreadCount } from '../api/notifications';

export const Header = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const { notificationSocket } = useNotificationSocket();

  // Load initial notifications
  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
  }, []);

  // Listen for new notifications via WebSocket
  useEffect(() => {
    if (!notificationSocket) return;

    // ⭐ MAIN EVENT: Listen for new notifications
    notificationSocket.on('newNotification', (data) => {
      console.log('📬 New notification:', data);
      
      // Refresh notification list
      loadNotifications();
      
      // Update unread count
      setUnreadCount(prev => prev + 1);
      
      // Optional: Show toast notification
      showToast(data.notification.title, data.notification.message);
      
      // Optional: Play notification sound
      playNotificationSound();
    });

    // Listen for notification read events
    notificationSocket.on('notificationRead', (data) => {
      console.log('✓ Notification read:', data.notificationId);
      setUnreadCount(prev => Math.max(0, prev - 1));
      loadNotifications(); // Refresh to show updated state
    });

    // Listen for all notifications read
    notificationSocket.on('allNotificationsRead', () => {
      console.log('✓ All notifications read');
      setUnreadCount(0);
      loadNotifications(); // Refresh to show updated state
    });

    // Cleanup
    return () => {
      notificationSocket.off('newNotification');
      notificationSocket.off('notificationRead');
      notificationSocket.off('allNotificationsRead');
    };
  }, [notificationSocket]);

  const loadNotifications = async () => {
    try {
      const response = await getNotifications({ page: 1, limit: 20 });
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await getUnreadCount();
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const showToast = (title: string, message: string) => {
    // Your toast/notification implementation
    console.log(`Toast: ${title} - ${message}`);
  };

  const playNotificationSound = () => {
    // Optional: Play a notification sound
    const audio = new Audio('/notification-sound.mp3');
    audio.play().catch(e => console.log('Could not play sound:', e));
  };

  return (
    <header>
      <div className="notification-bell">
        <span className="icon">🔔</span>
        {unreadCount > 0 && (
          <span className="badge">{unreadCount}</span>
        )}
      </div>
      {/* Rest of your header */}
    </header>
  );
};
```

---

## Notification Module Types

The `module` field indicates the type of notification:

| Module | Description | resourceId |
|--------|-------------|------------|
| `message` | Chat message received | Sender's userId |
| `product` | Product-related notification | Product ID |
| `order` | Order status update | Order ID |
| `video` | Video-related notification | Video ID |
| `general` | General notification | N/A |

---

## REST API Endpoints (for reference)

These endpoints complement the WebSocket functionality:

```typescript
// Get notifications (paginated)
GET /api/notifications?page=1&limit=20
Response: {
  success: boolean;
  data: {
    notifications: Notification[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
}

// Get unread count
GET /api/notifications/unread-count
Response: {
  success: boolean;
  data: { count: number }
}

// Mark notification as read
PATCH /api/notifications/:id/read
Response: {
  success: boolean;
  data: Notification
}

// Mark all as read
PATCH /api/notifications/mark-all-read
Response: {
  success: boolean;
  data: null
}
```

---

## Best Practices

### 1. Connection Management
- Connect to the socket when user logs in
- Disconnect when user logs out
- Reconnect automatically on connection loss (Socket.IO handles this by default)

### 2. Error Handling
```javascript
notificationSocket.on('connect_error', (error) => {
  console.error('Connection error:', error);
  // Handle reconnection logic if needed
});
```

### 3. Performance
- Debounce notification list refreshes if receiving many notifications
- Use pagination for notification lists
- Consider implementing virtual scrolling for long lists

### 4. User Experience
- Show visual feedback (badge, sound, toast) for new notifications
- Group similar notifications
- Allow users to mute notifications temporarily
- Clear badge when notification panel is opened

---

## Troubleshooting

### Socket not connecting?
1. Check if JWT token is valid and not expired
2. Verify the socket URL matches your API URL
3. Check CORS configuration on the backend
4. Ensure the token is passed correctly in auth or headers

### Not receiving events?
1. Verify socket is connected: `notificationSocket.connected`
2. Check if event listeners are properly attached
3. Verify user ID in the notification matches logged-in user
4. Check browser console for WebSocket errors

### Multiple connections?
1. Ensure you're only creating one socket instance
2. Clean up socket connections in useEffect cleanup
3. Use a singleton pattern or global state for socket management

---

## Support

For issues or questions, contact the backend team or refer to:
- Socket.IO Client docs: https://socket.io/docs/v4/client-api/
- API documentation: (your API docs URL)

