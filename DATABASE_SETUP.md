# Database Setup

## Initial Setup

1. Create a PostgreSQL database named `db_sharingo`
2. Update your `.env` file with the database credentials
3. Run the application to create tables automatically

## Environment Variables

Make sure to add these environment variables to your `.env` file:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## Google OAuth Setup

```bash
npm install
# or
yarn install
```

## 5. Run the Application

```bash
# Development mode
npm run start:dev
# or
yarn start:dev
```

## 6. Database Features

The application includes:

- **Database Module**: Configured TypeORM with PostgreSQL
- **User Entity**: Example entity with UUID primary key, timestamps, and proper column types
- **Users Module**: Complete CRUD operations for users
- **Environment-based Configuration**: Different settings for development and production

## 7. API Endpoints

Once running, you can test the API endpoints:

- `POST /users` - Create a new user
- `GET /users` - Get all users
- `GET /users/:id` - Get a specific user
- `PATCH /users/:id` - Update a user
- `DELETE /users/:id` - Delete a user

## 8. Example User Creation

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "password": "password123"
  }'
```

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to Credentials and create OAuth 2.0 Client ID
5. Add your application's domain to authorized origins
6. Add your callback URL (e.g., `http://localhost:3000/auth/google-login`)
7. Copy the Client ID and Client Secret to your `.env` file 

## Notes

- The database will automatically create tables when you first run the application (synchronize is enabled in development)
- In production, set `NODE_ENV=production` to disable auto-synchronization
- SSL is automatically configured for production environments 