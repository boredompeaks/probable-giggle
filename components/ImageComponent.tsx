import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';

interface ImageComponentProps {
  url: string;
  width?: number;
  height?: number;
}

const ImageComponent: React.FC<ImageComponentProps> = ({ 
  url, 
  width = 200, 
  height = 200 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <View style={[styles.container, { width, height }]}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading image...</Text>
        </View>
      )}
      
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load image</Text>
        </View>
      ) : (
        <Image
          source={{ uri: url }}
          style={styles.image}
          contentFit="cover"
          transition={200}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
          cachePolicy="memory-disk" // Automatic caching
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    marginVertical: 4,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
  },
});

export default ImageComponent;
