//
// This file defines the CategoryScreen component.
// It displays a list of songs that belong to a specific category.
// The category name is passed via the navigation route parameters and a dummy
// list of songs is used to simulate category-based song selection.
// A back button is added at the top so the user can return to the previous screen.

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
} from "react-native";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from "@expo/vector-icons";
import { fetchTracksByGenre, Track, audioManager } from "../services/musicService";
import { Audio } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeContext } from "../App"; // Import the theme context

const deviceWidth = Dimensions.get("window").width;

type RootStackParamList = {
  Main: undefined;
  Category: { category: string; limit?: number };
};

type CategoryScreenRouteProp = RouteProp<RootStackParamList, "Category">;
type CategoryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Category">;

export default function CategoryScreen() {
  // Get theme context
  const { isDarkMode } = useThemeContext();
  
  const route = useRoute<CategoryScreenRouteProp>();
  const navigation = useNavigation<CategoryScreenNavigationProp>();
  const { category, limit = 30 } = route.params; // Default to 30 tracks
  
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const loadTracks = async () => {
      try {
        setIsLoading(true);
        console.log(`Fetching ${limit} tracks for ${category}...`);
        const result = await fetchTracksByGenre(category, limit);
        setTracks(result);
      } catch (error) {
        console.error("Error loading category tracks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTracks();
    
    // Clean up when component unmounts
    return () => {
      // No need to unload sound here as it's managed globally
    };
  }, [category, limit]);

  const playTrack = async (track: Track) => {
    try {
      setCurrentTrack(track);
      setIsLoading(true);
      
      // Use the global audio manager to play the track
      await audioManager.loadAndPlayTrack(track.audio, onPlaybackStatusUpdate);
      setIsPlaying(true);
    } catch (error) {
      console.error("Error playing track:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis);
      setIsPlaying(status.isPlaying);
    }
  };
  
  const togglePlayPause = async () => {
    if (isPlaying) {
      await audioManager.pauseCurrentTrack();
    } else {
      await audioManager.resumeCurrentTrack();
    }
  };
  
  const seekBackward = async () => {
    const newPosition = Math.max(0, position - 15000); // 15 seconds back
    await audioManager.seekCurrentTrack(newPosition);
  };
  
  const seekForward = async () => {
    const newPosition = Math.min(duration, position + 15000); // 15 seconds forward
    await audioManager.seekCurrentTrack(newPosition);
  };
  
  const formatTime = (millis: number) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = Math.floor((millis % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const renderTrackItem = ({ item }: { item: Track }) => {
    const isActive = currentTrack?.id === item.id;
    
    return (
      <TouchableOpacity 
        style={[
          styles.trackItem, 
          { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
          isActive && { 
            backgroundColor: isDarkMode ? 'rgba(13,148,136,0.2)' : 'rgba(13,148,136,0.1)',
            borderLeftWidth: 4,
            borderLeftColor: '#0D9488',
          }
        ]} 
        onPress={() => playTrack(item)}
      >
        <Image 
          source={{ uri: item.image }} 
          style={styles.trackImage}
          defaultSource={require("../assets/search-page-images/daniel-schludi-mbGxz7pt0jM-unsplash.jpg")}
        />
        <View style={styles.trackInfo}>
          <Text style={[styles.trackTitle, { color: isDarkMode ? '#fff' : '#000' }]} numberOfLines={1}>{item.name}</Text>
          <Text style={[styles.trackArtist, { color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }]} numberOfLines={1}>{item.artist_name}</Text>
          <Text style={[styles.trackAlbum, { color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }]} numberOfLines={1}>{item.album_name}</Text>
          
          {isActive && (
            <View style={styles.seekControlsRow}>
              <TouchableOpacity onPress={seekBackward} style={styles.trackSeekButton}>
                <Text style={styles.trackSeekText}>-15s</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={seekForward} style={styles.trackSeekButton}>
                <Text style={styles.trackSeekText}>+15s</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        <View style={styles.trackControls}>
          {isActive && isPlaying ? (
            <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
              <Ionicons name="pause" size={22} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => playTrack(item)} style={styles.playButton}>
              <Ionicons name="play" size={22} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? "#111827" : "#f5f5f5" }]}>
      <LinearGradient
        colors={isDarkMode ? ['#0D9488', '#111827'] : ['#0D9488', '#e0e0e0']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <Text style={styles.categoryTitle}>{category}</Text>
        
        <Text style={styles.trackCount}>{tracks.length} tracks</Text>
      </LinearGradient>
      
      {isLoading && tracks.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0D9488" />
          <Text style={[styles.loadingText, { color: isDarkMode ? 'rgba(255,255,255,0.7)' : '#333' }]}>Loading {limit} tracks...</Text>
        </View>
      ) : (
        <FlatList
          data={tracks}
          keyExtractor={(item) => item.id}
          renderItem={renderTrackItem}
          contentContainerStyle={styles.trackList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="musical-notes" size={50} color={isDarkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"} />
              <Text style={[styles.emptyText, { color: isDarkMode ? 'rgba(255,255,255,0.5)' : '#555' }]}>No tracks found for this category</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  backButton: { 
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: '#fff',
    marginBottom: 8,
  },
  trackCount: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  loadingText: { 
    fontSize: 16, 
    marginTop: 12,
  },
  trackList: {
    padding: 16,
    paddingBottom: 16, // Reduced padding since no mini player anymore
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    overflow: 'hidden',
  },
  trackImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  trackInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  trackArtist: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 2,
  },
  trackAlbum: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 4,
  },
  trackControls: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0D9488',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginTop: 16,
  },
  seekControlsRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  trackSeekButton: {
    backgroundColor: 'rgba(13,148,136,0.3)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginRight: 8,
  },
  trackSeekText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
});
