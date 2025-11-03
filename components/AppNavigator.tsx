import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Menu, MessageCircle, User, Settings, LogOut } from 'lucide-react-native';
import { SupabaseClient } from '@supabase/supabase-js';
import { Session } from '@supabase/supabase-js';
import ChatListScreen from './ChatListScreen';
import SquishyButton from './SquishyButton';

interface AppNavigatorProps {
  onPanic: () => void;
  onSignOut: () => void;
  supabase?: SupabaseClient;
  session?: Session;
}

// Simulated Drawer Navigator
const AppNavigator: React.FC<AppNavigatorProps> = ({ onPanic, onSignOut, supabase, session }) => {
  const [currentScreen, setCurrentScreen] = React.useState('Chat');
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const navigateTo = (screenName: string) => {
    setCurrentScreen(screenName);
    setIsDrawerOpen(false);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Chat':
        return <ChatListScreen onPanic={onPanic} supabase={supabase} session={session} />;
      case 'Profile':
        return <ProfileScreen onSignOut={onSignOut} />;
      default:
        return <ChatListScreen onPanic={onPanic} supabase={supabase} session={session} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with Menu Button */}
      <View style={styles.header}>
        <SquishyButton onPress={toggleDrawer} style={styles.menuButton}>
          <Menu size={24} color="#FFFFFF" />
        </SquishyButton>
        <Text style={styles.headerTitle}>{currentScreen}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {renderScreen()}
      </View>

      {/* Simulated Drawer */}
      {isDrawerOpen && (
        <View style={styles.drawerOverlay}>
          <View style={styles.drawer}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Chat Vault</Text>
              <TouchableOpacity onPress={() => setIsDrawerOpen(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.drawerItem}
              onPress={() => navigateTo('Chat')}
            >
              <MessageCircle size={20} color="#3B82F6" />
              <Text style={styles.drawerItemText}>Chat</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.drawerItem}
              onPress={() => navigateTo('Profile')}
            >
              <User size={20} color="#3B82F6" />
              <Text style={styles.drawerItemText}>Profile</Text>
            </TouchableOpacity>

            <View style={styles.drawerSeparator} />

            <TouchableOpacity
              style={[styles.drawerItem, styles.signOutItem]}
              onPress={onSignOut}
            >
              <LogOut size={20} color="#DC2626" />
              <Text style={[styles.drawerItemText, styles.signOutText]}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

interface ProfileScreenProps {
  onSignOut: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onSignOut }) => {
  return (
    <View style={styles.profileContainer}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <User size={48} color="#6B7280" />
        </View>
        <Text style={styles.profileName}>Chat User</Text>
        <Text style={styles.profileEmail}>user@chatvault.com</Text>
      </View>

      <View style={styles.profileOptions}>
        <TouchableOpacity style={styles.profileOption}>
          <Settings size={24} color="#6B7280" />
          <Text style={styles.profileOptionText}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.profileOption}>
          <MessageCircle size={24} color="#6B7280" />
          <Text style={styles.profileOptionText}>Chat History</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={onSignOut}>
        <LogOut size={24} color="#FFFFFF" />
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1F2937',
  },
  menuButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  drawerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    width: 280,
    height: '100%',
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  drawerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    fontSize: 24,
    color: '#6B7280',
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 12,
  },
  drawerItemText: {
    marginLeft: 16,
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  drawerSeparator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  signOutItem: {
    backgroundColor: '#FEF2F2',
    marginTop: 16,
  },
  signOutText: {
    color: '#DC2626',
  },
  profileContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#6B7280',
  },
  profileOptions: {
    marginVertical: 24,
  },
  profileOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  profileOptionText: {
    marginLeft: 16,
    fontSize: 16,
    color: '#1F2937',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: '#DC2626',
    borderRadius: 12,
    marginTop: 'auto',
    marginBottom: 40,
  },
  signOutButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AppNavigator;