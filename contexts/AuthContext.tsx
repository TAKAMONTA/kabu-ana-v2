import React, { createContext, useContext } from 'react';

interface AuthContextValue {
  user: { uid: string } | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: { uid: 'dummy-user' },
  loading: false,
  logout: () => {
    /* no-op */
  },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <AuthContext.Provider value={{ user: { uid: 'dummy-user' }, loading: false, logout: () => {} }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
