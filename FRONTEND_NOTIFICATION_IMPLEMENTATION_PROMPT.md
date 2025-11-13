# Frontend Implementation: Real-Time Notifications via WebSocket

## 📋 Task Overview
Implement real-time notification system in the frontend that listens to WebSocket events and automatically refreshes the notification list in the header when new notifications arrive.

---

## 🎯 Requirements

### 1. Install Dependencies
```bash
npm install socket.io-client
```

### 2. Create WebSocket Connection
Connect to the notifications WebSocket namespace when the user logs in.

**Socket URL:**
- Development: `http://localhost:3000/notifications`
- Production: `https://your-api-domain.com/notifications`

**Authentication:** Pass JWT token during connection

---

## 📝 Implementation Steps

### Step 1: Create a Notification Socket Hook/Service

Create a reusable hook or service to manage the notification socket connection.

**File: `hooks/useNotificationSocket.ts` or `services/notificationSocket.ts`**

```typescript
import { useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

// Adjust based on your environment
const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

let notificationSocketInstance: Socket | null = null;

export const useNotificationSocket = (token: string | null) => {
  const socketRef = useRef<Socket | null>(null);

  const connect = useCallback(() => {
    // Don't create multiple connections
    if (!token || socketRef.current?.connected) {
      return socketRef.current;
    }

    // Disconnect existing socket if any
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    // Create new connection
    const socket = io(`${SOCKET_URL}/notifications`, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'], // Try websocket first
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    // Connection events
    socket.on('connect', () => {
      console.log('✅ Connected to notification server');
    });

    socket.on('connected', (data) => {
      console.log('✅ Notification server authenticated:', data);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from notification server:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Notification socket error:', error.message);
    });

    socket.on('error', (error) => {
      console.error('❌ Notification server error:', error);
    });

    socketRef.current = socket;
    notificationSocketInstance = socket;
    
    return socket;
  }, [token]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      notificationSocketInstance = null;
      console.log('🔌 Notification socket disconnected');
    }
  }, []);

  useEffect(() => {
    if (token) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      // Don't disconnect on unmount, only on logout
    };
  }, [token, connect, disconnect]);

  return {
    socket: socketRef.current,
    connect,
    disconnect,
  };
};

// Export for use outside hooks
export const getNotificationSocket = () => notificationSocketInstance;
```

---

### Step 2: Update Your Authentication Context/Store

Ensure the notification socket is connected on login and disconnected on logout.

```typescript
// In your auth context/store

const login = async (credentials) => {
  const response = await loginAPI(credentials);
  const { token, user } = response.data;
  
  // Save token and user
  setToken(token);
  setUser(user);
  localStorage.setItem('token', token);
  
  // Connect to notification socket
  // This will be handled by the useNotificationSocket hook
};

const logout = () => {
  // Clear auth state
  setToken(null);
  setUser(null);
  localStorage.removeItem('token');
  
  // Disconnect notification socket
  const socket = getNotificationSocket();
  if (socket) {
    socket.disconnect();
  }
};
```

---

### Step 3: Create Notification Context for State Management

