import React, { useCallback, useState } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Sun, Moon } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme, isTransitioning } = useTheme();
  const [isPressed, setIsPressed] = useState(false);
  
  // V5 Race Condition: Prevent rapid toggles
  const [lastToggle, setLastToggle] = useState(0);

  const handleToggle = useCallback(() => {
    if (isTransitioning) return; // V5 Race Fix: Don't toggle during transition
    
    const now = Date.now();
    if (now - lastToggle < 300) {
      return; // Prevent rapid toggles
    }
    setLastToggle(now);
    setIsPressed(true);
    
    try {
      toggleTheme();
    } catch (error) {
      console.error('Theme toggle error:', error);
    } finally {
      setTimeout(() => setIsPressed(false), 150);
    }
  }, [toggleTheme, lastToggle, isTransitioning]);

  return (
    <TouchableOpacity 
      onPress={handleToggle}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={[
        styles.toggle, 
        {
          backgroundColor: theme === 'dark' ? '#1e293b' : '#f1f5f9',
          transform: isPressed ? [{ scale: 0.95 }] : [{ scale: 1 }],
          opacity: isTransitioning ? 0.7 : 1 // V5 Race Fix: Visual feedback during transition
        }
      ]}
      disabled={isPressed || isTransitioning}
    >
      {theme === 'light' ? (
        <Moon 
          size={24} 
          color="#64748b" 
          style={{
            transform: isPressed ? [{ rotate: '180deg' }] : [{ rotate: '0deg' }]
          }}
        />
      ) : (
        <Sun 
          size={24} 
          color="#3b82f6"
          style={{
            transform: isPressed ? [{ rotate: '180deg' }] : [{ rotate: '0deg' }]
          }}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  toggle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 2,
    borderColor: 'transparent',
  },
});

export default ThemeToggle;