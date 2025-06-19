# Firebase Google Authentication Setup

This guide will help you set up Firebase Google authentication for the ATB Tracker application.

## Prerequisites

1. A Google account
2. A Firebase project

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or select an existing project
3. Follow the setup wizard to create your project

## Step 2: Enable Google Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click on the "Sign-in method" tab
3. Click on "Google" in the list of providers
4. Enable Google authentication by toggling the switch
5. Add your authorized domain (localhost for development)
6. Save the changes

## Step 3: Get Firebase Configuration

1. In your Firebase project, go to "Project settings" (gear icon)
2. Scroll down to "Your apps" section
3. Click on the web app icon (</>) to add a web app
4. Register your app with a nickname
5. Copy the Firebase configuration object

## Step 4: Update Firebase Configuration

1. Open `frontend/lib/firebase.ts`
2. Replace the placeholder configuration with your actual Firebase config:

```Typescript
const firebaseConfig = {
  apiKey: "AIzaSyCCYEMkr5ThnV3jFuot5_HlsZqLVm26XQ0",
  authDomain: "atb-tracker-eb793.firebaseapp.com",
  projectId: "atb-tracker-eb793",
  storageBucket: "atb-tracker-eb793.firebasestorage.app",
  messagingSenderId: "579773486576",
  appId: "1:579773486576:web:9eb602eb970e36b926f935",
};
```

## Step 5: Set up Firebase Admin SDK

1. In your Firebase project, go to "Project settings"
2. Go to the "Service accounts" tab
3. Click "Generate new private key"
4. Download the JSON file
5. Open `frontend/pages/api/auth/google.js`
6. Replace the placeholder service account with your actual service account details:

```javascript
const serviceAccount = {
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "your-private-key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_PRIVATE_KEY\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com",
  "client_id": "your-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project-id.iam.gserviceaccount.com"
};
```

## Step 6: Environment Variables (Recommended)

For better security, use environment variables instead of hardcoding the configuration:

1. Create a `.env.local` file in the frontend directory
2. Add your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

3. Update `frontend/lib/firebase.ts` to use environment variables:

```typescript
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};
```

## Step 7: Run the Application

1. Start the Django backend:
   ```bash
   cd atb-tracker/backend
   python manage.py runserver
   ```

2. Start the Next.js frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000`

## Features

- **Google Sign-up**: New users can sign up using their Google account
- **Google Login**: Existing users can log in using their Google account
- **Token-based Authentication**: Secure JWT tokens for API access
- **User Data Storage**: User information is stored in the SQLite database
- **Automatic Token Verification**: Tokens are automatically verified on each request
- **Secure Logout**: Proper cleanup of authentication state

## How It Works

1. User clicks "Sign up with Google" or "Continue with Google"
2. Firebase opens Google OAuth popup
3. User authenticates with Google
4. Firebase returns user data and ID token
5. Frontend sends ID token to Next.js API
6. Next.js API verifies token with Firebase Admin SDK
7. Next.js API sends user data to Django backend
8. Django backend creates/updates user in database
9. Django backend returns authentication token
10. Frontend stores token and redirects to dashboard

## Security Features

- Firebase ID token verification
- Secure token generation and storage
- Token expiration (30 days)
- Automatic token cleanup on logout
- CORS protection
- Input validation and sanitization

## Troubleshooting

1. **CORS Errors**: Make sure your Firebase project has the correct authorized domains
2. **Token Verification Fails**: Check that your Firebase Admin SDK configuration is correct
3. **Database Errors**: Ensure all migrations have been applied
4. **Authentication Popup Blocked**: Make sure popups are allowed for your domain

## Notes

- The application supports both email and Google authentication
- User data is stored in the SQLite database with Firebase UID for reference
- Tokens are automatically refreshed and verified
- The system handles both new user registration and existing user login 