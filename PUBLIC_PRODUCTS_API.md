# Public Products API - Documentation

## Overview

A public API endpoint for listing products without authentication. Perfect for displaying products on your homepage, product listing pages, or any public-facing product catalog.

## Endpoint

**GET** `/api/products/public`

**Authentication:** ❌ Not required (Public endpoint)

## Features

✅ No authentication required
✅ Paginated results
✅ Filter by category
✅ Filter by price range (min/max)
✅ Search by keywords (name, description, tags)
✅ Sorted by `createdAt` DESC (newest first)
✅ Only returns ACTIVE products
✅ Includes product media/images
✅ Includes product owner info
✅ Includes category info
✅ Includes product address (if linked)

## Query Parameters

All parameters are **optional**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `categoryId` | Number | - | Filter by product category ID |
| `searchKeywords` | String | - | Search in name, description, and tags |
| `minPrice` | Number | - | Minimum price filter (inclusive) |
| `maxPrice` | Number | - | Maximum price filter (inclusive) |
| `page` | Number | 1 | Page number for pagination |
| `limit` | Number | 20 | Number of products per page |

## Request Examples

### Basic Request (Get all products)
```bash
GET http://localhost:3000/api/products/public
```

### Filter by Category
```bash
GET http://localhost:3000/api/products/public?categoryId=1
```

### Filter by Price Range
```bash
GET http://localhost:3000/api/products/public?minPrice=100&maxPrice=1000
```

### Search by Keywords
```bash
GET http://localhost:3000/api/products/public?searchKeywords=laptop
```

### Combined Filters with Pagination
```bash
GET http://localhost:3000/api/products/public?categoryId=2&minPrice=50&maxPrice=500&searchKeywords=gaming&page=1&limit=20
```

### Using cURL
```bash
curl -X GET "http://localhost:3000/api/products/public?categoryId=1&page=1&limit=20"
```

### Using JavaScript/Axios
```javascript
const response = await axios.get('http://localhost:3000/api/products/public', {
  params: {
    categoryId: 1,
    minPrice: 100,
    maxPrice: 1000,
    searchKeywords: 'laptop',
    page: 1,
    limit: 20
  }
});
```

