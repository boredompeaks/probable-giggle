import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

interface SquishyButtonProps {
  onPress: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  style?: any;
  textStyle?: any;
  activeOpacity?: number;
}

const SquishyButton: React.FC<SquishyButtonProps> = ({ 
  onPress, 
  onPressIn, 
  onPressOut, 
  disabled = false,
  children, 
  style,
  textStyle,
  activeOpacity = 0.8
}) => {
  const scaleValue = React.useRef(new Animated.Value(1)).current;
  
  const scaleDown = React.useCallback(() => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  }, [scaleValue]);

  const scaleUp = React.useCallback(() => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [scaleValue]);

  const animatedStyle = {
    transform: [
      {
        scale: scaleValue,
      },
    ],
  };

  const handlePressIn = () => {
    if (!disabled) {
      scaleDown();
      onPressIn?.();
    }
  };

  const handlePressOut = () => {
    scaleUp();
    onPressOut?.();
  };

  const handlePress = () => {
    if (!disabled) {
      onPress();
      // Keep the button in pressed state briefly, then scale back up
      setTimeout(() => {
        scaleUp();
      }, 100);
    }
  };

  return (
    <Animated.View style={[animatedStyle, style]}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={activeOpacity}
        style={[
          styles.button,
          disabled && styles.disabled,
          style,
        ]}
      >
        {typeof children === 'string' ? (
          <Text style={[styles.text, textStyle]}>{children}</Text>
        ) : (
          children
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default SquishyButton;