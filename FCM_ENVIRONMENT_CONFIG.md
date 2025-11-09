# Firebase Cloud Messaging Environment Configuration

## Environment Variables

Add these to your `.env` file:

```env
# Firebase Cloud Messaging Configuration
# Choose ONE of the following options:

# Option 1: File Path (Recommended for Development)
# Place your firebase-service-account.json in the config/ directory
FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json

# Option 2: JSON String (Recommended for Production/Heroku/AWS)
# Paste the entire content of your firebase-service-account.json as a single line
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"your-project-id","private_key_id":"xxxxx","private_key":"-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com","client_id":"xxxxx","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"xxxxx"}'
```

## Setup Instructions

### For Development (Local)

1. Download Firebase service account JSON from Firebase Console
2. Place it in `config/firebase-service-account.json`
3. Add to `.env`:
   ```env
   FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json
   ```

### For Production (Heroku, AWS, etc.)

1. Copy entire content of `firebase-service-account.json`
2. Minify to single line (remove newlines)
3. Add to environment variables:
   ```env
   FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
   ```

## Important Notes

⚠️ **Never commit firebase-service-account.json to git!**

Add to `.gitignore`:
```
firebase-service-account.json
config/firebase-service-account.json
```

✅ **Optional Configuration:**
If neither variable is set, push notifications will be disabled but the app will continue to work normally. In-app notifications will still function.

## Verification

After configuration, check logs on startup:

```bash
# Success
✅ Firebase Cloud Messaging initialized successfully

# Not configured
⚠️ Firebase credentials not configured. Push notifications will be disabled.

# Error
❌ Failed to initialize Firebase: [error message]
```

## Testing

Test if FCM is working:

```typescript
// In your service
if (this.fcmService.isEnabled()) {
  console.log('✅ FCM is ready to send notifications');
} else {
  console.log('⚠️ FCM is not configured');
}
```

