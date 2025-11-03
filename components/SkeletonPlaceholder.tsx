import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

const SkeletonPlaceholder: React.FC = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();
    return () => shimmer.stop();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Animated.View style={[styles.headerSkeleton, { opacity }]} />
      </View>
      
      {/* Message bubbles skeleton */}
      {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
        <View 
          key={item} 
          style={[
            styles.messageBubble,
            item % 2 === 0 ? styles.leftBubble : styles.rightBubble
          ]}
        >
          <Animated.View 
            style={[
              styles.bubbleSkeleton,
              { opacity },
              item % 2 === 0 ? styles.leftBubbleColor : styles.rightBubbleColor
            ]} 
          />
          <Animated.View 
            style={[
              styles.timeSkeleton,
              { opacity },
            ]} 
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  headerSkeleton: {
    height: 24,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    width: '40%',
  },
  messageBubble: {
    marginBottom: 12,
  },
  leftBubble: {
    alignItems: 'flex-start',
  },
  rightBubble: {
    alignItems: 'flex-end',
  },
  bubbleSkeleton: {
    height: 60,
    borderRadius: 12,
    width: '70%',
    marginBottom: 4,
  },
  leftBubbleColor: {
    backgroundColor: '#E5E7EB',
  },
  rightBubbleColor: {
    backgroundColor: '#DBEAFE',
  },
  timeSkeleton: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    width: 60,
  },
});

export default SkeletonPlaceholder;
