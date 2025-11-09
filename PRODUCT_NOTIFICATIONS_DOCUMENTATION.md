# Product Notifications System Documentation

## Overview

This system automatically creates in-app notifications for all active users when a new product is posted on the platform. Notifications are created asynchronously to ensure product creation remains fast and responsive.

## Features

✅ **Automatic Notifications** - Triggered when new products are created  
✅ **Batch Processing** - Efficiently creates notifications for all users at once  
✅ **Smart Filtering** - Excludes the product owner from receiving notifications  
✅ **Active Users Only** - Only notifies users with active status  
✅ **Rich Payload** - Includes product details for deep linking  
✅ **Location-Aware** - Shows city if available, otherwise "near you"  
✅ **Price Formatting** - Displays "for free" or formatted price  
✅ **Asynchronous** - Doesn't slow down product creation  

## How It Works

### Flow

1. User creates a new product
2. Product is saved to database
3. If product status is `ACTIVE`, trigger notification process (asynchronously)
4. Fetch all active users (excluding product owner)
5. Create notification records for all users
6. Notifications appear in users' notification feeds

### Code Flow

```
POST /products
  → ProductsController.create()
    → ProductsService.create()
      → Save product to database
      → If status === ACTIVE:
        → sendNewProductNotifications() [async, non-blocking]
          → Fetch product with category & address
          → Fetch product owner details
          → NotificationsService.notifyAllUsersAboutNewProduct()
            → Get all active users (except owner)
            → Create notification payload
            → Batch insert notifications
```

## Notification Structure

### Title
```
🎉 New Product Posted!
```

### Message Format

**With City:**
```
[Owner Name] posted [Product Name] for [Price] in [City]
```

**Without City:**
```
[Owner Name] posted [Product Name] for [Price] near you
```

### Examples

```
John Doe posted Computer Table for free in New York
Jane Smith posted iPhone 13 for $500 near you
Alex posted Gaming Chair for $150 in Los Angeles
```

### Notification Payload

```json
{
  "productId": 123,
  "productName": "Computer Table",
  "productSlug": "computer-table-123456",
  "price": 0,
  "categoryId": 5,
  "ownerId": 42,
  "ownerName": "John Doe"
}
```

## Database Record

Each notification is stored in the `notifications` table:

```json
{
  "id": 1,
  "userId": 10,
  "title": "🎉 New Product Posted!",
  "message": "John Doe posted Computer Table for free in New York",
  "module": "product",
  "resourceId": 123,
  "payload": {
    "productId": 123,
    "productName": "Computer Table",
    "productSlug": "computer-table-123456",
    "price": 0,
    "categoryId": 5,
    "ownerId": 42,
    "ownerName": "John Doe"
  },
  "isRead": false,
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

## API Methods

### NotificationsService Methods

#### `notifyAllUsersAboutNewProduct(product, productOwner)`

Creates notifications for all active users about a new product.

**Parameters:**
- `product`: Product object with category and address relations
- `productOwner`: User object with id, firstName, lastName

**Returns:**
```typescript
{
  created: number,  // Number of notifications successfully created
  failed: number    // Number of notifications that failed to create
}
```

**Usage:**
```typescript
const result = await this.notificationsService.notifyAllUsersAboutNewProduct(
  product,
  productOwner
);

console.log(`Created ${result.created} notifications, ${result.failed} failed`);
```

#### `notifyUsersAboutNewProductByLocation(product, productOwner, maxDistanceKm?)`

Future enhancement for location-based notifications.

**Current Implementation:** Falls back to `notifyAllUsersAboutNewProduct()`

**Future Features:**
- Filter users by distance from product location
- Notify users within specified radius
- Consider user location preferences

## Implementation Details

### ProductsService

```typescript
async create(createProductDto: CreateProductDto, userId: number): Promise<Product> {
  // Create and save product
  const savedProduct = await this.productsRepository.save(product);

  // Send notifications asynchronously (only for ACTIVE products)
  if (savedProduct.status === ProductStatus.ACTIVE) {
    this.sendNewProductNotifications(savedProduct.id, userId).catch(error => {
      console.error('Error sending new product notifications:', error);
    });
  }

  return savedProduct;
}

