import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HomePageProps {
  setActiveTab: (tab: string) => void;
}

const playlists = [
  { name: 'Favourites', image: require('../assets/home-images/favs.jpg') },
  { name: 'Chill Vibes', image: require('../assets/home-images/chill vibes.png') },
  { name: 'Acoustics', image: require('../assets/home-images/acoustics.jpg') },
  { name: 'Throwbacks', image: require('../assets/home-images/Billy Joel.jpg') },
  { name: 'Party Music', image: require('../assets/home-images/party music.jpg') },
  { name: 'Country Vibes', image: require('../assets/home-images/country vibes.jpg') },
];

export default function HomePage({ setActiveTab }: HomePageProps) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>PlayStream</Text>
      </View>

      {/* Music Player */}
      <View style={styles.musicPlayer}>
        {/* Controls */}
        <View style={styles.controls}>
          <Ionicons name="play-back" size={30} color="#0D9488" />
          <TouchableOpacity style={styles.playButton}>
            <Ionicons name="play" size={40} color="#fff" />
          </TouchableOpacity>
          <Ionicons name="play-forward" size={30} color="#0D9488" />
        </View>
      </View>

      {/* User Playlists */}
      <View style={styles.playlistsContainer}>
        <Text style={styles.sectionTitle}>My Playlists</Text>
        <ScrollView contentContainerStyle={styles.playlistsGrid}>
          {playlists.map((playlist) => (
            <TouchableOpacity key={playlist.name} style={styles.playlistItem}>
              <Image source={playlist.image} style={styles.playlistImage} />
              <Text style={styles.playlistText}>{playlist.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 0, 
  },
  header: {
    backgroundColor: '#0D9488',
    padding: 12,
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  musicPlayer: {
    alignItems: 'center',
    backgroundColor: '#1F2937',
    padding: 20,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginTop: 10,
  },
  playButton: {
    backgroundColor: '#0D9488',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playlistsContainer: {
    padding: 16,
  },
  sectionTitle: {
    color: '#0D9488',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  playlistsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  playlistItem: {
    width: '30%',
    alignItems: 'center',
  },
  playlistImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 5,
  },
  playlistText: {
    color: '#fff',
    fontSize: 12,
  },
});



