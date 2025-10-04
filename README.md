<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# GodLove API

A NestJS-based API for the GodLove application with authentication, user management, and Google OAuth integration.

## Features

- 🔐 **Authentication System**: JWT-based authentication with password hashing
- 🌐 **Google OAuth**: Social login integration using Google Identity API
- 👥 **User Management**: Complete CRUD operations for users
- 📱 **OTP Verification**: Phone number verification system
- 🗄️ **Database**: PostgreSQL with TypeORM
- 📚 **API Documentation**: Swagger/OpenAPI documentation
- 🛡️ **Security**: Input validation, error handling, and security best practices

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- Google Cloud Console account (for OAuth)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd godlove-api

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Set up database
# Follow the instructions in DATABASE_SETUP.md

# Run the application
npm run start:dev
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_POOL=db_godlove

# Application
PORT=3000
NODE_ENV=development
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=365d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## API Endpoints

### Authentication

- `POST /auth/login` - Regular email/password login
- `POST /auth/google-login` - Google OAuth login
- `POST /auth/signup` - User registration
- `POST /auth/verify-otp` - Verify phone number with OTP
- `POST /auth/resend-otp` - Resend OTP
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with OTP
- `POST /auth/update-password` - Update password (authenticated)
- `DELETE /auth/delete-account` - Delete account (authenticated)
- `GET /auth/me` - Get current user info (authenticated)

### Users

- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### General

- `GET /general/metadata` - Get application metadata
- `GET /general/faqs` - Get FAQs
- `GET /general/questions` - Get questions by group

## Google OAuth Integration

This application includes Google OAuth integration for social login. See [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md) for detailed setup instructions.

### Quick OAuth Setup

1. **Google Cloud Console**:
   - Create OAuth 2.0 credentials
   - Add authorized origins and redirect URIs
   - Copy Client ID and Secret

2. **Database Migration**:
   ```sql
   ALTER TABLE users 
   ADD COLUMN google_id VARCHAR(255),
   ADD COLUMN google_access_token VARCHAR(255),
   ADD COLUMN google_refresh_token VARCHAR(255),
   ADD COLUMN google_picture VARCHAR(255);
   
   ALTER TABLE users 
   ALTER COLUMN password DROP NOT NULL;
   ```

3. **Environment Variables**:
   ```env
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

## Development

```bash
# Development mode
npm run start:dev

# Build
npm run build

# Production mode
npm run start:prod

# Run tests
npm run test
npm run test:e2e

# Database seeding
npm run seed
```

## Database Setup

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed database setup instructions.

## API Documentation

Once the application is running, visit `http://localhost:3000/api` to view the Swagger API documentation.

## Testing

```bash
# Run the test script
node test-google-oauth.js

# Or use curl
curl -X POST http://localhost:3000/auth/google-login \
  -H "Content-Type: application/json" \
  -d '{"idToken": "your_google_id_token"}'
```

## Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── dto/             # Data transfer objects
│   ├── guards/          # Authentication guards
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── users/               # Users module
├── general/             # General endpoints
├── entities/            # Database entities
├── config/              # Configuration
├── database/            # Database setup and seeding
├── common/              # Shared utilities
└── utils/               # Utility functions
```

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Input validation with class-validator
- CORS configuration
- Rate limiting (can be added)
- SQL injection protection (TypeORM)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
