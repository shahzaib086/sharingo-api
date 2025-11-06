# Frontend Quick Start Guide - Chat Integration

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Socket.IO Client
```bash
npm install socket.io-client
```

### Step 2: Create Socket Service (Copy & Paste)

Create `src/services/socket.service.js`:

```javascript
import io from 'socket.io-client';

class SocketService {
  socket = null;
  
  connect(token) {
    this.socket = io('http://localhost:3000/chat', {
      auth: { token },
      transports: ['websocket'],
    });
    
    this.socket.on('connect', () => {
      console.log('✅ Socket connected');
    });
    
    this.socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });
    
    return this.socket;
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
  
  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }
  
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }
  
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

export default new SocketService();
```

### Step 3: Create API Service (Copy & Paste)

Create `src/services/chat.service.js`:

```javascript
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

// Create axios instance with auth
const api = axios.create({
  baseURL: API_BASE,
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const chatService = {
  // Initiate a chat
  async initiateChat(productId, userBId) {
    const response = await api.post('/chat/initiate', { productId, userBId });
    return response.data;
  },

  // Get all chat heads
  async getChatHeads(page = 1, limit = 20) {
    const response = await api.get(`/chat/heads?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get chat by ID
  async getChatById(chatId) {
    const response = await api.get(`/chat/${chatId}`);
    return response.data;
  },

  // Get messages
  async getMessages(chatId, page = 1, limit = 50) {
    const response = await api.get(`/chat/${chatId}/messages?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Send message (via REST, or use WebSocket)
  async sendMessage(chatId, content) {
    const response = await api.post('/chat/message', { chatId, content });
    return response.data;
  },

  // Mark messages as read
  async markAsRead(chatId) {
    const response = await api.patch('/chat/mark-read', { chatId });
    return response.data;
  },

  // Get unread count
  async getUnreadCount() {
    const response = await api.get('/chat/unread-count');
    return response.data;
  },
};

export default chatService;
```

### Step 4: Initialize Socket in Your App

In your main `App.jsx` or layout component:

```javascript
import { useEffect } from 'react';
import socketService from './services/socket.service';

function App() {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      socketService.connect(token);
      
      return () => {
        socketService.disconnect();
      };
    }
  }, []);

  return (
    // Your app components
  );
}
```

## 📱 Basic Usage Examples

### Example 1: Start a Chat (Product Page)

```javascript
import chatService from '../services/chat.service';

function ProductPage({ product, currentUser }) {
  const handleStartChat = async () => {
    try {
      const result = await chatService.initiateChat(
        product.id,
        product.userId  // userBId (if you're the buyer)
      );
      
      const chatId = result.data.id;
      // Navigate to chat page
      navigate(`/chat/${chatId}`);
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  return (
    <div>
      <h1>{product.name}</h1>
      <button onClick={handleStartChat}>
        💬 Message Seller
      </button>
    </div>
  );
}
```

### Example 2: Display Chat List

```javascript
import { useState, useEffect } from 'react';
import chatService from '../services/chat.service';

function ChatList() {
  const [chats, setChats] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadChats();
    loadUnreadCount();
  }, []);

  const loadChats = async () => {
    try {
      const result = await chatService.getChatHeads();
      setChats(result.data.chats);
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const result = await chatService.getUnreadCount();
      setUnreadCount(result.data.count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  return (
    <div>
      <h2>Messages {unreadCount > 0 && `(${unreadCount})`}</h2>
      {chats.map(chat => (
        <div key={chat.id} onClick={() => navigate(`/chat/${chat.id}`)}>
          <img src={chat.product.image} alt={chat.product.name} />
          <div>
            <h3>{chat.product.name}</h3>
            <p>{chat.lastMessage}</p>
          </div>
          {chat.unreadCountUserA > 0 && (
            <span className="badge">{chat.unreadCountUserA}</span>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Example 3: Chat Window with Real-time Messages

```javascript
import { useState, useEffect, useRef } from 'react';
import chatService from '../services/chat.service';
import socketService from '../services/socket.service';

function ChatWindow({ chatId, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadMessages();
    joinChat();
    setupSocketListeners();
    
    return () => {
      leaveChat();
      cleanupSocketListeners();
    };
  }, [chatId]);

  const loadMessages = async () => {
    try {
      const result = await chatService.getMessages(chatId);
      setMessages(result.data.messages);
      await chatService.markAsRead(chatId);
      scrollToBottom();
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const joinChat = () => {
    socketService.emit('joinChat', { chatId });
  };

  const leaveChat = () => {
    socketService.emit('leaveChat', { chatId });
  };

  const setupSocketListeners = () => {
    socketService.on('newMessage', handleNewMessage);
    socketService.on('userTyping', handleUserTyping);
    socketService.on('messagesRead', handleMessagesRead);
  };

  const cleanupSocketListeners = () => {
    socketService.off('newMessage', handleNewMessage);
    socketService.off('userTyping', handleUserTyping);
    socketService.off('messagesRead', handleMessagesRead);
  };

  const handleNewMessage = (data) => {
    if (data.chatId === chatId) {
      setMessages(prev => [...prev, data.message]);
      scrollToBottom();
      
      // Mark as read if not my message
      if (data.message.senderId !== currentUserId) {
        chatService.markAsRead(chatId);
      }
    }
  };

  const handleUserTyping = (data) => {
    if (data.chatId === chatId && data.userId !== currentUserId) {
      setTyping(data.isTyping);
      if (data.isTyping) {
        setTimeout(() => setTyping(false), 3000);
      }
    }
  };

  const handleMessagesRead = (data) => {
    if (data.chatId === chatId) {
      setMessages(prev => 
        prev.map(msg => 
          msg.senderId === currentUserId 
            ? { ...msg, isRead: true } 
            : msg
        )
      );
    }
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    
    // Send typing indicator
    socketService.emit('typing', { chatId, isTyping: true });
    
    // Debounce: Stop typing after 2 seconds
    setTimeout(() => {
      socketService.emit('typing', { chatId, isTyping: false });
    }, 2000);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Send via WebSocket for instant delivery
    socketService.emit('sendMessage', {
      chatId,
      content: inputMessage.trim(),
    });

    setInputMessage('');
    socketService.emit('typing', { chatId, isTyping: false });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="chat-window">
      <div className="messages">
        {messages.map(msg => (
          <div 
            key={msg.id} 
            className={msg.senderId === currentUserId ? 'sent' : 'received'}
          >
            <p>{msg.content}</p>
            <span className="time">
              {new Date(msg.createdAt).toLocaleTimeString()}
              {msg.senderId === currentUserId && msg.isRead && ' ✓✓'}
            </span>
          </div>
        ))}
        {typing && <div className="typing">Typing...</div>}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={inputMessage}
          onChange={handleInputChange}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default ChatWindow;
```

## 🎯 Common Use Cases

### Show Unread Badge in Header
```javascript
function Header() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUnreadCount();
    
    // Update on new messages
    socketService.on('newMessage', loadUnreadCount);
    
    return () => {
      socketService.off('newMessage', loadUnreadCount);
    };
  }, []);

  const loadUnreadCount = async () => {
    const result = await chatService.getUnreadCount();
    setUnreadCount(result.data.count);
  };

  return (
    <header>
      <Link to="/messages">
        💬 Messages {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </Link>
    </header>
  );
}
```

### Check if User is Online
```javascript
function ChatHeader({ otherUserId }) {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    checkOnlineStatus();
    
    const interval = setInterval(checkOnlineStatus, 30000); // Check every 30s
    
    return () => clearInterval(interval);
  }, [otherUserId]);

  const checkOnlineStatus = () => {
    socketService.emit('checkOnlineStatus', { userIds: [otherUserId] });
    
    socketService.on('checkOnlineStatus', (data) => {
      if (data.success) {
        setIsOnline(data.onlineStatus[otherUserId]);
      }
    });
  };

  return (
    <div>
      <span className={isOnline ? 'online' : 'offline'}>
        {isOnline ? '● Online' : '○ Offline'}
      </span>
    </div>
  );
}
```

## 🎨 Sample CSS

```css
/* Chat List */
.chat-item {
  display: flex;
  padding: 12px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.chat-item:hover {
  background-color: #f5f5f5;
}

.unread-badge {
  background-color: #007bff;
  color: white;
  border-radius: 50%;
  padding: 2px 8px;
  font-size: 12px;
}

/* Chat Window */
.chat-window {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.message.sent {
  text-align: right;
  background-color: #007bff;
  color: white;
  border-radius: 12px;
  padding: 8px 12px;
  margin: 4px 0;
  margin-left: auto;
  max-width: 70%;
}

.message.received {
  text-align: left;
  background-color: #f0f0f0;
  border-radius: 12px;
  padding: 8px 12px;
  margin: 4px 0;
  max-width: 70%;
}

.typing {
  font-style: italic;
  color: #666;
  padding: 8px;
}

/* Message Input */
form {
  display: flex;
  padding: 16px;
  border-top: 1px solid #eee;
}

form input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 24px;
  margin-right: 8px;
}

form button {
  padding: 12px 24px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 24px;
  cursor: pointer;
}
```

## 🔧 Troubleshooting

### Socket not connecting?
```javascript
// Check token
const token = localStorage.getItem('token');
console.log('Token:', token);

// Check socket status
socketService.socket.on('connect', () => {
  console.log('✅ Connected');
});

socketService.socket.on('disconnect', () => {
  console.log('❌ Disconnected');
});
```

### Messages not appearing?
```javascript
// Make sure you joined the chat
socketService.emit('joinChat', { chatId });

// Check if event listener is set up
socketService.on('newMessage', (data) => {
  console.log('New message received:', data);
});
```

### CORS errors?
Make sure your backend allows your frontend origin in `src/main.ts`:
```typescript
app.enableCors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
});
```

## 📞 API Endpoints Summary

```
POST   /api/chat/initiate           - Start a chat
GET    /api/chat/heads              - Get chat list
GET    /api/chat/unread-count       - Get unread count
GET    /api/chat/:chatId            - Get chat details
GET    /api/chat/:chatId/messages   - Get messages
POST   /api/chat/message            - Send message (REST)
PATCH  /api/chat/mark-read          - Mark as read
```

## 🌐 WebSocket Events

**Emit (Client → Server):**
- `joinChat` - Join a chat room
- `leaveChat` - Leave a chat room
- `sendMessage` - Send a message
- `typing` - Send typing indicator
- `markAsRead` - Mark messages as read
- `checkOnlineStatus` - Check if users are online

**Listen (Server → Client):**
- `connected` - Connection success
- `newMessage` - New message received
- `chatUpdated` - Chat metadata updated
- `userTyping` - Someone is typing
- `messagesRead` - Messages were read
- `error` - Error occurred

## 🎉 You're Ready!

That's it! You now have everything you need to integrate the chat module into your React app. For more detailed examples and best practices, check `CHAT_MODULE_DOCUMENTATION.md`.

Happy coding! 🚀

