import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Lock, Mail, User, Eye, EyeOff } from 'lucide-react-native';

interface AuthScreenProps {
  supabase: any;
  onAuthSuccess: (session: any) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ supabase, onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAuthTime, setLastAuthTime] = useState(0);

  // Auth race condition: Prevent rapid auth attempts
  const preventAuthSpam = useCallback(() => {
    const now = Date.now();
    if (now - lastAuthTime < 2000) {
      Alert.alert('Too Fast', 'Please wait before trying again.');
      return true;
    }
    setLastAuthTime(now);
    return false;
  }, [lastAuthTime]);

  const handleAuth = useCallback(async () => {
    if (preventAuthSpam()) return;
    
    if (!email || !password || (isSignUp && !name)) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name
            }
          }
        });

        if (error) throw error;
        
        if (data.user) {
          Alert.alert(
            'Success',
            'Please check your email to confirm your account.',
            [{ text: 'OK' }]
          );
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;
        
        if (data.session) {
          onAuthSuccess(data.session);
        }
      }
    } catch (error: any) {
      Alert.alert('Auth Error', error.message);
    } finally {
      setIsLoading(false);
    }
  }, [email, password, name, isSignUp, supabase, onAuthSuccess, preventAuthSpam]);

  return (
    <View className="flex-1 bg-gray-900 justify-center items-center p-6">
      <View className="w-full max-w-sm space-y-6">
        {/* Logo/Title */}
        <View className="items-center">
          <Lock size={48} color="#3B82F6" />
          <Text className="text-white text-2xl font-bold mt-4">
            V5 Chat Vault
          </Text>
          <Text className="text-gray-400 text-center mt-2">
            Secure. Private. Reliable.
          </Text>
        </View>

        {/* Form */}
        <View className="space-y-4">
          {isSignUp && (
            <View className="relative">
              <User size={20} color="#6B7280" className="absolute left-4 top-1/2 transform -translate-y-1/2" />
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Full Name"
                placeholderTextColor="#9CA3AF"
                className="bg-gray-800 text-white p-4 rounded-xl pl-12 border border-gray-700"
                autoCapitalize="words"
              />
            </View>
          )}
          
          <View className="relative">
            <Mail size={20} color="#6B7280" className="absolute left-4 top-1/2 transform -translate-y-1/2" />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              className="bg-gray-800 text-white p-4 rounded-xl pl-12 border border-gray-700"
              autoCapitalize="none"
            />
          </View>
          
          <View className="relative">
            <Lock size={20} color="#6B7280" className="absolute left-4 top-1/2 transform -translate-y-1/2" />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPassword}
              className="bg-gray-800 text-white p-4 rounded-xl pl-12 pr-12 border border-gray-700"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2"
            >
              {showPassword ? (
                <EyeOff size={20} color="#6B7280" />
              ) : (
                <Eye size={20} color="#6B7280" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Auth Button */}
        <TouchableOpacity
          onPress={handleAuth}
          disabled={isLoading}
          className={`bg-blue-600 p-4 rounded-xl items-center ${
            isLoading ? 'opacity-50' : ''
          }`}
        >
          <Text className="text-white text-lg font-semibold">
            {isLoading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </Text>
        </TouchableOpacity>

        {/* Toggle Sign In/Up */}
        <TouchableOpacity
          onPress={() => {
            setIsSignUp(!isSignUp);
            setEmail('');
            setPassword('');
            setName('');
          }}
          className="items-center"
        >
          <Text className="text-blue-400">
            {isSignUp 
              ? 'Already have an account? Sign In' 
              : "Don't have an account? Sign Up"
            }
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AuthScreen;