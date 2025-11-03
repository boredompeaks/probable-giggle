// V5: Race Condition-Fixed Chat Store
// Addresses: Lazy Load vs Live Insert, Typing Ghost, Image vs Text ordering
import { create } from './storeImplementation';

export interface Message {
  id: string;
  created_at: string;
  text: string;
  user_id: string;
  parent_message_id?: number;
  image_url?: string;
  temp_id?: string; // For optimistic UI
  status?: 'sending' | 'sent' | 'failed'; // For upload status
}

interface ChatState {
  // Loading states
  isLoading: boolean;
  isFetchingMore: boolean;
  
  // Message data
  messages: Message[];
  pendingNewMessages: Message[]; // V5 Race Fix: Hold new messages during fetch
  currentPage: number;
  
  // Real-time data
  typingUsers: string[];
  onlineUsers: string[];
  typingTimeouts: Map<string, NodeJS.Timeout>; // V5 Race Fix: Track typing timeouts
  
  // Actions
  setIsLoading: (loading: boolean) => void;
  setMessages: (messages: Message[], prepend?: boolean) => void;
  addPendingMessage: (message: Message) => void; // V5 Race Fix: Add to pending
  flushPendingMessages: () => void; // V5 Race Fix: Merge pending with current
  setTypingUsers: (users: string[]) => void;
  addTypingUser: (userId: string) => void; // V5 Race Fix: Individual user management
  removeTypingUser: (userId: string) => void; // V5 Race Fix: Individual user management
  setOnlineUsers: (users: string[]) => void;
  setIsFetchingMore: (fetching: boolean) => void;
  setCurrentPage: (page: number) => void;
  reset: () => void;
  
  // V4 Race Fix: Reaction state
  reactingMessages: Set<string>; // Track messages being reacted to
  setReactingMessage: (messageId: string, reacting: boolean) => void;
}

const initialState = {
  isLoading: true,
  isFetchingMore: false,
  messages: [],
  pendingNewMessages: [],
  currentPage: 0,
  typingUsers: [],
  onlineUsers: [],
  typingTimeouts: new Map<string, NodeJS.Timeout>(),
  reactingMessages: new Set<string>(),
};

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  ...initialState,
  
  // Actions
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  setMessages: (newMessages, prepend = false) => {
    const { pendingNewMessages, messages } = get();
    
    if (prepend) {
      // V5 Race Fix: Merge pending messages first, then new messages
      const allMessages = [...pendingNewMessages, ...newMessages, ...messages];
      set({ 
        messages: allMessages,
        pendingNewMessages: [] // Clear pending after merging
      });
    } else {
      set({ messages: newMessages });
    }
  },
  
  // V5 Race Fix: Handle pending messages during fetch
  addPendingMessage: (message) => {
    const { pendingNewMessages } = get();
    set({ pendingNewMessages: [message, ...pendingNewMessages] });
  },
  
  // V5 Race Fix: Merge pending messages with current
  flushPendingMessages: () => {
    const { pendingNewMessages, messages } = get();
    if (pendingNewMessages.length > 0) {
      set({ 
        messages: [...pendingNewMessages, ...messages],
        pendingNewMessages: []
      });
    }
  },
  
  setTypingUsers: (users) => set({ typingUsers: users }),
  
  // V5 Race Fix: Individual typing user management
  addTypingUser: (userId) => {
    const { typingUsers, typingTimeouts } = get();
    if (!typingUsers.includes(userId)) {
      set({ typingUsers: [...typingUsers, userId] });
      
      // Clear existing timeout for this user
      const existingTimeout = typingTimeouts.get(userId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }
      
      // Set new timeout to remove user after 3 seconds
      const timeout = setTimeout(() => {
        get().removeTypingUser(userId);
      }, 3000);
      
      set({ 
        typingTimeouts: new Map(typingTimeouts.set(userId, timeout))
      });
    }
  },
  
  // V5 Race Fix: Remove specific typing user
  removeTypingUser: (userId) => {
    const { typingUsers, typingTimeouts } = get();
    const timeout = typingTimeouts.get(userId);
    if (timeout) {
      clearTimeout(timeout);
    }
    
    set({ 
      typingUsers: typingUsers.filter(id => id !== userId),
      typingTimeouts: new Map([...typingTimeouts].filter(([id]) => id !== userId))
    });
  },
  
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  
  setIsFetchingMore: (fetching) => {
    if (fetching === false) {
      // V5 Race Fix: Flush pending messages when fetch completes
      get().flushPendingMessages();
    }
    set({ isFetchingMore: fetching });
  },
  
  setCurrentPage: (page) => set({ currentPage: page }),
  
  // V4 Race Fix: Reaction spam prevention
  setReactingMessage: (messageId, reacting) => {
    const { reactingMessages } = get();
    const newReactingMessages = new Set(reactingMessages);
    
    if (reacting) {
      newReactingMessages.add(messageId);
    } else {
      newReactingMessages.delete(messageId);
    }
    
    set({ reactingMessages: newReactingMessages });
  },
  
  reset: () => {
    // V5 Race Fix: Clear all timeouts on reset
    const { typingTimeouts } = get();
    typingTimeouts.forEach(timeout => clearTimeout(timeout));
    
    set(initialState);
  },
}));