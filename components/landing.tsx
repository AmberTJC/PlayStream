import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface LandingProps {
  onSignOut: () => void;
}

export default function Landing({ onSignOut }: LandingProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>PlayStream</Text>
        <TouchableOpacity onPress={onSignOut} style={styles.signOutButton}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.welcomeText}>Welcome to PlayStream</Text>
        <Text style={styles.subtitle}>Your music journey begins here</Text>

        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Ionicons name="musical-notes" size={32} color="#0D9488" />
            <Text style={styles.featureText}>Discover Music</Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="heart" size={32} color="#0D9488" />
            <Text style={styles.featureText}>Save Favorites</Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="list" size={32} color="#0D9488" />
            <Text style={styles.featureText}>Create Playlists</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    backgroundColor: '#0D9488',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  signOutButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 48,
    textAlign: 'center',
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  featureItem: {
    alignItems: 'center',
  },
  featureText: {
    color: '#fff',
    marginTop: 8,
    fontSize: 14,
  },
}); 