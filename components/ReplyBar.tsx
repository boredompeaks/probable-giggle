import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Message {
  id: string;
  created_at: string;
  text: string;
  user_id: string;
}

interface ReplyBarProps {
  replyingToMessage: Message | null;
  currentUserId: string;
  onCancelReply: () => void;
}

const ReplyBar: React.FC<ReplyBarProps> = ({ replyingToMessage, currentUserId, onCancelReply }) => {
  if (!replyingToMessage) return null;

  const isMyMessage = replyingToMessage.user_id === currentUserId;

  return (
    <View style={styles.replyBarContainer}>
      <View style={[
        styles.replyIndicator, 
        isMyMessage ? styles.myReply : styles.theirReply
      ]}>
        <Text style={styles.replyUser}>
          {isMyMessage ? 'You' : 'Replying to'}
        </Text>
        <Text style={styles.replyText} numberOfLines={1}>
          {replyingToMessage.text}
        </Text>
      </View>
      
      <TouchableOpacity 
        style={styles.cancelButton} 
        onPress={onCancelReply}
        activeOpacity={0.7}
      >
        <Text style={styles.cancelButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  replyBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  replyIndicator: {
    flex: 1,
    paddingRight: 8,
  },
  myReply: {
    borderLeftColor: '#3B82F6',
  },
  theirReply: {
    borderLeftColor: '#6B7280',
  },
  replyUser: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  replyText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  cancelButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6B7280',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 18,
  },
});

export default ReplyBar;