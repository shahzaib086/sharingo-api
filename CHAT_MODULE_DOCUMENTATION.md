# Chat Module Documentation

## Overview

The chat module provides real-time messaging functionality between users for specific products. Each chat is tied to a product and involves two users: **UserA** (product owner) and **UserB** (interested buyer).

## Features

- ✅ One-to-one chat between users for specific products
- ✅ Real-time messaging via WebSocket
- ✅ REST API for chat operations
- ✅ Message persistence
- ✅ Unread message tracking
- ✅ Typing indicators
- ✅ Online/offline status
- ✅ Message read receipts
- ✅ Paginated message history
- ✅ JWT authentication for both REST and WebSocket

## Database Schema

### Chat Table
```sql
- id: Primary key
- productId: Foreign key to products
- userAId: Foreign key to users (product owner)
- userBId: Foreign key to users (other participant)
- lastMessage: Last message content (truncated to 100 chars)
- lastMessageAt: Timestamp of last message
- unreadCountUserA: Unread messages count for UserA
- unreadCountUserB: Unread messages count for UserB
- createdAt: Chat creation timestamp
- updatedAt: Last update timestamp

Unique Index: (productId, userAId, userBId)
```

### Message Table
```sql
- id: Primary key
- chatId: Foreign key to chats
- senderId: Foreign key to users
- content: Message text content (max 5000 chars)
- isRead: Boolean indicating if message was read
- readAt: Timestamp when message was read
- createdAt: Message creation timestamp
- updatedAt: Last update timestamp

Index: (chatId, createdAt)
```

## REST API Endpoints

Base URL: `/api/chat`

### 1. Initiate Chat
**POST** `/api/chat/initiate`

Initiates a new chat or returns existing chat for a product.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body:**
```json
{
  "productId": 1,
  "userBId": 2
}
```

**Response:**
```json
{
  "message": "Chat initiated successfully",
  "status": true,
  "data": {
    "id": 1,
    "productId": 1,
    "userAId": 5,
    "userBId": 2,
    "lastMessage": null,
    "lastMessageAt": null,
    "unreadCountUserA": 0,
    "unreadCountUserB": 0,
    "createdAt": "2025-11-05T10:00:00.000Z",
    "updatedAt": "2025-11-05T10:00:00.000Z",
    "product": {...},
    "userA": {...},
    "userB": {...}
  }
}
```

### 2. Get Chat Heads
**GET** `/api/chat/heads?page=1&limit=20`

Retrieves all chats for the authenticated user.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters:**
- `page` (optional): Page number, default = 1
- `limit` (optional): Items per page, default = 20

**Response:**
```json
{
  "message": "Chat heads retrieved successfully",
  "status": true,
  "data": {
    "chats": [
      {
        "id": 1,
        "productId": 1,
        "userAId": 5,
        "userBId": 2,
        "lastMessage": "Is this still available?",
        "lastMessageAt": "2025-11-05T10:30:00.000Z",
        "unreadCountUserA": 0,
        "unreadCountUserB": 2,
        "product": {...},
        "userA": {...},
        "userB": {...}
      }
    ],
    "total": 10,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

### 3. Get Chat by ID
**GET** `/api/chat/:chatId`

Retrieves details of a specific chat.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "message": "Chat retrieved successfully",
  "status": true,
  "data": {
    "id": 1,
    "productId": 1,
    "userAId": 5,
    "userBId": 2,
    "lastMessage": "Is this still available?",
    "lastMessageAt": "2025-11-05T10:30:00.000Z",
    "unreadCountUserA": 0,
    "unreadCountUserB": 2,
    "product": {...},
    "userA": {...},
    "userB": {...}
  }
}
```

### 4. Get Messages
**GET** `/api/chat/:chatId/messages?page=1&limit=50`

Retrieves messages for a specific chat.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters:**
- `page` (optional): Page number, default = 1
- `limit` (optional): Messages per page, default = 50

**Response:**
```json
{
  "message": "Messages retrieved successfully",
  "status": true,
  "data": {
    "messages": [
      {
        "id": 1,
        "chatId": 1,
        "senderId": 2,
        "content": "Hello! Is this item still available?",
        "isRead": true,
        "readAt": "2025-11-05T10:35:00.000Z",
        "createdAt": "2025-11-05T10:30:00.000Z",
        "sender": {
          "id": 2,
          "firstName": "John",
          "lastName": "Doe",
          "image": "..."
        }
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 50,
    "totalPages": 1
  }
}
```

### 5. Send Message (REST)
**POST** `/api/chat/message`

Sends a message in a chat (also available via WebSocket).

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body:**
```json
{
  "chatId": 1,
  "content": "Yes, it's still available!"
}
```

**Response:**
```json
{
  "message": "Message sent successfully",
  "status": true,
  "data": {
    "id": 2,
    "chatId": 1,
    "senderId": 5,
    "content": "Yes, it's still available!",
    "isRead": false,
    "readAt": null,
    "createdAt": "2025-11-05T10:31:00.000Z",
    "sender": {...}
  }
}
```

