import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Smile, Send, X } from 'lucide-react-native';

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: string;
  replyTo?: string;
}

interface ReplyModalProps {
  visible: boolean;
  onClose: () => void;
  onSendReply: (replyText: string, repliedToMessageId: string) => void;
  targetMessage: Message | null;
}

const ReplyModal: React.FC<ReplyModalProps> = ({
  visible,
  onClose,
  onSendReply,
  targetMessage,
}) => {
  const [replyText, setReplyText] = useState('');

  const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '👏', '🔥'];

  const handleSendReply = () => {
    if (replyText.trim() && targetMessage) {
      onSendReply(replyText.trim(), targetMessage.id);
      setReplyText('');
      onClose();
    }
  };

  const handleEmojiPress = (emoji: string) => {
    setReplyText(prev => prev + emoji);
  };

  if (!targetMessage) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reply to Message</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Original Message Preview */}
        <View style={styles.originalMessage}>
          <Text style={styles.originalSender}>{targetMessage.sender}</Text>
          <Text style={styles.originalText} numberOfLines={2}>
            {targetMessage.text}
          </Text>
        </View>

        {/* Reply Input */}
        <View style={styles.replyInput}>
          <TextInput
            style={styles.textInput}
            placeholder="Type your reply..."
            value={replyText}
            onChangeText={setReplyText}
            multiline
            maxLength={500}
          />
          
          {/* Emoji Picker */}
          <View style={styles.emojiContainer}>
            <Text style={styles.emojiLabel}>Quick Reactions:</Text>
            <View style={styles.emojiRow}>
              {commonEmojis.map((emoji, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.emojiButton}
                  onPress={() => handleEmojiPress(emoji)}
                >
                  <Text style={styles.emoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Send Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!replyText.trim() || !targetMessage) && styles.sendButtonDisabled
            ]}
            onPress={handleSendReply}
            disabled={!replyText.trim() || !targetMessage}
          >
            <Send size={20} color="#FFFFFF" />
            <Text style={styles.sendButtonText}>Send Reply</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerSpacer: {
    width: 32,
  },
  originalMessage: {
    padding: 20,
    backgroundColor: '#F3F4F6',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    margin: 20,
    borderRadius: 8,
  },
  originalSender: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  originalText: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 22,
  },
  replyInput: {
    flex: 1,
    padding: 20,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginBottom: 20,
  },
  emojiContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emojiLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 12,
  },
  emojiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emojiButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 20,
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  sendButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  sendButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ReplyModal;