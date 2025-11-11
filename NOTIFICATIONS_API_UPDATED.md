# ✅ Notifications API - Updated

## What Changed

The notifications listing API has been updated with the following improvements:

### 1. ✅ Paginated Results
- Default page size: **10 notifications per page**
- Includes pagination metadata

### 2. ✅ Product Details Included
Each notification now includes the product object with:
- `id` - Product ID
- `name` - Product name
- `nameSlug` - Product URL slug
- `image` - Product image URL

### 3. ✅ User-Specific
- Returns only notifications for the **logged-in user**
- Requires authentication (Bearer token)

## API Endpoint

**GET** `/notifications`

### Headers
```
Authorization: Bearer <your-jwt-token>
```

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number |
| `limit` | number | No | 10 | Notifications per page |

### Request Example

```bash
# Get first page (10 notifications)
GET /notifications

# Get second page
GET /notifications?page=2

# Get with custom page size
GET /notifications?page=1&limit=20
```

### Response Structure

```json
{
  "message": "Notifications retrieved successfully",
  "success": true,
  "data": {
    "notifications": [
      {
        "id": 1,
        "userId": 123,
        "title": "🎉 New Product Posted!",
        "message": "John Doe posted Computer Table for free in New York",
        "module": "product",
        "resourceId": 456,
        "payload": {
          "productId": 456,
          "productName": "Computer Table",
          "productSlug": "computer-table-123456",
          "price": 0,
          "categoryId": 5,
          "ownerId": 789,
          "ownerName": "John Doe"
        },
        "isRead": false,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z",
        "product": {
          "id": 456,
          "name": "Computer Table",
          "nameSlug": "computer-table-123456",
          "image": "/uploads/products/456-1234567890.jpg"
        }
      },
      {
        "id": 2,
        "userId": 123,
        "title": "🎉 New Product Posted!",
        "message": "Jane Smith posted iPhone 13 for $500 near you",
        "module": "product",
        "resourceId": 789,
        "payload": {
          "productId": 789,
          "productName": "iPhone 13",
          "productSlug": "iphone-13-789012",
          "price": 500,
          "categoryId": 2,
          "ownerId": 234,
          "ownerName": "Jane Smith"
        },
        "isRead": true,
        "createdAt": "2024-01-15T09:15:00.000Z",
        "updatedAt": "2024-01-15T09:20:00.000Z",
        "product": {
          "id": 789,
          "name": "iPhone 13",
          "nameSlug": "iphone-13-789012",
          "image": "/uploads/products/789-0987654321.jpg"
        }
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

### Response Fields

#### Notification Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Notification ID |
| `userId` | number | User ID (always logged-in user) |
| `title` | string | Notification title |
| `message` | string | Notification message |
| `module` | string | Module type (e.g., "product") |
| `resourceId` | number | Related resource ID (e.g., product ID) |
| `payload` | object | Additional notification data |
| `isRead` | boolean | Read status |
| `createdAt` | string | Creation timestamp |
| `updatedAt` | string | Update timestamp |
| `product` | object\|null | Product details (if module is "product") |

#### Product Object (nested)

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Product ID |
| `name` | string | Product name |
| `nameSlug` | string | Product URL slug |
| `image` | string\|null | Product image URL |

#### Pagination Metadata

| Field | Type | Description |
|-------|------|-------------|
| `total` | number | Total notifications count |
| `page` | number | Current page number |
| `limit` | number | Notifications per page |
| `totalPages` | number | Total number of pages |

## Usage Examples

### Example 1: Get First Page

```typescript
const response = await fetch('/notifications', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
console.log(`Showing ${data.data.notifications.length} of ${data.data.total} notifications`);
```

### Example 2: Get Specific Page

```typescript
const page = 2;
const response = await fetch(`/notifications?page=${page}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Example 3: Custom Page Size

```typescript
const response = await fetch('/notifications?page=1&limit=20', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Example 4: Navigate to Product

```typescript
const response = await fetch('/notifications', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();

// Get first notification with product
const notification = data.data.notifications[0];

if (notification.product) {
  // Navigate using product details
  navigation.navigate('ProductDetails', {
    slug: notification.product.nameSlug,
    id: notification.product.id
  });
}
```

## Frontend Implementation

### React Example

```typescript
import { useState, useEffect } from 'react';

function NotificationsList() {
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/notifications?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      setNotifications(data.data.notifications);
      setTotalPages(data.data.totalPages);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Notifications</h2>
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {notifications.map(notification => (
            <div key={notification.id} className="notification">
              <h3>{notification.title}</h3>
              <p>{notification.message}</p>
              
              {notification.product && (
                <div className="product-preview">
                  {notification.product.image && (
                    <img src={notification.product.image} alt={notification.product.name} />
                  )}
                  <a href={`/products/${notification.product.nameSlug}`}>
                    View {notification.product.name}
                  </a>
                </div>
              )}
              
              <small>{new Date(notification.createdAt).toLocaleString()}</small>
            </div>
          ))}
          
          <div className="pagination">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            
            <span>Page {page} of {totalPages}</span>
            
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
```

### React Native Example

```typescript
import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, Image, TouchableOpacity } from 'react-native';

function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/notifications?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      setNotifications(prev => [...prev, ...data.data.notifications]);
      setHasMore(page < data.data.totalPages);
      setPage(p => p + 1);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        if (item.product) {
          navigation.navigate('ProductDetails', {
            slug: item.product.nameSlug
          });
        }
      }}
    >
      <View style={styles.notification}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.message}>{item.message}</Text>
        
        {item.product && (
          <View style={styles.productPreview}>
            {item.product.image && (
              <Image 
                source={{ uri: item.product.image }} 
                style={styles.productImage} 
              />
            )}
            <Text style={styles.productName}>{item.product.name}</Text>
          </View>
        )}
        
        <Text style={styles.time}>
          {new Date(item.createdAt).toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={notifications}
      renderItem={renderNotification}
      keyExtractor={item => item.id.toString()}
      onEndReached={fetchNotifications}
      onEndReachedThreshold={0.5}
      refreshing={loading}
    />
  );
}
```

## Other Notification Endpoints

These remain unchanged:

### Get Unread Count
```
GET /notifications/unread-count
```

### Mark as Read
```
PUT /notifications/:id/read
```

### Mark All as Read
```
PUT /notifications/mark-all-read
```

## Summary

✅ **Pagination:** 10 notifications per page by default  
✅ **Product Details:** Includes id, name, nameSlug, and image  
✅ **User-Specific:** Only returns logged-in user's notifications  
✅ **Metadata:** Total count, current page, and total pages  
✅ **Performance:** Efficient queries with proper indexing  

The API is ready to use! 🎉

