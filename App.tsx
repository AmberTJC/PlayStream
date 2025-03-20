import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SearchPage from './components/search';
import HomePage from './components/home';

export default function App() {
  const [activeTab, setActiveTab] = useState('Home');

  const renderContent = () => {
    switch (activeTab) {
      case 'Home':
        return <HomePage setActiveTab={setActiveTab} />;
      case 'Search':
        return <SearchPage />; 
      case 'Settings':
        return (
          <View style={styles.settingsContainer}>
            <Text style={styles.settingsText}>Settings Page</Text>
          </View>
        ); //placeholder 
      default:
        return <HomePage setActiveTab={setActiveTab} />;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Render content based on active tab */}
      <View style={{ flex: 1 }}>
        {renderContent()}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('Home')} 
        >
          <Ionicons name="home" size={24} color="#0D9488" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('Search')}
        >
          <Ionicons name="search" size={24} color="#0D9488" />
          <Text style={styles.navText}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('Settings')}
        >
          <Ionicons name="settings" size={24} color="#0D9488" />
          <Text style={styles.navText}>Settings</Text>
        </TouchableOpacity>
      </View>
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
  settingsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsText: {
    fontSize: 24,
    color: '#fff',
  },
});

