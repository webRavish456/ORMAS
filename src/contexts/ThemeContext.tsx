import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type UserRole = 'none' | 'data' | 'admin';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  isAdmin: boolean;
  isDataUser: boolean;
  userRole: UserRole;
  setIsAdmin: (isAdmin: boolean) => void;
  setIsDataUser: (isDataUser: boolean) => void;
  logout: () => void;
}

interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  // Admin state is session-based and persistent
  const [isAdmin, setIsAdmin] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('isAdmin') === 'true';
    }
    return false;
  });

  // Data user state is session-based and persistent
  const [isDataUser, setIsDataUser] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('isDataUser') === 'true';
    }
    return false;
  });

  // Determine user role based on permissions
  const userRole: UserRole = isAdmin ? 'admin' : isDataUser ? 'data' : 'none';

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('isAdmin', isAdmin.toString());
    }
  }, [isAdmin]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('isDataUser', isDataUser.toString());
    }
  }, [isDataUser]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const logout = () => {
    setIsAdmin(false);
    setIsDataUser(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('isAdmin');
      sessionStorage.removeItem('isDataUser');
    }
  };

  const value = {
    isDark,
    toggleTheme,
    isAdmin,
    isDataUser,
    userRole,
    setIsAdmin,
    setIsDataUser,
    logout,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
