import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Check, RefreshCw, Zap, Settings } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { getAnyRandomMessage } from '../utils/notificationMessages';

interface VagueNotificationProps {
  visible: boolean;
  message?: string;
  type?: 'success' | 'info' | 'warning';
  duration?: number;
  onDismiss?: () => void;
}

export const VagueNotification: React.FC<VagueNotificationProps> = ({
  visible,
  message,
  type = 'info',
  duration = 3000,
  onDismiss
}) => {
  const { isDark, getThemeColors } = useTheme();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-100));
  const [displayMessage, setDisplayMessage] = useState(message || '');

  const colors = getThemeColors();

  const icons = {
    success: Check,
    info: RefreshCw,
    warning: Zap
  };

  const IconComponent = icons[type];

  useEffect(() => {
    if (visible) {
      // Set random message if none provided
      if (!message) {
        setDisplayMessage(getAnyRandomMessage());
      }
      
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss
      const timer = setTimeout(() => {
        hideNotification();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, message]);

  const hideNotification = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onDismiss) {
        onDismiss();
      }
    });
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
          <IconComponent size={20} color="#ffffff" />
        </View>
        <Text style={[styles.message, { color: colors.text }]}>
          {displayMessage}
        </Text>
        <TouchableOpacity onPress={hideNotification} style={styles.dismissButton}>
          <Settings size={16} color={colors.secondary} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    borderRadius: 12,
    elevation: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  dismissButton: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
});

export default VagueNotification;