import React, { useEffect, ReactNode } from 'react';
import { useAuthStore } from '../../stores/authStore';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    // Initialize authentication when app starts
    initialize();
  }, [initialize]);

  return <>{children}</>;
}; 