```typescript
// contexts/NotificationContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNotificationSocket } from '../hooks/useNotificationSocket';
import { useAuth } from './AuthContext'; // Your auth context
import { getNotifications, getUnreadCount } from '../api/notifications';

interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  module: string;
  resourceId: number | null;
  payload: any;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useAuth();
  const { socket } = useNotificationSocket(token);
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Load notifications from API
  const refreshNotifications = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const [notifResponse, countResponse] = await Promise.all([
        getNotifications({ page: 1, limit: 20 }),
        getUnreadCount(),
      ]);
      
      setNotifications(notifResponse.data.notifications);
      setUnreadCount(countResponse.data.count);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Initial load
  useEffect(() => {
    if (user) {
      refreshNotifications();
    }
  }, [user, refreshNotifications]);

  // Listen for real-time notification updates
  useEffect(() => {
    if (!socket) return;

    // ⭐ MAIN EVENT: New notification received
    const handleNewNotification = (data: any) => {
      console.log('📬 New notification received:', data);
      
      // Refresh notification list
      refreshNotifications();
      
      // Optional: Show toast notification
      showToast(data.notification.title, data.notification.message);
      
      // Optional: Play sound
      playNotificationSound();
    };

    // Notification marked as read
    const handleNotificationRead = (data: { notificationId: number }) => {
      console.log('✓ Notification read:', data.notificationId);
      refreshNotifications();
    };

    // All notifications marked as read
    const handleAllNotificationsRead = () => {
      console.log('✓ All notifications marked as read');
      refreshNotifications();
    };

    // Register event listeners
    socket.on('newNotification', handleNewNotification);
    socket.on('notificationRead', handleNotificationRead);
    socket.on('allNotificationsRead', handleAllNotificationsRead);

    // Cleanup
    return () => {
      socket.off('newNotification', handleNewNotification);
      socket.off('notificationRead', handleNotificationRead);
      socket.off('allNotificationsRead', handleAllNotificationsRead);
    };
  }, [socket, refreshNotifications]);

  const showToast = (title: string, message: string) => {
    // Implement your toast/snackbar notification
    // Example with react-toastify:
    // toast.info(`${title}: ${message}`);
    console.log(`Toast: ${title} - ${message}`);
  };

  const playNotificationSound = () => {
    // Optional: Play notification sound
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Could not play sound:', e));
    } catch (error) {
      console.log('Sound not available');
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await markNotificationAsReadAPI(id);
      refreshNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsReadAPI();
      refreshNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
```

---

### Step 4: Update Header Component with Notification Bell

```typescript
// components/Header.tsx
import React, { useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import NotificationDropdown from './NotificationDropdown';

export const Header: React.FC = () => {
  const { unreadCount, notifications, markAsRead, markAllAsRead } = useNotifications();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="header">
      <div className="notification-container">
        <button 
          className="notification-bell"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <BellIcon />
          {unreadCount > 0 && (
            <span className="notification-badge">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {showDropdown && (
          <NotificationDropdown
            notifications={notifications}
            onClose={() => setShowDropdown(false)}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
          />
        )}
      </div>
      
      {/* Rest of your header */}
    </header>
  );
};
```

---

### Step 5: Create API Functions

```typescript
// api/notifications.ts
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const getNotifications = async (params: { page: number; limit: number }) => {
  return axios.get(`${API_URL}/api/notifications`, {
    params,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
};

export const getUnreadCount = async () => {
  return axios.get(`${API_URL}/api/notifications/unread-count`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
};

export const markNotificationAsReadAPI = async (id: number) => {
  return axios.patch(
    `${API_URL}/api/notifications/${id}/read`,
    {},
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  );
};

export const markAllNotificationsAsReadAPI = async () => {
  return axios.patch(
    `${API_URL}/api/notifications/mark-all-read`,
    {},
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  );
};
```

---

### Step 6: Wrap App with NotificationProvider

```typescript
// App.tsx
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        {/* Your app routes and components */}
      </NotificationProvider>
    </AuthProvider>
  );
}
```

---

## 🔔 Notification Event Details

### Event: `newNotification`

This is the main event you need to listen to. It's emitted whenever a new notification is created for the logged-in user.

**Payload Structure:**
```typescript
{
  notification: {
    id: number;
    userId: number;
    title: string;              // e.g., "New Message"
    message: string;            // e.g., "You have a new message from John Doe"
    module: string;             // 'message' | 'product' | 'order' | 'video' | 'general'
    resourceId: number | null;  // Related resource ID (e.g., sender's userId for messages)
    payload: {                  // Additional data (varies by notification type)
      // For message notifications:
      chatId: number;
      senderId: number;
      senderName: string;
      messageContent: string;
      productId: number;
    };
    isRead: boolean;
    createdAt: string;          // ISO date string
    updatedAt: string;          // ISO date string
  };
  timestamp: string;            // ISO date string
}
```

