import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from '@supabase/supabase-js';
import AuthScreen from './AuthScreen';
import ChatListScreen from './ChatListScreen';

// Initialize Supabase client with AsyncStorage
const supabase = createClient(
  'https://xsirbxbpzxgcanmronoq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzaXJieGJwenhnY2FubXJvbm9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwODMxMDAsImV4cCI6MjA3NzY1OTEwMH0.HV7LABfgHax6pxARBRRPTDCFPNS_TYSmzxnZNCXR8EQ',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

interface ChatAppProps {
  onPanic: () => void;
}

const ChatApp: React.FC<ChatAppProps> = ({ onPanic }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return null;
  }

  return (
    <>
      {session ? (
        <ChatListScreen supabase={supabase} session={session} onPanic={onPanic} />
      ) : (
        <AuthScreen supabase={supabase} />
      )}
    </>
  );
};

export default ChatApp;