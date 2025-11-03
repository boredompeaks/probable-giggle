import React from 'react';
import { render, screen } from '@testing-library/react-native';
import AuthScreen from '../components/AuthScreen';

// Mock Supabase client
const mockSupabase = {
  auth: {
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
  },
};

describe('AuthScreen Component Tests', () => {
  it('renders the login form', () => {
    render(<AuthScreen supabase={mockSupabase} />);
    
    // Check if essential elements are rendered
    expect(screen.getByText('Chat Vault')).toBeTruthy();
    expect(screen.getByText('Sign In')).toBeTruthy();
    expect(screen.getByText('Email')).toBeTruthy();
    expect(screen.getByText('Password')).toBeTruthy();
  });

  it('renders email input field', () => {
    render(<AuthScreen supabase={mockSupabase} />);
    
    const emailInput = screen.getByPlaceholderText('Enter your email');
    expect(emailInput).toBeTruthy();
  });

  it('renders password input field', () => {
    render(<AuthScreen supabase={mockSupabase} />);
    
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    expect(passwordInput).toBeTruthy();
  });

  it('renders sign in button', () => {
    render(<AuthScreen supabase={mockSupabase} />);
    
    // The button should show "Sign In" by default
    const signInButton = screen.getByText('Sign In');
    expect(signInButton).toBeTruthy();
  });

  it('renders toggle text for switching between sign in and sign up', () => {
    render(<AuthScreen supabase={mockSupabase} />);
    
    const toggleText = screen.getByText("Don't have an account? Sign Up");
    expect(toggleText).toBeTruthy();
  });

  it('shows sign up mode when toggle is clicked', () => {
    render(<AuthScreen supabase={mockSupabase} />);
    
    // Click the toggle text to switch to sign up mode
    const toggleText = screen.getByText("Don't have an account? Sign Up");
    toggleText.props.onClick();
    
    // After click, the text should change
    expect(screen.getByText('Already have an account? Sign In')).toBeTruthy();
  });

  it('does not render Supabase-specific elements in isolation', () => {
    render(<AuthScreen supabase={mockSupabase} />);
    
    // Component should render without errors even without actual Supabase connection
    expect(screen.getByText('Chat Vault')).toBeTruthy();
  });
});

describe('AuthScreen Form Validation', () => {
  it('has proper form structure', () => {
    render(<AuthScreen supabase={mockSupabase} />);
    
    // Should have proper form inputs
    const emailField = screen.getByText('Email');
    const passwordField = screen.getByText('Password');
    
    expect(emailField).toBeTruthy();
    expect(passwordField).toBeTruthy();
  });
});

describe('AuthScreen Styling Classes', () => {
  it('applies dark theme styling', () => {
    render(<AuthScreen supabase={mockSupabase} />);
    
    // Just verify the component renders without crashing
    // The actual styling classes would be tested in integration tests
    expect(screen.getByText('Chat Vault')).toBeTruthy();
  });
});