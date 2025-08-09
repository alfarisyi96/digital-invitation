# User Dashboard Authentication System

## Overview
Complete Google OAuth authentication system with HTTP-only cookies for the user dashboard.

## Architecture

### Backend (inv-be)
- **UserAuthService.ts**: Google OAuth integration with Supabase
- **Enhanced auth middleware**: Dual authentication (admin JWT + user HTTP-only cookies)
- **User routes**: `/api/auth/login/google`, `/api/auth/logout`, `/api/auth/profile`

### Frontend (user-dashboard)
- **UserContext.tsx**: React authentication state management
- **GoogleLoginButton.tsx**: Google Sign-In API integration
- **Protected routes**: Dashboard with `withAuth` HOC
- **Login page**: Complete OAuth flow with setup instructions

## Setup Instructions

### 1. Backend Configuration
The backend is already configured with:
- Google OAuth verification
- Supabase user management
- HTTP-only cookie authentication
- User routes under `/api/*`

### 2. Frontend Configuration

#### Environment Variables
Update `inv-fe/apps/user-dashboard/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_actual_google_client_id_here
```

#### Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select a project
3. Enable Google Sign-In API
4. Create OAuth 2.0 Client ID
5. Add authorized origins: `http://localhost:3003`
6. Copy Client ID to `.env.local`

## Usage

### Start Services
```bash
# Backend (terminal 1)
cd inv-be && npm run dev

# Frontend (terminal 2)
cd inv-fe && npm run dev:user
```

### Test Pages
- **Login**: http://localhost:3003/login
- **Dashboard**: http://localhost:3003/dashboard (protected)
- **Test**: http://localhost:3003/test (authentication status)
- **Home**: http://localhost:3003/ (redirects based on auth status)

## Features

### Authentication Flow
1. User clicks "Continue with Google"
2. Google Sign-In API loads and prompts
3. ID token sent to backend `/api/auth/login/google`
4. Backend verifies with Google & creates/finds user in Supabase
5. HTTP-only cookie set with JWT
6. User redirected to dashboard

### Security Features
- HTTP-only cookies (XSS protection)
- Secure cookie settings in production
- Google ID token verification
- Automatic session management
- Protected route middleware

### User Experience
- Loading states during authentication
- Error handling and display
- Automatic redirects based on auth status
- Setup instructions for developers
- Clean, responsive UI

## API Endpoints

### User Authentication
- `POST /api/auth/login/google` - Google OAuth login
- `POST /api/auth/logout` - Logout and clear cookie
- `GET /api/auth/profile` - Get current user profile

### Authentication Middleware
- `userAuth()` - Validates HTTP-only cookies
- `authenticate()` - Universal auth checker
- Automatic user context injection

## Components

### Core Components
- **UserContext**: Authentication state management
- **GoogleLoginButton**: OAuth integration
- **Header**: Navigation with user menu
- **withAuth HOC**: Route protection

### UI Components
- **SetupInstructions**: Developer guidance
- **AuthTestPage**: Development testing

## Database Integration
- Automatic user creation in Supabase
- User profile management
- Session tracking
- Email-based user identification

## Development Notes
- Dual authentication: Admin (JWT) + User (HTTP-only cookies)
- Separate middleware for different user types
- Environment-based configuration
- Development vs production settings
- Error handling and logging