### 6. Mark Messages as Read
**PATCH** `/api/chat/mark-read`

Marks all unread messages in a chat as read for the current user.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body:**
```json
{
  "chatId": 1
}
```

**Response:**
```json
{
  "message": "Messages marked as read successfully",
  "status": true,
  "data": null
}
```

### 7. Get Unread Count
**GET** `/api/chat/unread-count`

Retrieves total unread message count for the authenticated user.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "message": "Unread count retrieved successfully",
  "status": true,
  "data": {
    "count": 5
  }
}
```

## WebSocket Integration

### Connection

**Namespace:** `/chat`

**Connection URL:** `ws://localhost:3000/chat` (or your backend URL)

**Authentication:**
Pass JWT token in one of two ways:
1. In auth object: `{ auth: { token: 'your-jwt-token' } }`
2. In headers: `{ extraHeaders: { authorization: 'Bearer your-jwt-token' } }`

### Events to Emit (Client → Server)

#### 1. Join Chat
```javascript
socket.emit('joinChat', { chatId: 1 });
```

#### 2. Leave Chat
```javascript
socket.emit('leaveChat', { chatId: 1 });
```

#### 3. Send Message
```javascript
socket.emit('sendMessage', {
  chatId: 1,
  content: 'Hello!'
});
```

#### 4. Typing Indicator
```javascript
socket.emit('typing', {
  chatId: 1,
  isTyping: true
});
```

#### 5. Mark as Read
```javascript
socket.emit('markAsRead', { chatId: 1 });
```

#### 6. Check Online Status
```javascript
socket.emit('checkOnlineStatus', {
  userIds: [1, 2, 3]
});
```

### Events to Listen (Server → Client)

#### 1. Connected
```javascript
socket.on('connected', (data) => {
  console.log('Connected:', data);
  // { userId: 1, message: 'Connected to chat server' }
});
```

#### 2. New Message
```javascript
socket.on('newMessage', (data) => {
  console.log('New message:', data);
  // { message: {...}, chatId: 1 }
});
```

#### 3. Chat Updated
```javascript
socket.on('chatUpdated', (data) => {
  console.log('Chat updated:', data);
  // { chatId: 1, lastMessage: '...', lastMessageAt: '...' }
});
```

#### 4. User Typing
```javascript
socket.on('userTyping', (data) => {
  console.log('User typing:', data);
  // { chatId: 1, userId: 2, isTyping: true }
});
```

#### 5. Messages Read
```javascript
socket.on('messagesRead', (data) => {
  console.log('Messages read:', data);
  // { chatId: 1, readBy: 2 }
});
```

#### 6. Error
```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error);
});
```

## React Implementation Example

### 1. Install Dependencies
```bash
npm install socket.io-client
```

### 2. Create Socket Context

```jsx
// contexts/SocketContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children, token }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    const newSocket = io('http://localhost:3000/chat', {
      auth: { token },
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setConnected(true);
    });

    newSocket.on('connected', (data) => {
      console.log('Authenticated:', data);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};
```

### 3. Create Chat Hook

```jsx
// hooks/useChat.js
import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

export const useChat = (chatId) => {
  const { socket, connected } = useSocket();
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);

  // Listen for new messages
  useEffect(() => {
    if (!socket || !chatId) return;

    socket.emit('joinChat', { chatId });

    socket.on('newMessage', (data) => {
      if (data.chatId === chatId) {
        setMessages((prev) => [...prev, data.message]);
      }
    });

    socket.on('userTyping', (data) => {
      if (data.chatId === chatId) {
        setTyping(data.isTyping);
        if (data.isTyping) {
          setTimeout(() => setTyping(false), 3000);
        }
      }
    });

    socket.on('messagesRead', (data) => {
      if (data.chatId === chatId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.senderId !== data.readBy
              ? { ...msg, isRead: true }
              : msg
          )
        );
      }
    });

    return () => {
      socket.emit('leaveChat', { chatId });
      socket.off('newMessage');
      socket.off('userTyping');
      socket.off('messagesRead');
    };
  }, [socket, chatId]);

  // Send message
  const sendMessage = useCallback((content) => {
    if (!socket || !chatId || !content.trim()) return;

    socket.emit('sendMessage', {
      chatId,
      content: content.trim(),
    });
  }, [socket, chatId]);

  // Send typing indicator
  const sendTyping = useCallback((isTyping) => {
    if (!socket || !chatId) return;

    socket.emit('typing', { chatId, isTyping });
  }, [socket, chatId]);

  // Mark as read
  const markAsRead = useCallback(() => {
    if (!socket || !chatId) return;

    socket.emit('markAsRead', { chatId });
  }, [socket, chatId]);

  // Fetch messages via REST API
  const fetchMessages = useCallback(async (page = 1) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE}/chat/${chatId}/messages?page=${page}&limit=50`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setMessages(response.data.data.messages);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [chatId]);

  return {
    messages,
    typing,
    connected,
    sendMessage,
    sendTyping,
    markAsRead,
    fetchMessages,
  };
};
```

### 4. Chat Component Example

```jsx
// components/ChatWindow.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../hooks/useChat';

