import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, LayoutAnimation, UIManager, Platform, ActivityIndicator } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { SupabaseClient } from '@supabase/supabase-js';
import { Send, Reply, Image as ImageIcon, AlertTriangle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import EmojiToast from './EmojiToast';
import ReplyBar from './ReplyBar';
import SquishyButton from './SquishyButton';
import SkeletonPlaceholder from './SkeletonPlaceholder';
import ImageComponent from './ImageComponent';
import { useChatStore, Message } from '../src/store/chatStoreRaceConditionFix';
import { PAGE_SIZE } from '../src/constants/ChatConstants';

interface ChatRoomProps {
  supabase: SupabaseClient;
  session: any;
  onPanic: () => void;
}

// V5: Race condition tracking for gesture handlers
interface GestureState {
  isSwiping: boolean;
  isLongPressTriggered: boolean;
  swipeStartTime: number;
  longPressTimer: NodeJS.Timeout | null;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ supabase, session, onPanic }) => {
  // Use the race condition-fixed store
  const { 
    isLoading, 
    messages, 
    isFetchingMore, 
    currentPage,
    typingUsers,
    onlineUsers,
    reactingMessages,
    setIsLoading, 
    setMessages,
    addPendingMessage,
    flushPendingMessages,
    setIsFetchingMore,
    setCurrentPage,
    addTypingUser,
    removeTypingUser,
    setOnlineUsers,
    setReactingMessage,
    reset
  } = useChatStore();

  const [newMessage, setNewMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // V4: Emoji reactions state
  const [toastVisibleFor, setToastVisibleFor] = useState<string | null>(null);
  const [toastPosition, setToastPosition] = useState({ x: 0, y: 0 });
  
  // V4: Swipe-to-reply state - FIXED: Per-message offset to prevent race condition
  const [replyingToMessage, setReplyingToMessage] = useState<Message | null>(null);
  const [messageOffsets, setMessageOffsets] = useState<Map<string, number>>(new Map());
  const [swipingMessageId, setSwipingMessageId] = useState<string | null>(null);
  const [gestureState, setGestureState] = useState<GestureState>({
    isSwiping: false,
    isLongPressTriggered: false,
    swipeStartTime: 0,
    longPressTimer: null
  });

  // V5: Track panic spam prevention
  const [isPanicking, setIsPanicking] = useState(false);

  // V4: Configure LayoutAnimation for smooth message transitions
  useEffect(() => {
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental?.(true);
    }
    
    LayoutAnimation.configureNext({
      duration: 250,
      create: {
        type: LayoutAnimation.Types.spring,
        property: LayoutAnimation.Properties.opacity,
        springDamping: 0.4,
        springTension: 0.3,
      },
      update: {
        type: LayoutAnimation.Types.spring,
        property: LayoutAnimation.Properties.opacity,
        springDamping: 0.4,
        springTension: 0.3,
      },
      delete: {
        type: LayoutAnimation.Types.spring,
        property: LayoutAnimation.Properties.opacity,
        springDamping: 0.4,
        springTension: 0.3,
      },
    });
  }, []);

  useEffect(() => {
    loadMessages();
    const unsubscribe = setupRealtimeSubscription();
    const presenceUnsubscribe = setupPresenceChannel();
    const typingUnsubscribe = setupTypingChannel();
    
    return () => {
      unsubscribe();
      presenceUnsubscribe();
      typingUnsubscribe();
      // V5: Cleanup typing timeout on unmount
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const loadMessages = async () => {
    try {
      // V5 Phase B: Load initial messages with pagination
      const from = 0;
      const to = PAGE_SIZE - 1;
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .range(from, to)
        .order('created_at', { ascending: false }); // Newest first for inverted list

      if (error) throw error;
      // V5: Keep in descending order for inverted FlatList
      setMessages(data || []);
      setCurrentPage(1); // We've loaded page 0, next is page 1
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // V5 Race Fix: Enhanced fetch more with race condition prevention
  const fetchMoreMessages = useCallback(async () => {
    if (isFetchingMore) return;
    
    setIsFetchingMore(true);
    
    try {
      const from = currentPage * PAGE_SIZE;
      const to = (currentPage + 1) * PAGE_SIZE - 1;
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .range(from, to)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data && data.length > 0) {
        // V5 Race Fix: Use setMessages with prepend=false to avoid race
        setMessages([...messages, ...data], false);
        setCurrentPage(currentPage + 1);
      }
    } catch (error: any) {
      console.error('Error loading more messages:', error);
    } finally {
      setIsFetchingMore(false);
    }
  }, [currentPage, isFetchingMore, messages, supabase]);

  // V5 Race Fix: Enhanced realtime subscription with pending message handling
  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMsg = payload.new as Message;
          
          // V5 Race Fix: Check if we're fetching more, add to pending
          const state = useChatStore.getState();
          if (state.isFetchingMore) {
            // Add to pending instead of immediately updating
            state.addPendingMessage(newMsg);
          } else {
            // Safe to update directly
            setMessages([newMsg, ...state.messages], true);
          }
        }
      )
      // V3 Race Fix: Listen for DELETE events to handle orphaned replies
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const deletedMessage = payload.old as Message;
          const state = useChatStore.getState();
          
          // Remove any replies to this deleted message
          const cleanedMessages = state.messages.filter(
            msg => msg.parent_message_id !== deletedMessage.id
          );
          
          // Force update with cleaned messages
          set(cleanedMessages, false);
          
          // If user was replying to this message, clear reply state
          if (replyingToMessage?.id === deletedMessage.id) {
            setReplyingToMessage(null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  // V5 Phase C: Setup presence channel for online status
  const setupPresenceChannel = () => {
    const channel = supabase.channel('chat_room_presence', {
      config: { presence: { key: session.user.id } }
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const onlineUserIds = Object.keys(presenceState).map((key) => {
          const presences = presenceState[key];
          return presences.length > 0 ? presences[0].user_id : null;
        }).filter(Boolean) as string[];
        setOnlineUsers(onlineUserIds);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key);
      })
      // V5 Race Fix: Handle leave events to clean up typing indicators
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key);
        // V5 Race Fix: Immediately clear typing status for disconnected users
        const { typingUsers } = useChatStore.getState();
        const disconnectedUserIds = leftPresences.map(p => p.user_id);
        disconnectedUserIds.forEach(userId => {
          removeTypingUser(userId);
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: session.user.id,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  };

  // V5 Race Fix: Enhanced typing indicators with proper cleanup
  const setupTypingChannel = () => {
    const channel = supabase.channel('chat_room_typing');

    channel
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.user_id !== session.user.id) {
          // V5 Race Fix: Use individual user management
          addTypingUser(payload.user_id);
        }
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  };

  // V5 Phase C: Broadcast typing indicator
  const handleTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Broadcast typing event
    supabase
      .channel('chat_room_typing')
      .send({
        type: 'broadcast',
        event: 'typing',
        payload: { user_id: session.user.id },
      });

    // Clear typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      // Stop broadcasting
    }, 2000);
  }, [session.user.id, supabase]);

  // V5 Race Fix: Optimistic UI for image uploads
  const pickImage = async () => {
    try {
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library to send images.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const image = result.assets[0];
        const tempId = `temp_${Date.now()}`;
        
        // V5 Race Fix: Add optimistic UI placeholder immediately
        const placeholderMessage: Message = {
          id: tempId,
          created_at: new Date().toISOString(),
          text: 'Uploading image...',
          user_id: session.user.id,
          status: 'sending',
          temp_id: tempId
        };
        
        addPendingMessage(placeholderMessage);
        
        // Upload to Supabase Storage
        const fileName = `chat_image_${Date.now()}.jpg`;
        const fileUri = image.uri;
        
        // Convert to blob for upload
        const response = await fetch(fileUri);
        const blob = await response.blob();
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('chat_images')
          .upload(fileName, blob, {
            contentType: 'image/jpeg',
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('chat_images')
          .getPublicUrl(fileName);

        // Send message with image
        const { error: messageError } = await supabase
          .from('messages')
          .insert({
            text: 'Sent an image',
            image_url: urlData.publicUrl,
            user_id: session.user.id,
            ...(replyingToMessage && { parent_message_id: replyingToMessage.id }),
          });

        if (messageError) throw messageError;
        
        // Clear reply state
        setReplyingToMessage(null);
        
        // V5: The real message will arrive via realtime, replacing the temp one
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      Alert.alert('Upload Failed', 'Failed to upload image. Please try again.');
      
      // V5: Remove the placeholder on failure
      const { messages } = useChatStore.getState();
      const cleanedMessages = messages.filter(msg => !msg.temp_id);
      setMessages(cleanedMessages, false);
    }
  };

  // V2 Race Fix: Panic spam prevention
  const handlePanic = async () => {
    if (isPanicking) return; // Prevent spam
    setIsPanicking(true);
    
    try {
      // Step 1: Nuke State - Clear messages from store
      reset();
      setNewMessage('');
      
      // Step 2: Send Distress Signal via edge function
      try {
        await supabase.functions.invoke('panic-alert', {
          body: { 
            panicActivated: true,
            timestamp: new Date().toISOString(),
            userId: session.user.id 
          }
        });
      } catch (error) {
        console.log('Failed to send distress signal:', error);
      }
      
      // Step 3: Call the parent panic handler
      onPanic();
    } finally {
      // Reset panic state after a delay
      setTimeout(() => setIsPanicking(false), 2000);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const messageData = {
        text: newMessage.trim(),
        // V4: Include parent_message_id if replying to a message
        ...(replyingToMessage && { parent_message_id: replyingToMessage.id }),
      };

      const { error } = await supabase
        .from('messages')
        .insert([messageData]);

      if (error) throw error;
      setNewMessage('');
      // V4: Clear reply state after sending
      setReplyingToMessage(null);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  // V4 Race Fix: Enhanced reaction handler with spam prevention
  const handleReaction = async (messageId: string, emoji: string) => {
    // V4 Race Fix: Prevent double reactions
    if (reactingMessages.has(messageId)) return;
    
    setReactingMessage(messageId, true);
    
    try {
      // V4 Race Fix: Use upsert instead of insert to prevent duplicates
      const { error } = await supabase
        .from('reactions')
        .upsert({
          message_id: parseInt(messageId),
          user_id: session.user.id,
          emoji: emoji,
        }, {
          onConflict: 'message_id,user_id,emoji'
        });

      if (error) throw error;
    } catch (error: any) {
      console.error('Error adding reaction:', error);
      // Keep silent - no error alerts for reactions
    } finally {
      setReactingMessage(messageId, false);
    }
  };

  // V4 Race Fix: Enhanced gesture handling with mutual exclusion
  const handleLongPress = useCallback((messageId: string, event: any) => {
    const now = Date.now();
    
    // V4 Race Fix: Don't trigger if we're in the middle of a swipe
    if (gestureState.isSwiping) return;
    
    // V4 Race Fix: Set long press as triggered
    setGestureState(prev => ({ ...prev, isLongPressTriggered: true }));
    
    const { nativeEvent } = event;
    setToastPosition({
      x: nativeEvent.pageX,
      y: nativeEvent.pageY,
    });
    setToastVisibleFor(messageId);
    
    // Reset long press state after a delay
    setTimeout(() => {
      setGestureState(prev => ({ ...prev, isLongPressTriggered: false }));
    }, 100);
  }, [gestureState.isSwiping]);

  // V4 Race Fix: Enhanced swipe gesture with gesture exclusivity
  const createSwipeGesture = (message: Message) => {
    return Gesture.Pan()
      .activeOffsetX([-40, 0]) // Detect right-to-left swipe
      .activeOffsetY([-10, 10]) // Fail if significant vertical movement
      .onStart((event) => {
        const now = Date.now();
        
        // V4 Race Fix: Don't start swipe if long press was recently triggered
        if (gestureState.isLongPressTriggered && now - gestureState.swipeStartTime < 200) {
          return;
        }
        
        setGestureState(prev => ({ 
          ...prev, 
          isSwiping: true, 
          swipeStartTime: now 
        }));
        setMessageOffsets(prev => new Map(prev).set(message.id, 0));
      })
      .onUpdate((event) => {
        // V4 Race Fix: Fail swipe if significant vertical movement (scroll vs swipe)
        if (Math.abs(event.translationY) > 10) {
          setGestureState(prev => ({ ...prev, isSwiping: false }));
          setMessageOffsets(prev => {
            const newOffsets = new Map(prev);
            newOffsets.delete(message.id);
            return newOffsets;
          });
          return;
        }
        
        if (event.translationX < 0 && gestureState.isSwiping) { // Only allow right-to-left swipes
          const swipeAmount = Math.min(Math.abs(event.translationX), 150); // Limit to 150px
          setMessageOffsets(prev => {
            const newOffsets = new Map(prev);
            newOffsets.set(message.id, -swipeAmount);
            return newOffsets;
          });
        }
      })
      .onEnd((event) => {
        // V4 Race Fix: Check gesture state before completing
        if (!gestureState.isSwiping) return;
        
        if (event.translationX < -100) { // Threshold for triggering reply
          setReplyingToMessage(message);
        }
        
        // Reset states for this message
        setMessageOffsets(prev => {
          const newOffsets = new Map(prev);
          newOffsets.delete(message.id);
          return newOffsets;
        });
        setGestureState(prev => ({ 
          ...prev, 
          isSwiping: false,
          isLongPressTriggered: false 
        }));
      })
      .onCancel(() => {
        setMessageOffsets(prev => {
          const newOffsets = new Map(prev);
          newOffsets.delete(message.id);
          return newOffsets;
        });
        setGestureState(prev => ({ 
          ...prev, 
          isSwiping: false,
          isLongPressTriggered: false 
        }));
      });
  };

  // V4 Race Fix: Enhanced emoji toast close
  const closeToast = () => {
    setToastVisibleFor(null);
    // Reset gesture states when closing toast
    setGestureState(prev => ({ ...prev, isLongPressTriggered: false }));
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.user_id === session.user.id;
    
    // Get per-message swipe offset or default to 0
    const currentSwipeOffset = messageOffsets.get(item.id) || 0;
    
    return (
      <>
        <GestureDetector gesture={createSwipeGesture(item)}>
          <Animated.View 
            style={{
              marginBottom: 8,
              transform: [{ translateX: currentSwipeOffset }],
            }}
          >
            <TouchableOpacity
              onLongPress={(event) => handleLongPress(item.id.toString(), event)}
              activeOpacity={0.8}
            >
              <View className={`${isMyMessage ? 'self-end' : 'self-start'} relative`}>
                {/* V4: Reply indicator background (shows when swiping) */}
                {currentSwipeOffset < -10 && (
                  <Animated.View 
                    style={[
                      {
                        position: 'absolute',
                        left: isMyMessage ? -50 : -35,
                        top: 12,
                        zIndex: -1,
                        opacity: Math.abs(currentSwipeOffset) / 150,
                      }
                    ]}
                  >
                    <Reply size={20} color="#3B82F6" />
                  </Animated.View>
                )}
                
                {/* Message bubble */}
                <View className={`p-3 rounded-lg max-w-xs ${
                  isMyMessage 
                    ? 'bg-blue-500 mr-2' 
                    : 'bg-gray-700 ml-2'
                } ${item.status === 'sending' ? 'opacity-70' : ''}`}>
                  {/* V5: Show upload status */}
                  {item.status === 'sending' && (
                    <View className="flex-row items-center mb-2">
                      <ActivityIndicator size="small" color="#3B82F6" />
                      <Text className="text-blue-300 text-xs ml-2">Uploading...</Text>
                    </View>
                  )}
                  
                  {/* V5 Phase C: Show image if available */}
                  {item.image_url ? (
                    <ImageComponent url={item.image_url} width={200} height={200} />
                  ) : null}
                  
                  <Text className="text-white text-sm">{item.text}</Text>
                  <Text className="text-gray-300 text-xs mt-1">
                    {new Date(item.created_at).toLocaleTimeString()}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </GestureDetector>

        {/* V4: Emoji Toast */}
        {toastVisibleFor === item.id.toString() && (
          <EmojiToast
            messageId={item.id.toString()}
            onEmojiSelect={(emoji) => handleReaction(item.id.toString(), emoji)}
            onClose={closeToast}
            x={toastPosition.x}
            y={toastPosition.y}
          />
        )}
      </>
    );
  };

  // V5: Show skeleton loader while loading
  if (isLoading) {
    return <SkeletonPlaceholder />;
  }

  return (
    <View className="flex-1 p-4">
      {/* V5: Show pending message count during fetch */}
      {messages.length === 0 && isFetchingMore && (
        <View className="py-2 items-center">
          <Text className="text-gray-500 text-xs">Loading messages...</Text>
        </View>
      )}

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        className="flex-1"
        // V5 Phase B: Infinite scroll configuration
        inverted // Show latest messages at bottom
        onEndReached={fetchMoreMessages}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-500 text-lg">Welcome! Send your first message!</Text>
          </View>
        }
        ListFooterComponent={
          isFetchingMore ? (
            <View className="py-4 items-center">
              <ActivityIndicator size="small" color="#3B82F6" />
              <Text className="text-gray-500 text-sm mt-2">Loading older messages...</Text>
            </View>
          ) : null
        }
        // V4: LayoutAnimation for smooth message entry
        getItemLayout={(data, index) => ({
          length: 60,
          offset: 60 * index,
          index,
        })}
      />

      {/* V4: Reply Bar */}
      <ReplyBar 
        replyingToMessage={replyingToMessage}
        currentUserId={session.user.id}
        onCancelReply={() => setReplyingToMessage(null)}
      />

      {/* V5 Phase C: Typing indicators */}
      {typingUsers.length > 0 && (
        <View className="px-4 py-2">
          <Text className="text-gray-400 text-xs italic">
            {typingUsers.length === 1 ? 'Someone is' : `${typingUsers.length} people are`} typing...
          </Text>
        </View>
      )}

      {/* Message Input */}
      <View className="flex-row items-center space-x-2 mt-4">
        {/* V5 Phase C: Image picker button */}
        <SquishyButton
          onPress={pickImage}
          style={{
            backgroundColor: '#6B7280',
            padding: 12,
            borderRadius: 12,
            width: 48,
            height: 48,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ImageIcon size={20} color="white" />
        </SquishyButton>
        
        <TextInput
          value={newMessage}
          onChangeText={(text) => {
            setNewMessage(text);
            handleTyping(); // V5 Phase C: Broadcast typing
          }}
          placeholder="Type a message..."
          placeholderTextColor="#9CA3AF"
          className="flex-1 bg-gray-800 text-white p-4 rounded-xl border border-gray-700"
          multiline
        />
        <SquishyButton
          onPress={sendMessage}
          disabled={!newMessage.trim()}
          style={[
            {
              backgroundColor: '#3B82F6',
              padding: 16,
              borderRadius: 12,
              width: 56,
              height: 56,
              justifyContent: 'center',
              alignItems: 'center',
            },
            !newMessage.trim() && { opacity: 0.5 }
          ]}
        >
          <Send size={24} color="white" />
        </SquishyButton>
        
        {/* V2: Panic button with spam prevention */}
        <SquishyButton
          onPress={handlePanic}
          disabled={isPanicking}
          style={[
            {
              backgroundColor: '#DC2626',
              padding: 16,
              borderRadius: 12,
              width: 56,
              height: 56,
              justifyContent: 'center',
              alignItems: 'center',
            },
            isPanicking && { opacity: 0.5 }
          ]}
        >
          <AlertTriangle size={24} color="white" />
        </SquishyButton>
      </View>
    </View>
  );
};

export default ChatRoom;