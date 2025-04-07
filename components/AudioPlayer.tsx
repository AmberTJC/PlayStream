//
// This file defines the AudioPlayer component.
// It is responsible for playing audio tracks based on the track index passed via navigation.
// The component handles playing, pausing, skipping forward/backward, and adjusting the volume.
// It shows song details including an image, title, and artist as well as a slider for the current song position.

import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { useRoute, useNavigation } from "@react-navigation/native";
import { fetchTracksByGenre, Track, audioManager } from "../services/musicService";

// Reuse the trending assets from SearchPage
const trendingImages = [
  require("../assets/search-page-images/daniel-schludi-mbGxz7pt0jM-unsplash.jpg"),
  require("../assets/search-page-images/ivan-dorofeev-bsLXJsucvxc-unsplash.jpg"),
  require("../assets/search-page-images/victor-rodvang-rbSpGv1wb5M-unsplash.jpg"),
  require("../assets/search-page-images/chad-morehead-AHnmupFDWCc-unsplash.jpg"),
  require("../assets/search-page-images/john-matychuk-gUK3lA3K7Yo-unsplash.jpg"),
  require("../assets/search-page-images/israel-palacio-Y20JJ_ddy9M-unsplash.jpg"),
];

const trendingMusics = [
  require("../assets/Trending musics/dont-talk-315229.mp3"),
  require("../assets/Trending musics/experimental-cinematic-hip-hop-315904.mp3"),
  require("../assets/Trending musics/gardens-stylish-chill-303261.mp3"),
  require("../assets/Trending musics/gorila-315977.mp3"),
  require("../assets/Trending musics/kugelsicher-by-tremoxbeatz-302838.mp3"),
  require("../assets/Trending musics/so-fresh-315255.mp3"),
];

export default function AudioPlayer() {
  const route = useRoute();
  const navigation = useNavigation();
  const { trackId, genre } = route.params as { trackId?: string; genre?: string; index?: number };

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalTracks, setTotalTracks] = useState(0);

  useEffect(() => {
    // Load tracks based on genre if provided
    const loadTracks = async () => {
      setIsLoading(true);
      try {
        // Default to 'trending' genre if none provided
        const genreToLoad = genre || 'trending';
        console.log(`Loading 30 tracks for genre: ${genreToLoad}`);
        
        // Increased to 30 tracks instead of 10
        const tracks = await fetchTracksByGenre(genreToLoad, 30);
        setTotalTracks(tracks.length);
        
        if (tracks.length > 0) {
          setPlaylist(tracks);
          console.log(`Successfully loaded ${tracks.length} tracks for ${genreToLoad}`);
          
          // If trackId is provided, find its index in the playlist
          if (trackId) {
            const index = tracks.findIndex(track => track.id === trackId);
            if (index !== -1) {
              setCurrentIndex(index);
              loadTrack(tracks[index]);
            } else {
              loadTrack(tracks[0]);
            }
          } else {
            loadTrack(tracks[0]);
          }
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error loading tracks:", error);
        setIsLoading(false);
      }
    };

    loadTracks();

    return () => {
      // No need to unload audio here as it's managed globally
    };
  }, [genre, trackId]);

  const loadTrack = async (track: Track) => {
    setIsLoading(true);
    setCurrentTrack(track);
    
    try {
      // Use global audio manager
      await audioManager.loadAndPlayTrack(track.audio, onPlaybackStatusUpdate);
      setIsPlaying(true);
    } catch (err) {
      console.error("Error loading audio", err);
    } finally {
      setIsLoading(false);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying);
      
      // Auto-advance to next track when current one finishes
      if (status.didJustFinish) {
        playNextTrack();
      }
    }
  };

  const togglePlayPause = async () => {
    if (isPlaying) {
      await audioManager.pauseCurrentTrack();
    } else {
      await audioManager.resumeCurrentTrack();
    }
  };

  const onVolumeChange = async (val: number) => {
    setVolume(val);
    // Volume control is not implemented in the audio manager yet
    // We could add it if needed
  };

  const onSliderComplete = async (val: number) => {
    await audioManager.seekCurrentTrack(val);
  };

  const skipForward = async () => {
    playNextTrack();
  };

  const skipBackward = async () => {
    playPreviousTrack();
  };

  const playNextTrack = () => {
    if (playlist.length === 0) return;
    
    const nextIndex = (currentIndex + 1) % playlist.length;
    setCurrentIndex(nextIndex);
    loadTrack(playlist[nextIndex]);
  };

  const playPreviousTrack = () => {
    if (playlist.length === 0) return;
    
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    setCurrentIndex(prevIndex);
    loadTrack(playlist[prevIndex]);
  };

  const formatTime = (millis: number) => {
    const totalSeconds = millis / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  if (isLoading && !currentTrack) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0D9488" />
        <Text style={styles.loadingText}>Loading up to 30 tracks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
      
      {currentTrack ? (
        <>
          <Image 
            source={{ uri: currentTrack.image }} 
            style={styles.image}
            defaultSource={require("../assets/search-page-images/daniel-schludi-mbGxz7pt0jM-unsplash.jpg")}
          />
          <Text style={styles.title}>{currentTrack.name}</Text>
          <Text style={styles.artist}>{currentTrack.artist_name}</Text>
          <Text style={styles.libraryInfo}>Track {currentIndex + 1} of {totalTracks}</Text>

          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration}
            value={position}
            minimumTrackTintColor="#0D9488"
            maximumTrackTintColor="#fff"
            onSlidingComplete={onSliderComplete}
          />

          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity onPress={skipBackward}>
              <Ionicons name="play-back" size={40} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={togglePlayPause}>
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={40}
                color="white"
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={skipForward}>
              <Ionicons name="play-forward" size={40} color="white" />
            </TouchableOpacity>
          </View>

          <Text style={styles.volumeLabel}>Volume</Text>
          <Slider
            style={styles.volumeSlider}
            minimumValue={0}
            maximumValue={1}
            value={volume}
            minimumTrackTintColor="#0D9488"
            maximumTrackTintColor="#fff"
            onSlidingComplete={onVolumeChange}
          />
        </>
      ) : (
        <Text style={styles.errorText}>No track available</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    marginTop: 20,
    fontSize: 16,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  image: {
    width: 250,
    height: 250,
    borderRadius: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
    textAlign: "center",
  },
  artist: {
    fontSize: 16,
    color: "#aaa",
    marginBottom: 20,
    textAlign: "center", 
  },
  errorText: {
    fontSize: 18,
    color: "#ff4f4f",
    textAlign: "center",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  timeText: {
    color: "#fff",
    fontSize: 14,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "80%",
    marginVertical: 20,
  },
  volumeLabel: {
    color: "#fff",
    marginBottom: 10,
    fontSize: 16,
  },
  volumeSlider: {
    width: "100%",
    height: 40,
  },
  libraryInfo: {
    color: "#aaa",
    marginBottom: 20,
    textAlign: "center",
  },
});