const ChatWindow = ({ chatId }) => {
  const {
    messages,
    typing,
    connected,
    sendMessage,
    sendTyping,
    markAsRead,
    fetchMessages,
  } = useChat(chatId);

  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    markAsRead();
  }, [chatId, fetchMessages, markAsRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);

    // Send typing indicator
    sendTyping(true);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing indicator after 2 seconds
    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(false);
    }, 2000);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    sendMessage(inputMessage);
    setInputMessage('');
    sendTyping(false);
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <span className={connected ? 'status-online' : 'status-offline'}>
          {connected ? '● Online' : '○ Offline'}
        </span>
      </div>

      <div className="messages-container">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${msg.senderId === currentUserId ? 'sent' : 'received'}`}
          >
            <div className="message-content">{msg.content}</div>
            <div className="message-meta">
              {new Date(msg.createdAt).toLocaleTimeString()}
              {msg.isRead && <span className="read-receipt">✓✓</span>}
            </div>
          </div>
        ))}
        {typing && <div className="typing-indicator">User is typing...</div>}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="message-input">
        <input
          type="text"
          value={inputMessage}
          onChange={handleInputChange}
          placeholder="Type a message..."
          disabled={!connected}
        />
        <button type="submit" disabled={!connected || !inputMessage.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
```

### 5. Chat List Component Example

```jsx
// components/ChatList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

const ChatList = ({ onSelectChat }) => {
  const [chats, setChats] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchChats();
    fetchUnreadCount();
  }, []);

  const fetchChats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/chat/heads?limit=50`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChats(response.data.data.chats);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/chat/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCount(response.data.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  return (
    <div className="chat-list">
      <div className="chat-list-header">
        <h2>Messages</h2>
        {unreadCount > 0 && (
          <span className="unread-badge">{unreadCount}</span>
        )}
      </div>

      {chats.map((chat) => {
        const otherUser = chat.userA.id === currentUserId ? chat.userB : chat.userA;
        const unreadCount = chat.userA.id === currentUserId 
          ? chat.unreadCountUserA 
          : chat.unreadCountUserB;

        return (
          <div
            key={chat.id}
            className="chat-item"
            onClick={() => onSelectChat(chat.id)}
          >
            <img src={otherUser.image} alt={otherUser.name} />
            <div className="chat-item-content">
              <div className="chat-item-header">
                <span className="chat-user-name">{otherUser.name}</span>
                <span className="chat-time">
                  {new Date(chat.lastMessageAt).toLocaleTimeString()}
                </span>
              </div>
              <div className="chat-item-message">
                <span className="product-name">{chat.product.name}</span>
                <p>{chat.lastMessage}</p>
              </div>
            </div>
            {unreadCount > 0 && (
              <span className="unread-count">{unreadCount}</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ChatList;
```

## Best Practices

### Security
- ✅ JWT authentication required for all endpoints and WebSocket connections
- ✅ Users can only access chats they're part of
- ✅ Product ownership validation for chat initiation
- ✅ Input validation with class-validator

### Performance
- ✅ Pagination for messages and chat heads
- ✅ Database indexes on frequently queried columns
- ✅ Efficient WebSocket room management
- ✅ Lazy loading of messages

### User Experience
- ✅ Real-time message delivery
- ✅ Typing indicators
- ✅ Read receipts
- ✅ Online/offline status
- ✅ Unread message badges
- ✅ Message persistence

## Testing

### Test WebSocket Connection with Postman or any WebSocket client

1. Connect to: `ws://localhost:3000/chat`
2. Send authentication:
```json
{
  "auth": {
    "token": "your-jwt-token"
  }
}
```
3. Test events as documented above

### Test REST APIs with Swagger

Visit: `http://localhost:3000/api/docs` and look for the "Chat" tag

## Migration Script

Run this migration to create the tables:

```sql
-- Create chats table
CREATE TABLE chats (
  id SERIAL PRIMARY KEY,
  "productId" INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  "userAId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "userBId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "lastMessage" TEXT,
  "lastMessageAt" TIMESTAMP,
  "unreadCountUserA" INTEGER DEFAULT 0,
  "unreadCountUserB" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_chat UNIQUE ("productId", "userAId", "userBId")
);

-- Create messages table
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  "chatId" INTEGER NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  "senderId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  "isRead" BOOLEAN DEFAULT false,
  "readAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_chats_users ON chats("userAId", "userBId");
CREATE INDEX idx_messages_chat_created ON messages("chatId", "createdAt");
```

## Support

For any issues or questions, please contact the backend team or refer to the NestJS and Socket.IO documentation.

