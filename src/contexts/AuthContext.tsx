import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, GoogleProfile } from '../services/auth/authService';
import { sheetsClient } from '../services/sheets/sheetsClient';

interface AuthContextType {
  user: GoogleProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (profile: GoogleProfile, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<GoogleProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth on mount
    const storedProfile = authService.getStoredProfile();
    const storedToken = authService.getStoredToken();

    if (storedProfile && storedToken) {
      setUser(storedProfile);
      sheetsClient.setAccessToken(storedToken);
    }

    setIsLoading(false);
  }, []);

  const login = (profile: GoogleProfile, token: string) => {
    setUser(profile);
    sheetsClient.setAccessToken(token);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    sheetsClient.setAccessToken('');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
