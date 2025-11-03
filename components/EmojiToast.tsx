import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { X } from 'lucide-react-native';

interface EmojiToastProps {
  messageId: string;
  onEmojiSelect: (emoji: string) => void;
  onClose: () => void;
  x: number;
  y: number;
}

const EmojiToast: React.FC<EmojiToastProps> = ({
  messageId,
  onEmojiSelect,
  onClose,
  x,
  y
}) => {
  const [scaleAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [isClosing, setIsClosing] = useState(false);
  
  // V4 Race Condition: Prevent rapid emoji selection
  const [lastEmojiTime, setLastEmojiTime] = useState(0);
  const [selectedEmojis, setSelectedEmojis] = useState<Set<string>>(new Set());

  const emojis = ['👍', '❤️', '😂', '🔥', '😢', '😊'];

  // Animation entrance
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start();

    // Auto-close after 3 seconds
    const autoCloseTimer = setTimeout(() => {
      handleClose();
    }, 3000);

    return () => clearTimeout(autoCloseTimer);
  }, []);

  const preventEmojiSpam = useCallback((emoji: string) => {
    const now = Date.now();
    if (now - lastEmojiTime < 200) {
      return true; // Prevent rapid emoji selection
    }
    setLastEmojiTime(now);
    return false;
  }, [lastEmojiTime]);

  const handleEmojiSelect = useCallback((emoji: string) => {
    if (preventEmojiSpam(emoji)) return;
    
    try {
      // V4 Race Condition: Prevent duplicate reactions
      if (selectedEmojis.has(emoji)) {
        return; // Already selected this emoji
      }
      
      setSelectedEmojis(prev => new Set([...prev, emoji]));
      onEmojiSelect(emoji);
      
      // Close toast after emoji selection
      setTimeout(() => handleClose(), 300);
    } catch (error) {
      console.error('Emoji selection error:', error);
      handleClose();
    }
  }, [preventEmojiSpam, selectedEmojis, onEmojiSelect]);

  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start(() => {
      onClose();
    });
  }, [isClosing, scaleAnim, fadeAnim, onClose]);

  // Calculate position (keep toast in bounds)
  const screenWidth = Dimensions.get('window').width;
  const toastWidth = emojis.length * 40 + 20; // emoji width * count + padding
  const adjustedX = Math.min(Math.max(x - toastWidth / 2, 10), screenWidth - toastWidth - 10);
  const adjustedY = Math.min(y - 60, 200); // Keep away from top

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: adjustedX,
          top: adjustedY,
          backgroundColor: '#374151',
          borderRadius: 25,
          paddingHorizontal: 10,
          paddingVertical: 8,
          flexDirection: 'row',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 4.65,
          elevation: 5,
        },
        {
          transform: [
            { scale: scaleAnim },
            { translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-10, 0]
            })}
          ],
          opacity: fadeAnim
        }
      ]}
    >
      {emojis.map((emoji, index) => (
        <TouchableOpacity
          key={emoji}
          onPress={() => handleEmojiSelect(emoji)}
          disabled={selectedEmojis.has(emoji)}
          style={[
            {
              width: 36,
              height: 36,
              borderRadius: 18,
              justifyContent: 'center',
              alignItems: 'center',
              marginHorizontal: 2,
              backgroundColor: selectedEmojis.has(emoji) ? '#3B82F6' : 'transparent'
            },
            selectedEmojis.has(emoji) && {
              opacity: 0.7
            }
          ]}
        >
          <Text style={{ fontSize: 20 }}>
            {emoji}
          </Text>
        </TouchableOpacity>
      ))}
      
      <TouchableOpacity
        onPress={handleClose}
        style={{
          marginLeft: 8,
          width: 20,
          height: 20,
          borderRadius: 10,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <X size={12} color="#9CA3AF" />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default EmojiToast;