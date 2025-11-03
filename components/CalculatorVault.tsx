import React, { useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, Animated, Alert } from 'react-native';
import { BlurView } from '@react-native-community/blur';

interface CalculatorVaultProps {
  displayValue: string;
  setDisplayValue: (value: string) => void;
  setIsUnlocked: (value: boolean) => void;
  secretCodes: {
    SECRET_CODE_1: string;
    SECRET_CODE_2: string;
  };
  isPanicMode?: boolean;
}

const CalculatorVault: React.FC<CalculatorVaultProps> = ({
  displayValue,
  setDisplayValue,
  setIsUnlocked,
  secretCodes,
  isPanicMode = false
}) => {
  // V1 Race Condition: Fat Finger Prevention
  const [isInputLocked, setIsInputLocked] = useState(false);
  const [lastInputTime, setLastInputTime] = useState(0);
  
  // V1 Edge Case: Long Press Management
  const [isLongPressActive, setIsLongPressActive] = useState(false);
  const [longPressProgress, setLongPressProgress] = useState(0);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const progressAnimation = useRef(new Animated.Value(0)).current;

  // V1 Race Condition: Prevent multiple rapid inputs
  const preventFatFinger = useCallback(() => {
    const now = Date.now();
    if (now - lastInputTime < 100) { // 100ms debounce
      return true;
    }
    setLastInputTime(now);
    return false;
  }, [lastInputTime]);

  const startLongPress = useCallback(() => {
    if (isInputLocked) return;
    
    setIsLongPressActive(true);
    setLongPressProgress(0);
    
    // Animate progress bar
    Animated.timing(progressAnimation, {
      toValue: 100,
      duration: 1500, // 1.5 seconds
      useNativeDriver: false,
    }).start();

    // Start long press timer
    longPressTimer.current = setTimeout(() => {
      // V1 Edge Case: Unlock Overshoot Prevention
      if (displayValue === secretCodes.SECRET_CODE_1 || displayValue === secretCodes.SECRET_CODE_2) {
        setIsUnlocked(true);
      } else {
        // Silent failure - just reset without error
        setDisplayValue('0');
      }
      stopLongPress();
    }, 1500);
  }, [displayValue, secretCodes, isInputLocked]);

  const stopLongPress = useCallback(() => {
    setIsLongPressActive(false);
    setLongPressProgress(0);
    progressAnimation.setValue(0);
    
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handlePress = useCallback((value: string) => {
    // V1 Race Condition: Prevent rapid inputs
    if (preventFatFinger()) return;
    
    setIsInputLocked(true);
    
    try {
      if (value === 'C') {
        setDisplayValue('0');
        stopLongPress();
      } else if (value === '=') {
        // V1 Edge Case: Quick tap on equals (no unlock)
        if (!isLongPressActive) {
          // V1 Edge Case: 0.1 + 0.2 floating point handling
          try {
            // Safe expression evaluation (basic validation)
            const cleanExpression = displayValue.replace(/[^0-9+\-*/.() ]/g, '');
            if (cleanExpression && !cleanExpression.includes('..')) {
              // eslint-disable-next-line no-eval
              const result = eval(cleanExpression);
              
              // V1 Edge Case: Division by zero handling
              if (!isFinite(result)) {
                setDisplayValue('Error');
                setTimeout(() => setDisplayValue('0'), 2000);
              } else {
                // Handle floating point precision
                const formatted = parseFloat(result.toFixed(10)).toString();
                setDisplayValue(formatted);
              }
            } else {
              setDisplayValue('Error');
              setTimeout(() => setDisplayValue('0'), 2000);
            }
          } catch (error) {
            setDisplayValue('Error');
            setTimeout(() => setDisplayValue('0'), 2000);
          }
        }
      } else {
        // Number pressed - prevent overshoot
        stopLongPress();
        
        // V1 Edge Case: Unlock Overshoot - Strict validation
        if (displayValue.length >= 10) return; // Limit input length
        
        // V1 Race Condition: Input sequence validation
        const newValue = displayValue === '0' ? value : displayValue + value;
        
        // Prevent invalid sequences
        if (newValue.match(/[\+\-\*\/]{2,}/)) {
          return; // Skip invalid operator sequences
        }
        
        setDisplayValue(newValue);
      }
    } finally {
      // Unlock input after processing
      setTimeout(() => setIsInputLocked(false), 50);
    }
  }, [displayValue, isLongPressActive, preventFatFinger, stopLongPress]);

  const buttons = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['C', '0', '=']
  ];

  return (
    <View className="flex-1 bg-gray-900 justify-center items-center p-8">
      <View className="w-full max-w-sm">
        {/* Display */}
        <View className="bg-gray-800 p-6 rounded-2xl mb-4 shadow-lg">
          {isPanicMode && (
            <View className="mb-2 pb-2 border-b border-red-600">
              <Text className="text-red-400 text-sm text-center font-semibold">
                🔥 PANIC MODE ACTIVE
              </Text>
            </View>
          )}
          <Text className="text-white text-4xl font-mono text-right">
            {displayValue}
          </Text>
          
          {/* V1 Edge Case: Error state indicator */}
          {displayValue === 'Error' && (
            <Text className="text-red-400 text-xs text-center mt-2">
              Invalid Operation
            </Text>
          )}
          
          {/* V1 Edge Case: Panic mode hint */}
          {isPanicMode && (
            <Text className="text-yellow-400 text-xs text-center mt-2">
              Long press = to unlock
            </Text>
          )}
        </View>

        {/* Button Grid */}
        <View className="space-y-3">
          {buttons.map((row, rowIndex) => (
            <View key={rowIndex} className="flex-row space-x-3 justify-center">
              {row.map((button) => (
                <TouchableOpacity
                  key={button}
                  onPress={() => handlePress(button)}
                  onPressIn={button === '=' ? startLongPress : undefined}
                  onPressOut={button === '=' ? stopLongPress : undefined}
                  disabled={isInputLocked && button !== '='}
                  className={`flex-1 bg-gray-700 rounded-2xl py-4 items-center shadow-lg overflow-hidden ${
                    button === '=' ? 'bg-orange-600 active:bg-orange-700' : ''
                  } ${button === 'C' ? 'bg-red-600 active:bg-red-700' : ''
                  } ${isInputLocked && button !== '=' ? 'opacity-50' : ''}`}
                >
                  <BlurView
                    style="absolute inset-0 rounded-2xl"
                    blurType="dark"
                    blurAmount={10}
                    reducedTransparencyFallbackColor="#374151"
                  />
                  <Text className="text-white text-xl font-semibold z-10">
                    {button}
                  </Text>
                  
                  {/* Long Press Progress Bar for Equals Button */}
                  {button === '=' && (
                    <Animated.View
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        height: 3,
                        backgroundColor: '#EF4444',
                        borderRadius: 2,
                        width: progressAnimation.interpolate({
                          inputRange: [0, 100],
                          outputRange: ['0%', '100%'],
                        }),
                      }}
                    />
                  )}
                  
                  {/* Long Press Visual Feedback */}
                  {button === '=' && isLongPressActive && (
                    <View
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(239, 68, 68, 0.3)',
                        borderRadius: 16,
                        borderWidth: 2,
                        borderColor: '#EF4444',
                      }}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default CalculatorVault;