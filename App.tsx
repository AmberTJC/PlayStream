import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SearchPage from './components/search';
import HomePage from './components/home';
import SettingsPage from './components/settings';
import SignIn from './components/signin';
import SignUpPage from './components/signup';
import { supabase } from './lib/supabaseClient';

export default function App() {
  const [activeTab, setActiveTab] = useState('Home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  const handleSignIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log('Sign In Error:', error.message);
      } else {
        console.log('Sign In Successful:', data);
        setIsAuthenticated(true); 
      }
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const handleSignOut = () => {
    setIsAuthenticated(false); 
  };

  const handleSignUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.log('Sign Up Error:', error.message);
      } else {
        console.log('Sign Up Successful:', data);
      }
    } catch (error) {
      console.error('Error signing up:', error);
    }
  };

  const handleNavigateToSignIn = () => {
    setShowSignUp(false); 
  };


  const handleNavigateToSignUp = () => {
    setShowSignUp(true); 
  };

  const handleSuccessfulSignIn = () => {
    setIsAuthenticated(true);
  };

  const handleSuccessfulSignUp = () => {
    setIsAuthenticated(true); 
  };

  const renderContent = () => {
    if (!isAuthenticated) {
      if (showSignUp) {
        return (
          <SignUpPage
            onSignUp={handleSignUp}
            onNavigateToSignIn={handleNavigateToSignIn}
            onSuccessfulSignUp={handleSuccessfulSignUp}
          />
        );
      }

      return (
        <SignIn
          onSignIn={handleSignIn}
          onNavigateToSignUp={handleNavigateToSignUp}
          onSuccessfulSignIn={handleSuccessfulSignIn}
        />
      );
    }

    switch (activeTab) {
      case 'Home':
        return <HomePage setActiveTab={setActiveTab} />;
      case 'Search':
        return <SearchPage />;
      case 'Settings':
        return <SettingsPage onSignOut={handleSignOut} />;
      default:
        return <HomePage setActiveTab={setActiveTab} />;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {renderContent()}
      </View>

      {isAuthenticated && (
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('Home')}>
            <Ionicons name="home" size={24} color="#0D9488" />
            <Text style={styles.navText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('Search')}>
            <Ionicons name="search" size={24} color="#0D9488" />
            <Text style={styles.navText}>Search</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('Settings')}>
            <Ionicons name="settings" size={24} color="#0D9488" />
            <Text style={styles.navText}>Settings</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#0D9488',
  },
});

