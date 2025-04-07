import React, { useState, createContext, useContext } from 'react';
import { TouchableOpacity } from 'react-native';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, Layout } from '@ui-kitten/components';
import { default as darkTheme } from './themes/dark-theme.json';
import { default as lightTheme } from './themes/light-theme.json';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomePage from './components/home';
import SearchPage from './components/search';
import SettingsPage from './components/settings';
import SignIn from './components/signin';
import SignUpPage from './components/signup';
import { supabase } from './lib/supabaseClient';
import CategoryScreen from './components/CategoryScreen';

// Create a Theme context to share theme state across the app
interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: true,
  toggleTheme: () => {},
});

// Custom hook to use the theme context
export const useThemeContext = () => useContext(ThemeContext);

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs({
  handleSignOut,
}: {
  handleSignOut: () => void;
})  {
  // Use the theme context directly
  const { isDarkMode, toggleTheme } = useThemeContext();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: string = '';
          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Search') {
            iconName = 'search';
          } else if (route.name === 'Settings') {
            iconName = 'settings';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0D9488',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { backgroundColor: '#1F2937' },
      })}
    >
      <Tab.Screen name="Home">
        {(props) => <HomePage {...props} isDarkMode={isDarkMode} />}
      </Tab.Screen>
      <Tab.Screen name="Search">
        {(props) => <SearchPage {...props} isDarkMode={isDarkMode} />}
      </Tab.Screen>
      <Tab.Screen name="Settings">
        {(props) => (
          <SettingsPage
            onSignOut={handleSignOut}
            toggleTheme={toggleTheme}
            isDarkMode={isDarkMode}
            {...props}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const theme = isDarkMode ? { ...eva.dark, ...darkTheme } : { ...eva.light, ...lightTheme };
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  // Theme context value
  const themeContextValue = {
    isDarkMode,
    toggleTheme,
  };

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

  const renderAuthScreens = () => {
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
  };

  return (
    <ApplicationProvider {...eva} theme={theme}>
      <ThemeContext.Provider value={themeContextValue}>
        {isAuthenticated ? (
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Main">
                {() => <MainTabs handleSignOut={handleSignOut} />}
              </Stack.Screen>
              {/* Category is not part of the bottom tabs */}
              <Stack.Screen name="Category" component={CategoryScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        ) : (
          <Layout style={{ flex: 1 }}>{renderAuthScreens()}</Layout>
        )}
      </ThemeContext.Provider>
    </ApplicationProvider>
  );
}

