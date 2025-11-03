// Jest setup file
import 'react-native-gesture-handler/jestSetup';

// Mock React Native modules that aren't available in test environment
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock Lucide icons
jest.mock('lucide-react-native', () => ({
  Send: 'Send',
  LogIn: 'LogIn',
  UserPlus: 'UserPlus'
}));

// Mock BlurView
jest.mock('@react-native-community/blur', () => 'BlurView');

// Mock WebBrowser
jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn()
}));

// Global test setup
global.console = {
  ...console,
  // Uncomment to suppress specific console warnings during tests
  // warn: jest.fn(),
  // error: jest.fn()
};