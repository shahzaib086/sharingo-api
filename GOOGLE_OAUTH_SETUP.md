# Google OAuth Integration Guide

This guide explains how to set up Google OAuth authentication in your GodLove API application.

## Prerequisites

- Google Cloud Console account
- NestJS application with authentication system
- PostgreSQL database

## Setup Steps

### 1. Google Cloud Console Setup

1. **Create/Select Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable APIs**
   - Navigate to "APIs & Services" > "Library"
   - Search for and enable "Google+ API" or "Google Identity API"

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application" as the application type

4. **Configure OAuth Consent Screen**
   - Add your application name and description
   - Add authorized domains
   - Add scopes: `email`, `profile`, `openid`

5. **Configure OAuth Client**
   - **Authorized JavaScript origins**: Add your frontend domain
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)
   - **Authorized redirect URIs**: Add your backend endpoint
     - `http://localhost:3000/auth/google-login` (for development)
     - `https://yourdomain.com/auth/google-login` (for production)

6. **Copy Credentials**
   - Copy the Client ID and Client Secret
   - Add them to your `.env` file

### 2. Environment Variables

Add these to your `.env` file:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

### 3. Database Migration

Run these SQL commands to add Google OAuth support:

```sql
-- Add Google OAuth columns to users table
ALTER TABLE users 
ADD COLUMN google_id VARCHAR(255),
ADD COLUMN google_access_token VARCHAR(255),
ADD COLUMN google_refresh_token VARCHAR(255),
ADD COLUMN google_picture VARCHAR(255);

-- Make password nullable for Google OAuth users
ALTER TABLE users 
ALTER COLUMN password DROP NOT NULL;
```

### 4. Frontend Integration

#### Using Google Sign-In Button

```html
<!-- Add Google Sign-In script -->
<script src="https://accounts.google.com/gsi/client" async defer></script>

<!-- Add the Google Sign-In button -->
<div id="g_id_onload"
     data-client_id="YOUR_GOOGLE_CLIENT_ID"
     data-callback="handleCredentialResponse">
</div>
<div class="g_id_signin" data-type="standard"></div>

<script>
function handleCredentialResponse(response) {
  // Send the ID token to your backend
  fetch('/auth/google-login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      idToken: response.credential
    })
  })
  .then(res => res.json())
  .then(data => {
    // Handle successful login
    console.log('Login successful:', data);
    // Store the access token
    localStorage.setItem('accessToken', data.data.accessToken);
  })
  .catch(error => {
    console.error('Login failed:', error);
  });
}
</script>
```

#### Using React with @react-oauth/google

```bash
npm install @react-oauth/google
```

```jsx
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

function App() {
  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          // Send to backend
          fetch('/auth/google-login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              idToken: credentialResponse.credential
            })
          })
          .then(res => res.json())
          .then(data => {
            console.log('Login successful:', data);
          });
        }}
        onError={() => {
          console.log('Login Failed');
        }}
      />
    </GoogleOAuthProvider>
  );
}
```

## API Endpoints

### Google Login

**POST** `/auth/google-login`

**Request Body:**
```json
{
  "idToken": "google_id_token_here"
}
```

**Response:**
```json
{
  "message": "Google login successful",
  "success": true,
  "data": {
    "id": 1,
    "accessToken": "jwt_token_here"
  }
}
```

## How It Works

1. **Frontend**: User clicks Google Sign-In button
2. **Google**: Returns an ID token containing user information
3. **Frontend**: Sends the ID token to your backend
4. **Backend**: Verifies the token with Google
5. **Backend**: Creates or updates user in database
6. **Backend**: Returns JWT access token
7. **Frontend**: Stores the access token for authenticated requests

## Security Considerations

1. **Token Verification**: Always verify Google ID tokens on the backend
2. **HTTPS**: Use HTTPS in production
3. **Environment Variables**: Never commit credentials to version control
4. **Token Expiration**: Handle token expiration gracefully
5. **User Data**: Only store necessary user information

## Error Handling

Common errors and solutions:

- **Invalid token**: Check if the token is expired or malformed
- **Wrong audience**: Ensure the client ID matches your Google OAuth client
- **User not found**: Handle cases where user creation fails
- **Database errors**: Implement proper error handling for database operations

## Testing

1. **Development**: Use localhost URLs in Google Console
2. **Production**: Update URLs to your production domain
3. **Testing**: Use Google's test accounts for development

## Troubleshooting

- **"Invalid client" error**: Check your Google Client ID
- **"Redirect URI mismatch"**: Verify redirect URIs in Google Console
- **"Token expired"**: Implement token refresh logic
- **"User creation failed"**: Check database connection and schema

## Additional Features

You can extend this implementation with:

- **Token Refresh**: Implement refresh token logic
- **Profile Updates**: Sync user profile changes
- **Account Linking**: Link Google accounts to existing accounts
- **Logout**: Implement proper logout functionality
- **Multiple Providers**: Add other OAuth providers (Facebook, GitHub, etc.) 