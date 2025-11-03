import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  PanGestureHandler,
  State,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Reply, Smile } from 'lucide-react-native';

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: string;
  isOwn: boolean;
  replyTo?: {
    id: string;
    text: string;
    sender: string;
  };
}

interface EnhancedMessageProps {
  message: Message;
  onReply: (message: Message) => void;
  onReaction: (messageId: string, emoji: string) => void;
}

const { width: screenWidth } = Dimensions.get('window');
const SWIPE_THRESHOLD = 100;

const EnhancedMessage: React.FC<EnhancedMessageProps> = ({
  message,
  onReply,
  onReaction,
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;

  const handleLongPress = () => {
    setShowEmojiPicker(true);
    // Auto-hide emoji picker after 3 seconds
    setTimeout(() => setShowEmojiPicker(false), 3000);
  };

  const handleSwipe = ({ nativeEvent }: any) => {
    if (nativeEvent.state === State.END) {
      const { translationX } = nativeEvent;
      
      if (translationX > SWIPE_THRESHOLD) {
        // Swipe right - trigger reply
        onReply(message);
      }
      
      // Reset position
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleEmojiReaction = (emoji: string) => {
    onReaction(message.id, emoji);
    setShowEmojiPicker(false);
  };

  const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '👏', '🔥'];

  return (
    <View style={styles.container}>
      <PanGestureHandler onGestureEvent={handleSwipe}>
        <Animated.View
          style={[
            styles.messageContainer,
            {
              transform: [{ translateX }],
              alignSelf: message.isOwn ? 'flex-end' : 'flex-start',
            },
          ]}
        >
          {/* Reply Indicator (visible when swiping) */}
          <Animated.View
            style={[
              styles.replyIndicator,
              {
                opacity: translateX.interpolate({
                  inputRange: [0, SWIPE_THRESHOLD],
                  outputRange: [0, 1],
                }),
              },
            ]}
          >
            <Reply size={16} color="#3B82F6" />
          </Animated.View>

          {/* Message Bubble */}
          <TouchableOpacity
            style={[
              styles.messageBubble,
              message.isOwn ? styles.ownMessage : styles.otherMessage,
            ]}
            onLongPress={handleLongPress}
          >
            {/* Reply Preview */}
            {message.replyTo && (
              <View style={styles.replyPreview}>
                <Text style={styles.replyPreviewSender}>{message.replyTo.sender}</Text>
                <Text style={styles.replyPreviewText} numberOfLines={1}>
                  {message.replyTo.text}
                </Text>
              </View>
            )}

            {/* Message Text */}
            <Text style={[styles.messageText, message.isOwn && styles.ownMessageText]}>
              {message.text}
            </Text>

            {/* Timestamp */}
            <Text style={[styles.timestamp, message.isOwn && styles.ownTimestamp]}>
              {message.timestamp}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>

      {/* Emoji Picker Overlay */}
      {showEmojiPicker && (
        <View style={styles.emojiPickerOverlay}>
          <View style={styles.emojiPicker}>
            {commonEmojis.map((emoji, index) => (
              <TouchableOpacity
                key={index}
                style={styles.emojiButton}
                onPress={() => handleEmojiReaction(emoji)}
              >
                <Text style={styles.emoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  replyIndicator: {
    position: 'absolute',
    left: -30,
    top: 20,
    zIndex: 1,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 2,
  },
  ownMessage: {
    backgroundColor: '#3B82F6',
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  replyPreview: {
    paddingBottom: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
  },
  replyPreviewSender: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
  },
  replyPreviewText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
  },
  messageText: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 22,
  },
  ownMessageText: {
    color: '#FFFFFF',
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  ownTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  emojiPickerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 20,
  },
  emojiPicker: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emojiButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 24,
  },
});

export default EnhancedMessage;