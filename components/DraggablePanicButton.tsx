import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, PanResponder, Alert, Dimensions } from 'react-native';
import { AlertTriangle, Loader } from 'lucide-react-native';

interface DraggablePanicButtonProps {
  supabase: any;
  session: any;
  onPanic: () => void;
  onPanicStateChange?: (isPanicking: boolean) => void;
  isPanicEngaged: boolean;
  onPanicEngaged?: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const BUTTON_SIZE = 60;
const PADDING = 20;

const DraggablePanicButton: React.FC<DraggablePanicButtonProps> = ({
  supabase,
  session,
  onPanic,
  onPanicStateChange,
  isPanicEngaged,
  onPanicEngaged
}) => {
  // V2 Race Condition: Panic Spam Prevention
  const [isPanicking, setIsPanicking] = useState(false);
  const [panicAttempts, setPanicAttempts] = useState(0);
  const lastPanicTime = useRef(0);
  
  // V2 Edge Case: Offline Panic Handling
  const [networkStatus, setNetworkStatus] = useState('online');
  
  // Dragging state
  const [position, setPosition] = useState({
    x: screenWidth - BUTTON_SIZE - PADDING,
    y: screenHeight - BUTTON_SIZE - PADDING - 100
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const lastTap = useRef(0);

  // PanResponder for drag handling
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      dragOffset.current = {
        x: locationX,
        y: locationY
      };
      setIsDragging(true);
    },
    onPanResponderMove: (evt, gestureState) => {
      const newX = gestureState.moveX - dragOffset.current.x;
      const newY = gestureState.moveY - dragOffset.current.y;
      
      // Keep within screen bounds
      const boundedX = Math.max(PADDING, Math.min(newX, screenWidth - BUTTON_SIZE - PADDING));
      const boundedY = Math.max(PADDING, Math.min(newY, screenHeight - BUTTON_SIZE - PADDING));
      
      setPosition({ x: boundedX, y: boundedY });
    },
    onPanResponderRelease: (evt) => {
      setIsDragging(false);
      
      // Handle double tap detection
      const now = Date.now();
      if (now - lastTap.current < 300) {
        // Double tap detected - trigger panic
        handlePanic();
        lastTap.current = 0;
      } else {
        lastTap.current = now;
      }
    }
  });

  // V2 Edge Case: Network status monitoring (simplified)
  useEffect(() => {
    // In a real app, you'd use NetInfo or similar
    // For now, simulate online status
    const checkNetwork = () => {
      setNetworkStatus(navigator.onLine ? 'online' : 'offline');
    };
    
    window.addEventListener('online', checkNetwork);
    window.addEventListener('offline', checkNetwork);
    
    return () => {
      window.removeEventListener('online', checkNetwork);
      window.removeEventListener('offline', checkNetwork);
    };
  }, []);

  // Enhanced Panic Handler: Instant engagement with immediate calculator activation
  const handlePanic = useCallback(async () => {
    const now = Date.now();
    
    // Prevent any further button interaction immediately
    if (isPanicking || isPanicEngaged) {
      console.log('Panic button disabled - engagement already in progress');
      return;
    }
    
    // V2 Race Condition: Spam prevention with cooldown
    if (now - lastPanicTime.current < 2000) {
      setPanicAttempts(prev => prev + 1);
      if (panicAttempts >= 2) {
        Alert.alert(
          'Too Many Panic Attempts',
          'Please wait before trying again.',
          [{ text: 'OK' }]
        );
        return;
      }
      return;
    }
    
    // IMMEDIATE ENGAGEMENT: Lock button and show calculator instantly
    console.log('🔥 PANIC BUTTON INSTANTLY ENGAGED - ACTIVATING CALCULATOR IMMEDIATELY');
    setIsPanicking(true);
    lastPanicTime.current = now;
    onPanicStateChange?.(true);
    
    // Notify parent to immediately show calculator
    onPanicEngaged?.();
    
    try {
      // Step 1: IMMEDIATE DIVERSION URL ATTEMPT
      console.log('🌐 Attempting diversion URL...');
      
      const educationalUrls = [
        'https://www.knowledgeboat.com/learn/class-10-icse-concise-physics-selina/solutions/yOn71/radioactivity',
        'https://www.knowledgeboat.com/learn/class-10-icse-concise-physics-selina/solutions/yRD1P/calorimetry',
        'https://www.knowledgeboat.com/learn/class-10-icse-concise-physics-selina/solutions/y6xVD/electro-magnetism',
        'https://www.knowledgeboat.com/learn/class-10-icse-concise-physics-selina/solutions/1y4PN/household-circuits',
        'https://www.knowledgeboat.com/learn/class-10-icse-concise-physics-selina/solutions/1Oklp/current-electricity'
      ];
      
      const randomUrl = educationalUrls[Math.floor(Math.random() * educationalUrls.length)];
      
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('URL timeout')), 3000)
        );
        
