import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useColorScheme, Dimensions } from 'react-native';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void; // V5 Race Fix: Explicit theme setting
  isDark: boolean;
  backgroundImage: any;
  isTransitioning: boolean; // V5 Race Fix: Transition state
  getThemeColors: () => {
    background: string;
    text: string;
    card: string;
    border: string;
    primary: string;
    secondary: string;
    muted: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const BackgroundImageDark = require('../../assets/mountain-night.jpg');
const BackgroundImageLight = require('../../assets/mountain-day.jpg');

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>('light');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [lastThemeChange, setLastThemeChange] = useState(0);

  // V5 Race Condition: Prevent rapid theme switches
  const preventThemeSpam = useCallback(() => {
    const now = Date.now();
    if (now - lastThemeChange < 300) {
      return true; // Prevent rapid theme changes
    }
    setLastThemeChange(now);
    return false;
  }, [lastThemeChange]);

  // V5 Race Condition: Enhanced theme setting with race prevention
  const setTheme = useCallback((newTheme: Theme) => {
    if (preventThemeSpam()) return;
    
    setIsTransitioning(true);
    
    try {
      setThemeState(newTheme);
      
      // V5 Edge Case: Save theme preference (simulate storage)
      try {
        // In a real app, save to AsyncStorage or similar
        console.log('Theme saved:', newTheme);
      } catch (error) {
        console.error('Error saving theme:', error);
      }
    } catch (error) {
      console.error('Error setting theme:', error);
    } finally {
      setTimeout(() => setIsTransitioning(false), 200);
    }
  }, [preventThemeSpam]);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  // Sync with system theme on mount
  useEffect(() => {
    if (systemColorScheme === 'dark') {
      setThemeState('dark');
    } else {
      setThemeState('light');
    }
  }, [systemColorScheme]);

  // V5 Edge Case: Automatic theme detection with user preference tracking
  useEffect(() => {
    // Listen for system theme changes, but respect user preference
    const handleSystemThemeChange = (e: any) => {
      // Only auto-switch if user hasn't manually set a preference
      // This is a simplified version - in a real app you'd track user preference
      const now = Date.now();
      if (!lastThemeChange || now - lastThemeChange > 60000) {
        const newTheme = e.matches ? 'dark' : 'light';
        setThemeState(newTheme);
      }
    };

    // In a real app, you'd use something like:
    // const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    // mediaQuery.addEventListener('change', handleSystemThemeChange);
    // return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);

    // For React Native, you'd use a library like react-native-device-info
    // or handle this at the native level

  }, [lastThemeChange]);

  const isDark = theme === 'dark';
  const backgroundImage = isDark ? BackgroundImageDark : BackgroundImageLight;

  const getThemeColors = () => ({
    background: isDark ? '#0a0a0a' : '#f8fafc',
    text: isDark ? '#f1f5f9' : '#0f172a',
    card: isDark ? '#1e293b' : '#ffffff',
    border: isDark ? '#334155' : '#e2e8f0',
    primary: isDark ? '#3b82f6' : '#2563eb',
    secondary: isDark ? '#64748b' : '#64748b',
    muted: isDark ? '#475569' : '#64748b'
  });

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    setTheme,
    isDark,
    backgroundImage,
    isTransitioning,
    getThemeColors
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};