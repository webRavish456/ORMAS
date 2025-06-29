import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  logout: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

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

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const logout = () => {
    setIsAdmin(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('isAdmin');
    }
  };

  const value = {
    isDark,
    toggleTheme,
    isAdmin,
    setIsAdmin,
    logout,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