### Example Message Notification:
```javascript
{
  notification: {
    id: 123,
    userId: 456,
    title: "New Message",
    message: "You have a new message from John Doe",
    module: "message",
    resourceId: 789, // Sender's userId
    payload: {
      chatId: 101,
      senderId: 789,
      senderName: "John Doe",
      messageContent: "Hey, is this product still available?",
      productId: 555
    },
    isRead: false,
    createdAt: "2025-11-12T10:30:00.000Z",
    updatedAt: "2025-11-12T10:30:00.000Z"
  },
  timestamp: "2025-11-12T10:30:00.123Z"
}
```

---

## 🎨 UI/UX Recommendations

### 1. Notification Badge
- Show unread count on bell icon
- Update in real-time when new notifications arrive
- Clear when notifications are marked as read

### 2. Toast/Snackbar (Optional but Recommended)
- Show brief popup when new notification arrives
- Display sender name and message preview
- Auto-dismiss after 3-5 seconds
- Click to navigate to relevant page

### 3. Notification Dropdown
- List of recent notifications
- Show unread with different styling (bold text, blue dot)
- Click notification to mark as read and navigate
- "Mark all as read" button
- Link to full notifications page

### 4. Sound (Optional)
- Play subtle sound on new notification
- Allow users to mute in settings
- Don't play if user has tab in background

### 5. Navigation
Handle notification clicks based on module:
```typescript
const handleNotificationClick = (notification: Notification) => {
  // Mark as read
  markAsRead(notification.id);
  
  // Navigate based on type
  switch (notification.module) {
    case 'message':
      const { chatId } = notification.payload;
      navigate(`/chat/${chatId}`);
      break;
    case 'product':
      navigate(`/products/${notification.resourceId}`);
      break;
    case 'order':
      navigate(`/orders/${notification.resourceId}`);
      break;
    // ... other cases
  }
  
  // Close dropdown
  setShowDropdown(false);
};
```

---

## ✅ Testing Checklist

- [ ] Socket connects successfully on login
- [ ] Socket disconnects on logout
- [ ] Notification badge shows correct unread count
- [ ] `newNotification` event received when new notification created
- [ ] Notification list refreshes automatically
- [ ] Badge count updates in real-time
- [ ] Clicking notification marks it as read
- [ ] "Mark all as read" works correctly
- [ ] Toast notification appears (if implemented)
- [ ] Clicking notification navigates to correct page
- [ ] Works across multiple browser tabs
- [ ] Reconnects automatically on connection loss
- [ ] No duplicate socket connections created

---

## 🐛 Common Issues & Solutions

### Socket not connecting?
- Verify API URL is correct
- Check JWT token is valid and not expired
- Ensure token is passed in `auth` object
- Check browser console for WebSocket errors

### Not receiving notifications?
- Verify socket is connected: `socket.connected`
- Check event listeners are properly registered
- Ensure you're logged in as the correct user
- Check backend logs for notification creation

### Multiple socket connections?
- Only create one socket instance per user session
- Use singleton pattern or global state
- Cleanup on component unmount

### Notifications not refreshing?
- Ensure `refreshNotifications()` is called in event handler
- Check API endpoint is returning correct data
- Verify JWT token in API requests

---

## 📚 Additional Resources

- Socket.IO Client Documentation: https://socket.io/docs/v4/client-api/
- Backend documentation: See `NOTIFICATIONS_WEBSOCKET_DOCUMENTATION.md`
- Quick reference: See `NOTIFICATIONS_SOCKET_QUICK_REFERENCE.md`

---

## 🚀 Expected Result

After implementation:
1. User logs in → Socket connects automatically
2. New message received → `newNotification` event fires
3. Notification list refreshes automatically in header
4. Badge count updates in real-time
5. User clicks notification → Marks as read and navigates
6. User logs out → Socket disconnects

**No polling needed! Real-time updates via WebSocket!** 🎉

---

## 📞 Support

For questions or issues:
- Check backend documentation files
- Review Socket.IO client docs
- Check browser console for errors
- Verify socket connection status
- Contact backend team if needed

