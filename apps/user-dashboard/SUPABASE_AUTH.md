# Supabase Authentication Setup

## ✨ No Google Console Setup Required!

This project now uses **Supabase Auth** which handles all OAuth configuration automatically.

## Quick Setup

### 1. Get Supabase Credentials

#### Option A: Local Supabase (Recommended for Development)
```bash
# In your backend directory (inv-be)
npx supabase start
```
This will output the local Supabase URL and anon key.

#### Option B: Hosted Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → API to get your credentials

### 2. Update Environment Variables

Update `inv-fe/apps/user-dashboard/.env.local`:
```env
# For local Supabase
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_from_supabase_start

# For hosted Supabase  
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_hosted_anon_key
```

### 3. Enable Google Provider

#### For Local Supabase:
1. Go to http://localhost:54323 (Supabase Studio)
2. Authentication → Providers → Google
3. Enable Google provider
4. Supabase handles OAuth configuration automatically

#### For Hosted Supabase:
1. Go to your Supabase Dashboard
2. Authentication → Providers → Google  
3. Enable Google provider
4. Supabase handles OAuth configuration automatically

## Features

✅ **No Google Console setup needed**  
✅ **Automatic OAuth configuration**  
✅ **Built-in session management**  
✅ **Secure cookie handling**  
✅ **Real-time auth state changes**  
✅ **Automatic redirects**  

## Usage

### Start Services
```bash
# Backend with Supabase
cd inv-be && npm run dev

# Frontend
cd inv-fe && npm run dev:user
```

### Test Authentication
1. Visit http://localhost:3003/login
2. Click "Continue with Google"
3. Supabase handles the OAuth flow
4. Automatic redirect to dashboard

## Components Updated

- ✅ **SupabaseUserContext** - New auth context using Supabase
- ✅ **GoogleLoginButton** - Simplified with Supabase OAuth
- ✅ **Login Page** - Updated setup instructions
- ✅ **Dashboard** - Uses new context
- ✅ **Header** - Updated logout method
- ✅ **Middleware** - Supabase session handling

## Architecture Benefits

### Before (Custom OAuth)
- Manual Google Console setup
- Custom JWT handling
- Manual session management
- Complex error handling

### After (Supabase Auth)
- Zero OAuth configuration
- Automatic session management
- Built-in security features  
- Simplified codebase

## Development vs Production

The same Supabase setup works for both development and production:
- **Development**: Use local Supabase instance
- **Production**: Use hosted Supabase project

No additional configuration needed!
