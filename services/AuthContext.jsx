import React, { createContext, useContext, useState, useEffect } from 'react';
import { authStorage, authService } from './api';
import { setOneSignalUserId } from '../app/_layout';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored authentication on app startup
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const { token, user: cachedUser } = await authStorage.load();
      
      if (token && cachedUser) {
        // Set the auth token for API calls
        const { setAuthToken } = await import('./api');
        setAuthToken(token);
        
        // Verify the token is still valid by fetching user profile
        try {
          const freshUser = await authService.getProfileCached({ force: true });
          
          if (freshUser) {
            // Token is valid, user is authenticated
            setUser(freshUser);
            setIsAuthenticated(true);
            
            // Set OneSignal external user ID for push notifications
            await setOneSignalUserId(freshUser.id);
          } else {
            // Token is invalid, clear storage
            await authStorage.clear();
            setUser(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          // Token is invalid or network error, clear storage
          console.log('Token validation failed:', error.message);
          await authStorage.clear();
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        // No stored credentials
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      // On error, clear any potentially corrupted auth data
      try {
        await authStorage.clear();
      } catch (_) {}
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const result = await authService.login(credentials);
      if (result?.token && result?.user) {
        setUser(result.user);
        setIsAuthenticated(true);
        
        // Set OneSignal external user ID for push notifications
        if (result.user.id) {
          await setOneSignalUserId(result.user.id);
        }
        
        return result;
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Disconnect pusher service
      const pusherService = (await import('./optimizedPusherService')).default;
      pusherService.disconnect();
      
      await authService.logout();
      
      // Clear OneSignal external user ID
      await setOneSignalUserId(null);
      
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const refreshUser = async () => {
    try {
      const freshUser = await authService.getProfileCached({ force: true });
      if (freshUser) {
        setUser(freshUser);
        return freshUser;
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
    return null;
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshUser,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
