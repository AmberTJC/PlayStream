//
// This file defines the AudioPlayer component.
// It is responsible for playing audio tracks based on the track index passed via navigation.
// The component handles playing, pausing, skipping forward/backward, and adjusting the volume.
// It shows song details including an image, title, and artist as well as a slider for the current song position.

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useRoute, useNavigation } from '@react-navigation/native';

// Reuse the trending assets from SearchPage
const trendingImages = [
  require('../assets/search-page-images/daniel-schludi-mbGxz7pt0jM-unsplash.jpg'),
  require('../assets/search-page-images/ivan-dorofeev-bsLXJsucvxc-unsplash.jpg'),
  require('../assets/search-page-images/victor-rodvang-rbSpGv1wb5M-unsplash.jpg'),
  require('../assets/search-page-images/chad-morehead-AHnmupFDWCc-unsplash.jpg'),
  require('../assets/search-page-images/john-matychuk-gUK3lA3K7Yo-unsplash.jpg'),
  require('../assets/search-page-images/israel-palacio-Y20JJ_ddy9M-unsplash.jpg'),
];

const trendingMusics = [
  require('../assets/Trending musics/dont-talk-315229.mp3'),
  require('../assets/Trending musics/experimental-cinematic-hip-hop-315904.mp3'),
  require('../assets/Trending musics/gardens-stylish-chill-303261.mp3'),
  require('../assets/Trending musics/gorila-315977.mp3'),
  require('../assets/Trending musics/kugelsicher-by-tremoxbeatz-302838.mp3'),
  require('../assets/Trending musics/so-fresh-315255.mp3'),
];

export default function AudioPlayer() {
  const route = useRoute();
  const navigation = useNavigation();
  const { index } = route.params as { index: number };

  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const loadSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(trendingMusics[index], { volume });
        setSound(sound);
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          setDuration(status.durationMillis || 0);
        }
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            setPosition(status.positionMillis);
            setIsPlaying(status.isPlaying);
          }
        });
        await sound.playAsync();
      } catch (err) {
        console.error("Error loading audio", err);
      }
    };

    loadSound();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const togglePlayPause = async () => {
    if (!sound) return;
    const status = await sound.getStatusAsync();
    if (status.isLoaded && status.isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  const onVolumeChange = async (val: number) => {
    setVolume(val);
    if (sound) {
      await sound.setVolumeAsync(val);
    }
  };

  const onSliderComplete = async (val: number) => {
    if (sound) {
      await sound.setPositionAsync(val);
    }
  };

  const skipForward = async () => {
    if (sound) {
      let newPosition = position + 15000;
      if (newPosition > duration) newPosition = duration;
      await sound.setPositionAsync(newPosition);
    }
  };

  const skipBackward = async () => {
    if (sound) {
      let newPosition = position - 15000;
      if (newPosition < 0) newPosition = 0;
      await sound.setPositionAsync(newPosition);
    }
  };

  const formatTime = (millis: number) => {
    const totalSeconds = millis / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
      <Image source={trendingImages[index]} style={styles.image} />
      <Text style={styles.title}>Song Title {index + 1}</Text>
      <Text style={styles.artist}>Artist Name</Text>

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
          <Ionicons name={isPlaying ? "pause" : "play"} size={40} color="white" />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
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
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  artist: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 20,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  timeText: {
    color: '#fff',
    fontSize: 14,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '80%',
    marginVertical: 20,
  },
  volumeLabel: {
    color: '#fff',
    marginBottom: 10,
    fontSize: 16,
  },
  volumeSlider: {
    width: '100%',
    height: 40,
  },
});