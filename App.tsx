import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SearchPage from './components/search';
import HomePage from './components/home';
import SettingsPage from './components/settings';
import SignIn from './components/signin';
import SignUpPage from './components/signup';
import CategoryScreen from './components/CategoryScreen';
import { supabase } from './lib/supabaseClient';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, Layout, Text } from '@ui-kitten/components';
import theme from './themes/dark-theme.json';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

function AuthenticatedScreens({ activeTab, setActiveTab, onSignOut }: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSignOut: () => void;
}) {
  return (
    
      <Stack.Navigator initialRouteName={activeTab} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home">
          {() => <HomePage setActiveTab={setActiveTab} />}
        </Stack.Screen>
        <Stack.Screen name="Search" component={SearchPage} />
        <Stack.Screen name="Settings">
          {() => <SettingsPage onSignOut={onSignOut} />}
        </Stack.Screen>
        <Stack.Screen name="Category" component={CategoryScreen} />
      </Stack.Navigator>
    );
}

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

  const renderContent = () => {
    if (!isAuthenticated) {
      if (showSignUp) {
        return (
          <SignUpPage
            onSignUp={handleSignUp}
            onNavigateToSignIn={() => setShowSignUp(false)}
            onSuccessfulSignUp={() => setIsAuthenticated(true)}
          />
        );
      }
      return (
        <SignIn
          onSignIn={handleSignIn}
          onNavigateToSignUp={() => setShowSignUp(true)}
          onSuccessfulSignIn={() => setIsAuthenticated(true)}
        />
      );
    }
    return (
      <NavigationContainer>
        <AuthenticatedScreens activeTab={activeTab} setActiveTab={setActiveTab} onSignOut={handleSignOut} />
      </NavigationContainer>
    );
  };

  return (
    <ApplicationProvider {...eva} theme={{ ...eva.dark, ...theme }}>
    <Layout style={{ flex: 1 }}>
      <Layout style={{ flex: 1 }}>{renderContent()}</Layout>
      {isAuthenticated && (
        <Layout style={styles.bottomNav} level="2">
          <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('Home')}>
            <Ionicons name="home" size={24} color="#0D9488" />
            <Text category="c1" style={styles.navText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('Search')}>
            <Ionicons name="search" size={24} color="#0D9488" />
            <Text category="c1" style={styles.navText}>Search</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('Settings')}>
            <Ionicons name="settings" size={24} color="#0D9488" />
            <Text category="c1" style={styles.navText}>Settings</Text>
          </TouchableOpacity>
        </Layout>
      )}
    </Layout>
  </ApplicationProvider>
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

