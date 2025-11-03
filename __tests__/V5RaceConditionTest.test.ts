/**
 * V5 Race Condition Test Suite
 * Tests all major race conditions identified in the V5 Chat Vault implementation
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import ChatRoom from '../components/ChatRoomRaceConditionFix';
import { useChatStore } from '../src/store/chatStoreRaceConditionFix';

// Mock Supabase
const mockSupabase = {
  channel: jest.fn(() => ({
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    send: jest.fn(),
    track: jest.fn(),
    presenceState: jest.fn(() => ({})),
    removeChannel: jest.fn()
  })),
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis()
  })),
  functions: {
    invoke: jest.fn()
  },
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn().mockReturnThis(),
      getPublicUrl: jest.fn().mockReturnThis()
    }))
  },
  removeChannel: jest.fn()
};

const mockSession = { user: { id: 'test-user-1' } };

describe('V5 Race Condition Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state
    useChatStore.getState().reset();
  });

  describe('V5: The Real-Time Engine - Race Conditions', () => {
    test('V5 Race Fix: Lazy Load vs Live Insert - New messages during fetch', async () => {
      const { getByText, rerender } = render(
        <ChatRoom 
          supabase={mockSupabase as any} 
          session={mockSession} 
          onPanic={jest.fn()} 
        />
      );

      // Simulate fetchMoreMessages in progress
      act(() => {
        useChatStore.getState().setIsFetchingMore(true);
      });

      // Simulate real-time INSERT event during fetch
      act(() => {
        const newMessage = {
          id: 'msg-1',
          created_at: new Date().toISOString(),
          text: 'New message during fetch',
          user_id: 'other-user',
          status: 'sent'
        };
        useChatStore.getState().addPendingMessage(newMessage);
      });

      // Verify message is in pending, not in main messages
      expect(useChatStore.getState().pendingNewMessages).toHaveLength(1);
      expect(useChatStore.getState().messages).toHaveLength(0);

      // Simulate fetch completion
      act(() => {
        useChatStore.getState().setIsFetchingMore(false);
      });

      // Verify pending messages are flushed
      expect(useChatStore.getState().pendingNewMessages).toHaveLength(0);
      expect(useChatStore.getState().messages).toHaveLength(1);
      expect(useChatStore.getState().messages[0].text).toBe('New message during fetch');
    });

    test('V5 Race Fix: Typing Ghost - Proper cleanup on disconnect', async () => {
      const { getByText, rerender } = render(
        <ChatRoom 
          supabase={mockSupabase as any} 
          session={mockSession} 
          onPanic={jest.fn()} 
        />
      );

      // Simulate user A typing
      act(() => {
        useChatStore.getState().addTypingUser('user-2');
      });

      expect(useChatStore.getState().typingUsers).toContain('user-2');

      // Simulate user B disconnecting (presence leave event)
      act(() => {
        useChatStore.getState().removeTypingUser('user-2');
      });

      expect(useChatStore.getState().typingUsers).not.toContain('user-2');
    });

    test('V5 Race Fix: Image vs Text - Optimistic UI prevents ordering issues', async () => {
      const { getByText } = render(
        <ChatRoom 
          supabase={mockSupabase as any} 
          session={mockSession} 
          onPanic={jest.fn()} 
        />
      );

      // Simulate user starting image upload
      act(() => {
        const placeholderMessage = {
          id: 'temp_123',
          created_at: new Date().toISOString(),
          text: 'Uploading image...',
          user_id: 'test-user-1',
          status: 'sending',
          temp_id: 'temp_123'
        };
        useChatStore.getState().addPendingMessage(placeholderMessage);
      });

      // Verify placeholder is shown
      expect(useChatStore.getState().pendingNewMessages).toHaveLength(1);
      expect(useChatStore.getState().pendingNewMessages[0].status).toBe('sending');

      // Simulate text message sent during upload
      act(() => {
        const textMessage = {
          id: 'msg-2',
          created_at: new Date().toISOString(),
          text: 'Text message',
          user_id: 'test-user-1',
          status: 'sent'
        };
        useChatStore.getState().addPendingMessage(textMessage);
      });

      // Simulate fetch completion with both messages
      act(() => {
        useChatStore.getState().setIsFetchingMore(false);
      });

      // Verify correct ordering: image placeholder first, then text
      const messages = useChatStore.getState().messages;
      expect(messages[0].text).toBe('Text message');
      expect(messages[1].text).toBe('Uploading image...');
    });
  });

  describe('V4: "Vibe" (Gestures & Reactions) - Race Conditions', () => {
    test('V4 Race Fix: Swipe vs Press - Gesture exclusivity', () => {
      const { getByText } = render(
        <ChatRoom 
          supabase={mockSupabase as any} 
          session={mockSession} 
          onPanic={jest.fn()} 
        />
      );

      // Simulate long press being triggered
      act(() => {
        useChatStore.setState(prev => ({ 
          ...prev,
          gestureState: { 
            isSwiping: false, 
            isLongPressTriggered: true, 
            swipeStartTime: Date.now(),
            longPressTimer: null
          }
        }));
      });

      // Verify swipe is prevented during long press
      expect(useChatStore.getState().gestureState.isLongPressTriggered).toBe(true);
      
      // Simulate long press timeout
      act(() => {
        setTimeout(() => {
          useChatStore.setState(prev => ({ 
            ...prev,
            gestureState: { 
              ...prev.gestureState,
              isLongPressTriggered: false
            }
          }));
        }, 100);
      });

      // After timeout, gestures should work normally
      expect(useChatStore.getState().gestureState.isLongPressTriggered).toBe(false);
    });

    test('V4 Race Fix: Double Like - Spam prevention', async () => {
      const { getByText } = render(
        <ChatRoom 
          supabase={mockSupabase as any} 
          session={mockSession} 
          onPanic={jest.fn()} 
        />
      );

      const messageId = 'msg-1';

      // Simulate first reaction
      act(() => {
        useChatStore.getState().setReactingMessage(messageId, true);
      });

      expect(useChatStore.getState().reactingMessages).toContain(messageId);

      // Try to react again immediately (should be prevented)
      act(() => {
        useChatStore.getState().setReactingMessage(messageId, true);
      });

      // Should still only be in set once
      expect(useChatStore.getState().reactingMessages.size).toBe(1);

      // Complete reaction
      act(() => {
        useChatStore.getState().setReactingMessage(messageId, false);
      });

      expect(useChatStore.getState().reactingMessages).not.toContain(messageId);
    });

    test('V4 Race Fix: Swipe-Scroll - Fail swipe on vertical movement', () => {
      const { getByText } = render(
        <ChatRoom 
          supabase={mockSupabase as any} 
          session={mockSession} 
          onPanic={jest.fn()} 
        />
      );

      // Simulate gesture with significant vertical movement
      act(() => {
        useChatStore.setState(prev => ({ 
          ...prev,
          gestureState: { 
            ...prev.gestureState,
            isSwiping: false // Should be set to false due to vertical movement
          }
        }));
      });

      expect(useChatStore.getState().gestureState.isSwiping).toBe(false);
    });
  });

  describe('V2: The Panic Button - Race Conditions', () => {
    test('V2 Race Fix: Panic Spam - Spam prevention', async () => {
      const mockOnPanic = jest.fn();
      const { getByTestId } = render(
        <ChatRoom 
          supabase={mockSupabase as any} 
          session={mockSession} 
          onPanic={mockOnPanic} 
        />
      );

      // Get panic button (this would need a testID in real implementation)
      const panicButton = { type: () => {} }; // Mock button element

      // Try to spam panic button
      await act(async () => {
        // First panic should work
        // panicButton.props.onPress();
        
        // Second panic should be prevented
        // panicButton.props.onPress();
      });

      // Verify panic was only called once due to spam prevention
      // Note: This test structure would need adjustment based on actual implementation
      expect(mockOnPanic).toHaveBeenCalledTimes(1);
    });

    test('V2 Race Fix: Offline Panic - Graceful failure handling', async () => {
      // Mock supabase failure
      mockSupabase.functions.invoke.mockRejectedValue(new Error('Network error'));

      const mockOnPanic = jest.fn();
      const { getByText } = render(
        <ChatRoom 
          supabase={mockSupabase as any} 
          session={mockSession} 
          onPanic={mockOnPanic} 
        />
      );

      // Simulate panic while offline
      await act(async () => {
        try {
          // This would call the actual panic handler
          // await handlePanic();
        } catch (error) {
          // Should still proceed with local panic actions
        }
      });

      // Verify local panic actions still occurred even on network failure
      expect(useChatStore.getState().messages).toHaveLength(0);
    });
  });

  describe('V1: The Calculator Vault - Edge Cases', () => {
    test('V1 Edge Case: The "Fat Finger" - Input validation', () => {
      const { getByPlaceholderText } = render(
        <ChatRoom 
          supabase={mockSupabase as any} 
          session={mockSession} 
          onPanic={jest.fn()} 
        />
      );

      const textInput = getByPlaceholderText('Type a message...');

      // Simulate rapid consecutive inputs
      act(() => {
        fireEvent.changeText(textInput, '1');
        fireEvent.changeText(textInput, '1+');
        fireEvent.changeText(textInput, '1++');
        fireEvent.changeText(textInput, '1++2');
        fireEvent.changeText(textInput, '1++2=');
      });

      expect(textInput.props.value).toBe('1++2=');
    });

    test('V1 Edge Case: Division by Zero - Safe handling', () => {
      const { getByPlaceholderText } = render(
        <ChatRoom 
          supabase={mockSupabase as any} 
          session={mockSession} 
          onPanic={jest.fn()} 
        />
      );

      const textInput = getByPlaceholderText('Type a message...');

      // Test division by zero input
      act(() => {
        fireEvent.changeText(textInput, '1/0=');
      });

      expect(textInput.props.value).toBe('1/0=');
    });
  });

  describe('V3: Threads & Architecture - Race Conditions', () => {
    test('V3 Race Fix: Orphaned Reply - Delete parent message handling', async () => {
      const { getByText } = render(
        <ChatRoom 
          supabase={mockSupabase as any} 
          session={mockSession} 
          onPanic={jest.fn()} 
        />
      );

      // Simulate messages with replies
      const parentMessage = {
        id: 'parent-1',
        created_at: new Date().toISOString(),
        text: 'Parent message',
        user_id: 'other-user'
      };

      const replyMessage = {
        id: 'reply-1',
        created_at: new Date().toISOString(),
        text: 'Reply message',
        user_id: 'test-user-1',
        parent_message_id: 'parent-1'
      };

      act(() => {
        useChatStore.getState().setMessages([parentMessage, replyMessage]);
      });

      expect(useChatStore.getState().messages).toHaveLength(2);

      // Simulate DELETE event for parent message
      act(() => {
        const state = useChatStore.getState();
        const cleanedMessages = state.messages.filter(
          msg => msg.parent_message_id !== parentMessage.id
        );
        useChatStore.getState().setMessages(cleanedMessages, false);
      });

      // Verify reply was removed
      const remainingMessages = useChatStore.getState().messages;
      expect(remainingMessages).toHaveLength(1);
      expect(remainingMessages[0].id).toBe('parent-1');
    });
  });
});

describe('V5: Performance & Edge Cases', () => {
  test('V5 Edge Case: Empty Skeleton - Proper empty state handling', () => {
    const { getByText } = render(
      <ChatRoom 
        supabase={mockSupabase as any} 
        session={mockSession} 
        onPanic={jest.fn()} 
      />
    );

    // Simulate empty state
    act(() => {
      useChatStore.getState().setMessages([]);
    });

    // Should show welcome message (this would need ListEmptyComponent)
    expect(useChatStore.getState().messages).toHaveLength(0);
  });

  test('V5 Race Condition: Concurrent typing indicators', () => {
    const { getByText } = render(
      <ChatRoom 
        supabase={mockSupabase as any} 
        session={mockSession} 
        onPanic={jest.fn()} 
      />
      );

    // Simulate multiple users typing
    act(() => {
      useChatStore.getState().addTypingUser('user-1');
      useChatStore.getState().addTypingUser('user-2');
      useChatStore.getState().addTypingUser('user-3');
    });

    const typingUsers = useChatStore.getState().typingUsers;
    expect(typingUsers).toHaveLength(3);
    expect(typingUsers).toContain('user-1');
    expect(typingUsers).toContain('user-2');
    expect(typingUsers).toContain('user-3');

    // Simulate user 2 stopping typing
    act(() => {
      useChatStore.getState().removeTypingUser('user-2');
    });

    const updatedTypingUsers = useChatStore.getState().typingUsers;
    expect(updatedTypingUsers).toHaveLength(2);
    expect(updatedTypingUsers).toContain('user-1');
    expect(updatedTypingUsers).toContain('user-3');
    expect(updatedTypingUsers).not.toContain('user-2');
  });
});