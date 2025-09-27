# Authentication System

This document describes the authentication system implemented in the FloraNet mobile app.

## Overview

The app now uses a persistent authentication system that:
- Saves login credentials securely using `expo-secure-store`
- Automatically logs users in when they reopen the app (if credentials are valid)
- Redirects to login page if no credentials exist or if they're invalid
- Properly handles logout by clearing stored credentials

## Key Components

### 1. AuthContext (`services/AuthContext.jsx`)
Centralized authentication state management that provides:
- `user`: Current user data
- `isAuthenticated`: Boolean indicating if user is logged in
- `isLoading`: Boolean indicating if auth check is in progress
- `login(credentials)`: Login function
- `logout()`: Logout function
- `refreshUser()`: Refresh user data from API
- `checkAuthStatus()`: Check stored credentials on app startup

### 2. AuthGuard (`components/AuthGuard.jsx`)
A wrapper component that protects routes requiring authentication:
- Shows loading spinner while checking auth status
- Redirects to login if user is not authenticated
- Renders children only if user is authenticated

### 3. Updated App Layout (`app/_layout.jsx`)
- Wraps the app with `AuthProvider`
- Automatically navigates based on authentication status
- Shows loading screen during initial auth check

## How It Works

### Login Flow
1. User enters credentials on login screen
2. `AuthContext.login()` is called
3. Credentials are sent to backend API
4. If successful, token and user data are saved to secure storage
5. User is automatically redirected to main homepage
6. OneSignal user ID is set for push notifications

### App Startup Flow
1. App starts and shows loading screen
2. `AuthContext` checks for stored credentials
3. If credentials exist, token is validated with backend
4. If valid, user is redirected to main homepage
5. If invalid or no credentials, user stays on login page

### Logout Flow
1. User taps logout in settings
2. `AuthContext.logout()` is called
3. Stored credentials are cleared
4. User is redirected to login page
5. OneSignal user ID is cleared

## Security Features

- **Secure Storage**: Uses `expo-secure-store` for storing sensitive data
- **Token Validation**: Always validates stored tokens with backend on app startup
- **Automatic Cleanup**: Clears invalid or expired credentials automatically
- **Error Handling**: Gracefully handles network errors and invalid tokens

## Usage

### Using AuthContext in Components
```jsx
import { useAuth } from '../services/AuthContext';

const MyComponent = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  // Use authentication state and methods
};
```

### Protecting Routes
```jsx
import AuthGuard from '../components/AuthGuard';

const ProtectedScreen = () => {
  return (
    <AuthGuard>
      <YourProtectedContent />
    </AuthGuard>
  );
};
```

## Configuration

The authentication system uses the existing API configuration in `services/api.js`:
- `authStorage`: Handles secure storage operations
- `authService`: Handles API calls for authentication
- `setAuthToken`: Sets authorization header for API requests

## Notes

- The system maintains backward compatibility with existing code
- All existing logout functionality continues to work
- The app will automatically handle authentication state changes
- No manual token management is required in components
