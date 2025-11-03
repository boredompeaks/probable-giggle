import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, FlatList, StyleSheet, TextInput } from 'react-native';
import { SupabaseClient } from '@supabase/supabase-js';
import { Session } from '@supabase/supabase-js';
import { Plus, MessageCircle, User } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ContactsScreen from './ContactsScreen';
import ChatRoom from './ChatRoom';
import SquishyButton from './SquishyButton';

interface ChatListScreenProps {
  onPanic: () => void;
  supabase?: SupabaseClient;
  session?: Session;
}

interface ChatRoom {
  id: string;
  name: string;
  contactName: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
}

const ChatListScreen: React.FC<ChatListScreenProps> = ({ onPanic, supabase, session }) => {
  // Mock Supabase for now (in real implementation, this would come from props or context)
  const supabaseClient = supabase || null;
  const currentSession = session || null;
  const [chats, setChats] = useState<ChatRoom[]>([]);
  const [showContacts, setShowContacts] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [currentChatRoom, setCurrentChatRoom] = useState<ChatRoom | null>(null);

  useEffect(() => {
    loadChats();
    loadDisplayName();
  }, []);

  const loadDisplayName = async () => {
    try {
      const stored = await AsyncStorage.getItem('user_display_name');
      if (stored) {
        setDisplayName(stored);
      } else {
        setShowNameInput(true);
      }
    } catch (error) {
      console.error('Error loading display name:', error);
      setShowNameInput(true);
    }
  };

  const saveDisplayName = async (name: string) => {
    try {
      await AsyncStorage.setItem('user_display_name', name);
      setDisplayName(name);
      setShowNameInput(false);
    } catch (error) {
      console.error('Error saving display name:', error);
    }
  };

  const loadChats = async () => {
    try {
      const storedChats = await AsyncStorage.getItem('chat_rooms');
      if (storedChats) {
        setChats(JSON.parse(storedChats));
      } else {
        // Initialize with sample chats
        const sampleChats: ChatRoom[] = [
          {
            id: '1',
            name: 'alice_j',
            contactName: 'Alice Johnson',
            lastMessage: 'Hey, how are you?',
            timestamp: '2 min ago',
            unread: true,
          },
          {
            id: '2',
            name: 'bob_smith',
            contactName: 'Bob Smith',
            lastMessage: 'Thanks for the help!',
            timestamp: '1 hour ago',
            unread: false,
          },
        ];
        setChats(sampleChats);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const saveChats = async (updatedChats: ChatRoom[]) => {
    try {
      await AsyncStorage.setItem('chat_rooms', JSON.stringify(updatedChats));
    } catch (error) {
      console.error('Error saving chats:', error);
    }
  };

  const handleCreateChat = (contact: any) => {
    const newChat: ChatRoom = {
      id: contact.id,
      name: contact.username,
      contactName: contact.name,
      lastMessage: 'Start a conversation...',
      timestamp: 'Just now',
      unread: false,
    };

    const updatedChats = [newChat, ...chats];
    setChats(updatedChats);
    saveChats(updatedChats);
    setShowContacts(false);
  };

  const handleOpenChat = (chat: ChatRoom) => {
    setCurrentChatRoom(chat);
  };

  const handleBackToChats = () => {
    setCurrentChatRoom(null);
  };

  // Sign out is now handled by AppNavigator

  const renderChatItem = ({ item }: { item: ChatRoom }) => (
    <SquishyButton
      onPress={() => handleOpenChat(item)}
      style={styles.chatItem}
    >
      <View style={styles.avatarContainer}>
        <User size={24} color="#6B7280" />
      </View>
      <View style={styles.chatInfo}>
        <View style={styles.chatItemHeader}>
          <Text style={styles.chatName}>{item.contactName}</Text>
          <Text style={styles.chatTime}>{item.timestamp}</Text>
        </View>
        <Text style={styles.chatLastMessage} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>
      {item.unread && <View style={styles.unreadDot} />}
    </SquishyButton>
  );

  if (currentChatRoom) {
    return (
      <View style={styles.container}>
        <View style={styles.chatHeader}>
          <SquishyButton onPress={handleBackToChats}>
            <Text style={styles.backButton}>← Back</Text>
          </SquishyButton>
          <Text style={styles.chatTitle}>{currentChatRoom.contactName}</Text>
          <View style={styles.headerSpacer} />
        </View>
        
        {supabaseClient && currentSession ? (
          <ChatRoom 
            supabase={supabaseClient} 
            session={currentSession} 
            onPanic={onPanic} 
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              Chat Room: {currentChatRoom.contactName}
            </Text>
            <Text style={styles.placeholderSubtext}>
              Individual chat functionality would be here
            </Text>
          </View>
        )}
      </View>
    );
  }

  if (showNameInput) {
    return (
      <View style={styles.container}>
        <View style={styles.nameInputContainer}>
          <Text style={styles.nameInputTitle}>Set Your Display Name</Text>
          <Text style={styles.nameInputSubtitle}>
            This name will be shown to your contacts
          </Text>
          <TextInput
            style={styles.nameInput}
            placeholder="Enter your display name"
            value={newDisplayName}
            onChangeText={setNewDisplayName}
            autoCapitalize="words"
            autoCorrect={false}
          />
          <SquishyButton
            onPress={() => newDisplayName.trim() && saveDisplayName(newDisplayName.trim())}
            disabled={!newDisplayName.trim()}
            style={[styles.saveNameButton, !newDisplayName.trim() && styles.saveNameButtonDisabled]}
          >
            <Text style={styles.saveNameButtonText}>Save & Continue</Text>
          </SquishyButton>
        </View>
      </View>
    );
  }

  if (showContacts) {
    return (
      <ContactsScreen
        onCreateChat={handleCreateChat}
        onClose={() => setShowContacts(false)}
        displayName={displayName}
      />
    );
  }

  return (
    <View style={styles.container}>

      {/* New Chat Button */}
      <SquishyButton
        onPress={() => setShowContacts(true)}
        style={styles.newChatButton}
      >
        <Plus size={20} color="#FFFFFF" />
        <Text style={styles.newChatButtonText}>New Chat</Text>
      </SquishyButton>

      {/* Chats List */}
      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={item => item.id}
        style={styles.chatsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MessageCircle size={48} color="#9CA3AF" />
            <Text style={styles.emptyStateText}>No chats yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Tap "New Chat" to start a conversation
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    paddingVertical: 16,
    backgroundColor: '#10B981',
    borderRadius: 12,
  },
  newChatButtonText: {
    marginLeft: 8,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  chatsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  chatInfo: {
    flex: 1,
  },
  chatItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  chatTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  chatLastMessage: {
    fontSize: 14,
    color: '#6B7280',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
  chatTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 60,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  nameInputContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  nameInputTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  nameInputSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
    textAlign: 'center',
  },
  nameInput: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    marginBottom: 24,
  },
  saveNameButton: {
    width: '100%',
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveNameButtonDisabled: {
    opacity: 0.5,
  },
  saveNameButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChatListScreen;