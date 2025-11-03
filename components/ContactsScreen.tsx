import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import { Search, Plus, MessageCircle, User } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Contact {
  id: string;
  name: string;
  username: string;
  lastSeen: string;
}

interface ContactsScreenProps {
  onCreateChat: (contact: Contact) => void;
  onClose: () => void;
  displayName: string;
}

const ContactsScreen: React.FC<ContactsScreenProps> = ({ onCreateChat, onClose, displayName }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Sample contacts data
  const [contacts] = useState<Contact[]>([
    { id: '1', name: 'Alice Johnson', username: 'alice_j', lastSeen: '2 min ago' },
    { id: '2', name: 'Bob Smith', username: 'bob_smith', lastSeen: '5 min ago' },
    { id: '3', name: 'Carol Wilson', username: 'carol_w', lastSeen: '1 hour ago' },
    { id: '4', name: 'David Brown', username: 'david_b', lastSeen: '3 hours ago' },
    { id: '5', name: 'Emma Davis', username: 'emma_d', lastSeen: 'Yesterday' },
    { id: '6', name: 'Frank Miller', username: 'frank_m', lastSeen: '2 days ago' },
    { id: '7', name: 'Grace Lee', username: 'grace_l', lastSeen: '1 week ago' },
    { id: '8', name: 'Henry Taylor', username: 'henry_t', lastSeen: '2 weeks ago' },
    { id: '9', name: 'Ivy Chen', username: 'ivy_c', lastSeen: '1 month ago' },
    { id: '10', name: 'Jack Wilson', username: 'jack_w', lastSeen: '2 months ago' },
  ]);

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateChat = (contact: Contact) => {
    onCreateChat(contact);
    Alert.alert('Chat Created', `Started chat with ${contact.name}`);
  };

  const handleAddContact = async () => {
    if (!newContactName.trim()) {
      Alert.alert('Error', 'Please enter a contact name');
      return;
    }

    const newContact: Contact = {
      id: Date.now().toString(),
      name: newContactName,
      username: newContactName.toLowerCase().replace(/\s+/g, '_'),
      lastSeen: 'Just now',
    };

    // In a real app, you would save this to a database
    await AsyncStorage.setItem(`contact_${newContact.id}`, JSON.stringify(newContact));
    
    setNewContactName('');
    setShowAddForm(false);
    
    Alert.alert('Success', `Added ${newContact.name} to contacts`);
  };

  const renderContact = ({ item }: { item: Contact }) => (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={() => handleCreateChat(item)}
    >
      <View style={styles.avatarContainer}>
        <User size={24} color="#6B7280" />
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.contactUsername}>@{item.username}</Text>
        <Text style={styles.lastSeen}>{item.lastSeen}</Text>
      </View>
      <MessageCircle size={20} color="#10B981" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Contacts</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Done</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#6B7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Add Contact Button */}
      <TouchableOpacity
        style={styles.addContactButton}
        onPress={() => setShowAddForm(true)}
      >
        <Plus size={20} color="#FFFFFF" />
        <Text style={styles.addContactText}>Add New Contact</Text>
      </TouchableOpacity>

      {/* Add Contact Form */}
      {showAddForm && (
        <View style={styles.addForm}>
          <TextInput
            style={styles.addFormInput}
            placeholder="Enter contact name"
            value={newContactName}
            onChangeText={setNewContactName}
          />
          <View style={styles.addFormButtons}>
            <TouchableOpacity
              style={[styles.addFormButton, styles.cancelButton]}
              onPress={() => {
                setShowAddForm(false);
                setNewContactName('');
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addFormButton, styles.saveButton]}
              onPress={handleAddContact}
            >
              <Text style={styles.saveButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Contacts List */}
      <FlatList
        data={filteredContacts}
        renderItem={renderContact}
        keyExtractor={item => item.id}
        style={styles.contactsList}
        showsVerticalScrollIndicator={false}
      />

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Logged in as: <Text style={styles.footerUsername}>{displayName}</Text>
        </Text>
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#111827',
  },
  addContactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 12,
    backgroundColor: '#10B981',
    borderRadius: 12,
  },
  addContactText: {
    marginLeft: 8,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  addForm: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  addFormInput: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    fontSize: 16,
  },
  addFormButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addFormButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#10B981',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  contactsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  contactUsername: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  lastSeen: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  footerUsername: {
    fontWeight: '600',
    color: '#3B82F6',
  },
});

export default ContactsScreen;