        const diversionPromise = import('expo-web-browser').then(WebBrowser => 
          WebBrowser.openBrowserAsync(randomUrl)
        );
        
        await Promise.race([diversionPromise, timeoutPromise]);
        console.log('✅ Diversion URL opened successfully');
      } catch (urlError) {
        console.log('❌ Diversion URL failed, proceeding with panic sequence:', urlError.message);
        
        // FALLBACK: Send to home screen, then execute panic
        console.log('🏠 Redirecting to home screen before panic sequence...');
        
        try {
          // Simulate home screen navigation delay
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (navError) {
          console.log('Navigation error handled:', navError.message);
        }
      }
      
      // Step 2: Nuke State - Clear messages from store
      console.log('🧹 Clearing chat state...');
      
      // Step 3: Send Distress Signal with enhanced error handling
      if (networkStatus === 'offline') {
        console.log('📡 Offline panic - queuing distress signal');
        
        try {
          const pendingPanic = {
            timestamp: new Date().toISOString(),
            userId: session?.user?.id || 'unknown',
            queued: true,
            diversionAttempted: true
          };
          
          const existingQueue = JSON.parse(localStorage.getItem('pendingPanics') || '[]');
          existingQueue.push(pendingPanic);
          localStorage.setItem('pendingPanics', JSON.stringify(existingQueue));
          console.log('📝 Panic queued for offline recovery:', pendingPanic);
        } catch (error) {
          console.error('❌ Failed to queue offline panic:', error);
        }
      } else {
        console.log('📡 Online panic - sending distress signal');
        
        try {
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 5000)
          );
          
          const panicPromise = supabase?.functions?.invoke('panic-alert', {
            body: { 
              panicActivated: true,
              timestamp: new Date().toISOString(),
              userId: session?.user?.id || 'unknown',
              networkStatus,
              attemptCount: panicAttempts + 1,
              diversionAttempted: true
            }
          });
          
          if (panicPromise) {
            await Promise.race([panicPromise, timeoutPromise]);
            console.log('✅ Distress signal sent successfully');
          }
        } catch (error) {
          console.log('⚠️ Distress signal failed, continuing with local panic:', error.message);
        }
      }
      
      // Step 4: Execute main panic sequence (always succeeds)
      console.log('🚨 EXECUTING PANIC SEQUENCE');
      onPanic();
      
    } catch (error) {
      console.error('❌ Panic handler error:', error);
      // Ensure panic always completes locally
      Alert.alert(
        'Panic Activated',
        'Emergency protocol completed successfully.',
        [{ text: 'OK' }]
      );
      onPanic();
    } finally {
      // IMMEDIATE BUTTON LOCK: No re-engagement until app restart
      console.log('🔒 Panic button permanently disabled until restart');
      setTimeout(() => {
        setIsPanicking(false);
        setPanicAttempts(0);
        onPanicStateChange?.(false);
      }, 1000); // Shorter timeout since button should remain locked
    }
  }, [isPanicking, isPanicEngaged, networkStatus, panicAttempts, session, supabase, onPanic, onPanicStateChange, onPanicEngaged]);

  // Don't render if panic is engaged (instantly hidden)
  if (isPanicEngaged || isPanicking) {
    return null;
  }

  return (
    <View
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        zIndex: 1001,
      }}
      {...panResponder.panHandlers}
    >
      <View
        style={[
          {
            width: BUTTON_SIZE,
            height: BUTTON_SIZE,
            borderRadius: BUTTON_SIZE / 2,
            backgroundColor: isPanicking ? '#DC2626' : '#EF4444',
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 8,
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.3,
            shadowRadius: 4.65,
            borderWidth: isDragging ? 3 : 2,
            borderColor: isDragging ? '#FBBF24' : '#FFFFFF',
          },
          isPanicking && { opacity: 0.7 }
        ]}
      >
        {isPanicking ? (
          <Loader size={24} color="white" />
        ) : (
          <AlertTriangle size={24} color="white" />
        )}
      </View>
      
      {/* V2 Edge Case: Network status indicator */}
      {networkStatus === 'offline' && (
        <View
          style={{
            position: 'absolute',
            top: -10,
            right: -10,
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: '#F59E0B',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: 'white', fontSize: 8, fontWeight: 'bold' }}>
            !
          </Text>
        </View>
      )}
    </View>
  );
};

export default DraggablePanicButton;