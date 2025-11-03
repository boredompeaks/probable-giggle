import React from 'react';
import { ImageBackground, StyleSheet, Dimensions, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

interface GlobalBackdropProps {
  children: React.ReactNode;
  opacity?: number;
  blurAmount?: number;
}

export const GlobalBackdrop: React.FC<GlobalBackdropProps> = ({ 
  children, 
  opacity = 0.8,
  blurAmount = 0 
}) => {
  const { backgroundImage, isDark } = useTheme();

  return (
    <View style={styles.container}>
      <ImageBackground
        source={backgroundImage}
        style={styles.background}
        resizeMode="cover"
        imageStyle={styles.backgroundImage}
      >
        {/* Overlay for better text readability */}
        <View 
          style={[
            styles.overlay,
            { 
              backgroundColor: isDark 
                ? `rgba(10, 10, 10, ${opacity})` 
                : `rgba(248, 250, 252, ${opacity})` 
            }
          ]} 
        />
        {children}
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default GlobalBackdrop;