private async sendNewProductNotifications(productId: number, userId: number): Promise<void> {
  // Fetch product with full details
  const product = await this.productsRepository
    .createQueryBuilder('product')
    .leftJoinAndSelect('product.category', 'category')
    .leftJoinAndSelect('product.address', 'address')
    .where('product.id = :id', { id: productId })
    .getOne();

  // Fetch product owner
  const productOwner = await this.userRepository.findOne({
    where: { id: userId },
    select: ['id', 'firstName', 'lastName', 'email'],
  });

  // Send notifications
  const result = await this.notificationsService.notifyAllUsersAboutNewProduct(
    product,
    productOwner,
  );

  console.log(`New product notifications sent: ${result.created} created, ${result.failed} failed`);
}
```

### NotificationsService

```typescript
async notifyAllUsersAboutNewProduct(
  product: any,
  productOwner: any,
): Promise<{ created: number; failed: number }> {
  // Get all active users except product owner
  const activeUsers = await this.userRepository
    .createQueryBuilder('user')
    .select(['user.id', 'user.firstName', 'user.lastName'])
    .where('user.status = :status', { status: 1 })
    .andWhere('user.id != :ownerId', { ownerId: productOwner.id })
    .getMany();

  // Format message
  const priceText = product.price === 0 || product.price === '0' 
    ? 'for free' 
    : `for $${product.price}`;
  
  const locationText = product.address?.city 
    ? ` in ${product.address.city}` 
    : ' near you';

  const title = '🎉 New Product Posted!';
  const message = `${productOwner.firstName || 'Someone'} posted ${product.name} ${priceText}${locationText}`;

  // Create payload
  const payloadData = {
    productId: product.id,
    productName: product.name,
    productSlug: product.nameSlug,
    price: product.price,
    categoryId: product.categoryId,
    ownerId: productOwner.id,
    ownerName: `${productOwner.firstName} ${productOwner.lastName}`.trim(),
  };

  // Batch create notifications
  const notifications = activeUsers.map(user => 
    this.notificationRepository.create({
      userId: user.id,
      title,
      message,
      module: NotificationModule.PRODUCT,
      resourceId: product.id,
      payload: payloadData,
      isRead: false,
    })
  );

  // Save all notifications
  const savedNotifications = await this.notificationRepository.save(notifications);
  
  return { created: savedNotifications.length, failed: 0 };
}
```

## Performance Considerations

### Asynchronous Processing

Notifications are created asynchronously using a fire-and-forget pattern:

```typescript
this.sendNewProductNotifications(savedProduct.id, userId).catch(error => {
  console.error('Error sending new product notifications:', error);
});
```

**Benefits:**
- Product creation API responds immediately
- User doesn't wait for notifications to be created
- Errors in notification creation don't affect product creation

### Batch Insert

Instead of creating notifications one by one, we use TypeORM's batch save:

```typescript
const savedNotifications = await this.notificationRepository.save(notifications);
```

**Performance:**
- Single database transaction
- Reduced database round trips
- Efficient for large user bases

### Optimization for Large User Bases

For platforms with millions of users, consider:

1. **Queue-Based Processing:**
   ```typescript
   // Add to message queue instead of immediate processing
   await queue.add('new-product-notification', {
     productId: savedProduct.id,
     userId: userId
   });
   ```

2. **Chunked Processing:**
   ```typescript
   // Process users in batches of 1000
   const chunkSize = 1000;
   for (let i = 0; i < activeUsers.length; i += chunkSize) {
     const chunk = activeUsers.slice(i, i + chunkSize);
     await this.notificationRepository.save(chunk);
   }
   ```

3. **Location-Based Filtering:**
   ```typescript
   // Only notify users within certain distance
   const nearbyUsers = await this.getUsersNearLocation(
     product.address.latitude,
     product.address.longitude,
     100 // km radius
   );
   ```

## Frontend Integration

### Fetching Notifications

```typescript
// Get user's notifications
GET /notifications?page=1&limit=20