### Using Fetch API
```javascript
const params = new URLSearchParams({
  categoryId: '1',
  minPrice: '100',
  maxPrice: '1000',
  page: '1',
  limit: '20'
});

const response = await fetch(`http://localhost:3000/api/products/public?${params}`);
const data = await response.json();
```

## Response Format

### Success Response (200 OK)

```json
{
  "message": "Public products retrieved successfully",
  "status": true,
  "data": {
    "products": [
      {
        "id": 1,
        "name": "Gaming Laptop",
        "nameSlug": "gaming-laptop-123456",
        "categoryId": 2,
        "price": 1200.00,
        "description": "High-performance gaming laptop with RTX 3060",
        "views": 150,
        "tags": "gaming,laptop,rtx",
        "createdAt": "2025-11-05T10:00:00.000Z",
        "updatedAt": "2025-11-05T10:00:00.000Z",
        "category": {
          "id": 2,
          "name": "Electronics"
        },
        "user": {
          "id": 5,
          "firstName": "John",
          "lastName": "Doe",
          "image": "/uploads/users/user-5.jpg"
        },
        "address": {
          "id": 10,
          "address1": "123 Main Street",
          "address2": "Apt 4B",
          "city": "New York",
          "state": "NY",
          "country": "USA",
          "zipcode": "10001"
        },
        "media": [
          {
            "id": 1,
            "productId": 1,
            "mediaUrl": "/uploads/products/1-1699876543210-abc123.jpg",
            "type": "image",
            "sequence": 0
          },
          {
            "id": 2,
            "productId": 1,
            "mediaUrl": "/uploads/products/1-1699876543211-def456.jpg",
            "type": "image",
            "sequence": 1
          }
        ]
      },
      // ... more products
    ],
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

### Response Fields Explained

**Root Level:**
- `message`: Success/error message
- `status`: Boolean indicating success (true) or failure (false)
- `data`: Contains the actual data

**Data Object:**
- `products`: Array of product objects
- `total`: Total number of products matching the filters
- `page`: Current page number
- `limit`: Number of items per page
- `totalPages`: Total number of pages available

**Product Object:**
- `id`: Product ID
- `name`: Product name
- `nameSlug`: URL-friendly slug
- `categoryId`: Category ID
- `price`: Product price (decimal)
- `description`: Product description
- `views`: Number of views
- `tags`: Comma-separated tags
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp
- `category`: Category object with `id` and `name`
- `user`: Product owner object with `id`, `firstName`, `lastName`, `image`
- `address`: Address object with location details (if product has an address linked)
  - `id`: Address ID
  - `address1`: Primary address line
  - `address2`: Secondary address line (optional)
  - `city`: City name
  - `state`: State/Province
  - `country`: Country
  - `zipcode`: Postal/ZIP code
- `media`: Array of product media/images

## Usage Examples

### React Component Example

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ProductListing() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    categoryId: null,
    minPrice: null,
    maxPrice: null,
    searchKeywords: '',
    page: 1,
    limit: 20
  });
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Remove null/empty values from params
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v != null && v !== '')
      );

      const response = await axios.get(
        'http://localhost:3000/api/products/public',
        { params }
      );

      setProducts(response.data.data.products);
      setTotalPages(response.data.data.totalPages);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div>
      <h1>Product Listing</h1>
      
      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search..."
          value={filters.searchKeywords}
          onChange={(e) => handleFilterChange('searchKeywords', e.target.value)}
        />
        
        <input
          type="number"
          placeholder="Min Price"
          value={filters.minPrice || ''}
          onChange={(e) => handleFilterChange('minPrice', e.target.value || null)}
        />
        
        <input
          type="number"
          placeholder="Max Price"
          value={filters.maxPrice || ''}
          onChange={(e) => handleFilterChange('maxPrice', e.target.value || null)}
        />
      </div>

      {/* Products Grid */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="products-grid">
            {products.map(product => (
              <div key={product.id} className="product-card">
                <img 
                  src={`http://localhost:3000${product.media[0]?.mediaUrl}`} 
                  alt={product.name}
                />
                <h3>{product.name}</h3>
                <p className="price">${product.price}</p>
                <p className="category">{product.category.name}</p>
                <p className="seller">
                  By: {product.user.firstName} {product.user.lastName}
                </p>
                {product.address && (
                  <p className="location">
                    📍 {product.address.city}, {product.address.state}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={filters.page === page ? 'active' : ''}
              >
                {page}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default ProductListing;
```

### Vue.js Component Example

```vue
<template>
  <div class="product-listing">
    <h1>Products</h1>
    
    <!-- Filters -->
    <div class="filters">
      <input 
        v-model="filters.searchKeywords" 
        type="text" 
        placeholder="Search..."
        @input="fetchProducts"
      />
      <input 
        v-model.number="filters.minPrice" 
        type="number" 
        placeholder="Min Price"
        @input="fetchProducts"
      />
      <input 
        v-model.number="filters.maxPrice" 
        type="number" 
        placeholder="Max Price"
        @input="fetchProducts"
      />
    </div>

    <!-- Products -->
    <div v-if="loading">Loading...</div>
    <div v-else class="products-grid">
      <div 
        v-for="product in products" 
        :key="product.id" 
        class="product-card"
      >
        <img :src="`http://localhost:3000${product.media[0]?.mediaUrl}`" :alt="product.name" />
        <h3>{{ product.name }}</h3>
        <p class="price">${{ product.price }}</p>
        <p class="category">{{ product.category.name }}</p>
        <p v-if="product.address" class="location">
          📍 {{ product.address.city }}, {{ product.address.state }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      products: [],
      loading: false,
      filters: {
        categoryId: null,
        minPrice: null,
        maxPrice: null,
        searchKeywords: '',
        page: 1,
        limit: 20
      },
      totalPages: 0
    };
  },
  mounted() {
    this.fetchProducts();
  },
  methods: {
    async fetchProducts() {
      this.loading = true;
      try {
        const params = Object.fromEntries(
          Object.entries(this.filters).filter(([_, v]) => v != null && v !== '')
        );

        const response = await axios.get(
          'http://localhost:3000/api/products/public',
          { params }
        );

        this.products = response.data.data.products;
        this.totalPages = response.data.data.totalPages;
      } catch (error) {
        console.error('Error:', error);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>
```

## Filter Combinations

### Common Use Cases

1. **Homepage - Latest Products**
   ```
   GET /api/products/public?limit=8
   ```

2. **Category Page**
   ```
   GET /api/products/public?categoryId=1&page=1&limit=20
   ```

3. **Search Results**
   ```
   GET /api/products/public?searchKeywords=laptop&page=1
   ```

4. **Price Range Filter**
   ```
   GET /api/products/public?minPrice=100&maxPrice=500
   ```

5. **Advanced Filter (Category + Price + Search)**
   ```
   GET /api/products/public?categoryId=2&minPrice=100&maxPrice=1000&searchKeywords=gaming
   ```

## Notes

- **Performance:** The API is optimized with proper database indexes and efficient queries
- **Only Active Products:** Only products with status = ACTIVE are returned
- **No Auth Required:** Perfect for public-facing pages
- **Media Included:** All product images/media are included in the response
- **Seller Info:** Basic seller information (name, image) is included
- **Address Included:** Product address/location is included if linked to the product
- **Default Sorting:** Products are sorted by `createdAt DESC` (newest first)

## Differences from Authenticated Endpoint

| Feature | Public API | Authenticated API |
|---------|-----------|-------------------|
| Endpoint | `/api/products/public` | `/api/products` |
| Auth Required | ❌ No | ✅ Yes |
| Returns | All active products | User's own products |
| Default Limit | 20 | 10 |
| Sorting | createdAt DESC | createdAt DESC |
| Price Filters | ✅ Yes | ❌ No |
| Status Filter | Active only | Active + Completed |

## Testing

### Using Swagger UI
1. Navigate to: http://localhost:3000/api/docs
2. Find "Products" section
3. Look for "GET /api/products/public"
4. Click "Try it out"
5. Enter your filters
6. Click "Execute"

### Using Postman
1. Create new GET request
2. URL: `http://localhost:3000/api/products/public`
3. Add query parameters as needed
4. Send request (no headers required)

## Performance Considerations

- Results are paginated (default 20 items per page)
- Database queries are optimized with indexes
- Media is fetched in a single query for all products
- Only necessary fields are selected
- Efficient JOIN operations

## Error Handling

The API follows standard HTTP status codes:

- **200 OK:** Success
- **400 Bad Request:** Invalid parameters (e.g., negative price)
- **500 Internal Server Error:** Server error

All errors return the standard response format:
```json
{
  "message": "Error message here",
  "status": false,
  "data": null
}
```

## Future Enhancements

Potential features that could be added:
- [ ] Sorting options (price, views, name)
- [ ] Location-based filtering
- [ ] Favorite/like count
- [ ] Product condition filter
- [ ] Date range filter

---

**API Version:** 1.0  
**Last Updated:** November 5, 2025  
**Endpoint:** `/api/products/public`