Response:
{
  "message": "Notifications retrieved successfully",
  "success": true,
  "data": {
    "notifications": [...],
    "total": 45
  }
}
```

### Marking as Read

```typescript
// Mark single notification as read
PUT /notifications/:id/read

// Mark all as read
PUT /notifications/mark-all-read
```

### Deep Linking

Use the payload to navigate to product details:

```typescript
const notification = {
  module: "product",
  payload: {
    productSlug: "computer-table-123456",
    productId: 123
  }
};

// Navigate to product details
navigation.navigate('ProductDetails', { 
  slug: notification.payload.productSlug 
});
```

## Configuration

### Disable Notifications for Draft Products

Currently, only `ACTIVE` products trigger notifications:

```typescript
if (savedProduct.status === ProductStatus.ACTIVE) {
  this.sendNewProductNotifications(savedProduct.id, userId).catch(...);
}
```

### Custom Message Templates

Modify the message format in `NotificationsService`:

```typescript
// Current format
const message = `${productOwner.firstName || 'Someone'} posted ${product.name} ${priceText}${locationText}`;

// Custom format examples:
const message = `New ${product.category.name} available ${priceText}!`;
const message = `${productOwner.firstName} listed ${product.name} - Check it out!`;
```

### Notification Filtering

Add filters to exclude certain users:

```typescript
.where('user.status = :status', { status: 1 })
.andWhere('user.id != :ownerId', { ownerId: productOwner.id })
.andWhere('user.emailVerified = :verified', { verified: true }) // Only verified users
.andWhere('user.notificationPreference = :pref', { pref: 'all' }) // User preferences
```

## Testing

### Manual Testing

1. Create a new product via API
2. Check console for notification count:
   ```
   New product notifications sent: 25 created, 0 failed
   ```
3. Query notifications for a test user:
   ```sql
   SELECT * FROM notifications 
   WHERE "userId" = 10 
   ORDER BY "createdAt" DESC;
   ```

### Unit Test Example

```typescript
describe('NotificationsService', () => {
  it('should notify all active users about new product', async () => {
    const product = {
      id: 1,
      name: 'Test Product',
      price: 100,
      nameSlug: 'test-product',
      categoryId: 5,
      address: { city: 'New York' }
    };

    const owner = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe'
    };

    const result = await service.notifyAllUsersAboutNewProduct(product, owner);

    expect(result.created).toBeGreaterThan(0);
    expect(result.failed).toBe(0);
  });
});
```

## Monitoring

### Logging

Monitor notification creation in production:

```typescript
console.log(`New product notifications sent: ${result.created} created, ${result.failed} failed`);
```

### Metrics to Track

- Number of notifications created per product
- Notification creation time
- Failure rate
- User engagement (notification open rate)

## Future Enhancements

1. **Push Notifications:** Send FCM notifications using stored user tokens
2. **Email Notifications:** Optional email for important products
3. **Location-Based:** Filter by user location and preferences
4. **Category Preferences:** Only notify users interested in specific categories
5. **Smart Timing:** Batch notifications and send at optimal times
6. **Notification Digest:** Daily/weekly summary instead of real-time
7. **User Preferences:** Allow users to customize notification settings
8. **Rich Notifications:** Include product images in notifications

## Troubleshooting

### Notifications Not Being Created

**Check:**
1. Product status is `ACTIVE`
2. There are active users in database (status = 1)
3. Product owner is not the only user
4. Check console logs for errors

### Too Many Notifications

**Solutions:**
1. Add user notification preferences
2. Implement rate limiting
3. Add notification grouping/batching
4. Filter by categories user is interested in

### Performance Issues

**Solutions:**
1. Implement queue-based processing
2. Use chunked batch inserts
3. Add location-based filtering
4. Implement notification throttling

