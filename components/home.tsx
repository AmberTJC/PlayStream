import React, { useState, useEffect } from 'react';
import {
  Image, ScrollView, Modal, TextInput, Alert, StyleSheet,
  TouchableOpacity, View, ActivityIndicator
} from 'react-native';
import {
  Layout, Text, Button, useTheme, Input,
} from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { fetchPlaylistTracks, fetchPopularTrack, Track } from '../services/musicService';

interface HomePageProps {
  setActiveTab?: (tab: string) => void;
  isDarkMode: boolean;
}

const playlists = [
  { name: 'Favourites', image: require('../assets/home-images/favs.jpg') },
  { name: 'Chill Vibes', image: require('../assets/home-images/chill vibes.png') },
  { name: 'Pop Hits', image: require('../assets/home-images/acoustics.jpg') },
  { name: 'Oldies', image: require('../assets/home-images/Billy Joel.jpg') },
  { name: 'Party Music', image: require('../assets/home-images/party music.jpg') },
  { name: 'Country Vibes', image: require('../assets/home-images/country vibes.jpg') },
];

export default function HomePage({ isDarkMode }: HomePageProps) {
  const theme = useTheme();
  const musicPlayerBg = isDarkMode ? '#1F2937' : '#A7F3D0';

  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('Surush');
  const [lastName, setLastName] = useState('Azaryun');
  const [email, setEmail] = useState('Surush.Az@gmail.com');
  const [dob, setDob] = useState('2001-07-01');
  const [password, setPassword] = useState('password');

  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    return () => {
      if (sound) sound.unloadAsync();
    };
  }, []);

  const playTrack = async (track: Track) => {
    try {
      if (sound) await sound.unloadAsync();
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: track.audio },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );
      setCurrentTrack(track);
      setSound(newSound);
      setIsPlaying(true);
    } catch (error) {
      console.error("Error playing track:", error);
      Alert.alert("Playback error", "Unable to play selected track.");
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
      if (status.didJustFinish) skipTrack();
    }
  };

  const skipTrack = async () => {
    setIsLoading(true);
    try {
      const track = await fetchPopularTrack();
      if (track) await playTrack(track);
      else Alert.alert("Error", "No more tracks available");
    } catch (error) {
      console.error("Skip error:", error);
      Alert.alert("Error", "Couldn't load next track.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayPause = async () => {
    if (!sound) {
      const track = await fetchPopularTrack();
      if (track) await playTrack(track);
      return;
    }

    const status = await sound.getStatusAsync();
    if (status.isLoaded) {
      if (status.isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    }
  };

  const handlePlaylistPress = async (playlistName: string) => {
    setIsLoading(true);
    try {
      const tracks = await fetchPlaylistTracks(playlistName);
      if (tracks.length > 0) {
        await playTrack(tracks[0]);
      } else {
        Alert.alert("No tracks", `No songs found for "${playlistName}".`);
      }
    } catch (error) {
      console.error("Playlist load error:", error);
      Alert.alert("Error", "Failed to load playlist.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera access is needed.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!result.canceled && result.assets?.length) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleChooseFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Photo library access is needed.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!result.canceled && result.assets?.length) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSaveProfile = () => {
    setEditMode(false);
    setProfileModalVisible(false);
  };

  return (
    <Layout style={{ flex: 1 }} level="1">
      {/* HEADER */}
      <Layout style={styles.header}>
        <TouchableOpacity onPress={() => setProfileModalVisible(true)} style={styles.profileButton}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileIcon} />
          ) : (
            <Ionicons name="person-circle" size={40} color="#fff" />
          )}
        </TouchableOpacity>
        <Text category="h4" style={styles.headerText}>PlayStream</Text>
        <Layout style={{ width: 40 }} />
      </Layout>

      {/* MUSIC PLAYER */}
      <Layout style={[styles.musicPlayer, { backgroundColor: musicPlayerBg }]}>
        <Text style={styles.nowPlayingText}>
          {currentTrack ? currentTrack.name : 'Press Play to Load Track'}
        </Text>
        <Text style={styles.artistText}>
          {currentTrack ? currentTrack.artist_name : 'Stream music'}
        </Text>
        <Layout style={styles.controls}>
          <TouchableOpacity onPress={skipTrack} disabled={isLoading}>
            <Ionicons name="play-back" size={30} color={isLoading ? "#75918E" : "#0D9488"} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={togglePlayPause}
            style={[styles.playButton, isLoading && styles.disabledButton]}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name={isPlaying ? "pause" : "play"} size={40} color="#fff" />
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={skipTrack} disabled={isLoading}>
            <Ionicons name="play-forward" size={30} color={isLoading ? "#75918E" : "#0D9488"} />
          </TouchableOpacity>
        </Layout>
      </Layout>

      {/* PLAYLISTS */}
      <Layout style={styles.playlistsContainer}>
        <Text style={styles.sectionTitle}>My Playlists</Text>
        <ScrollView contentContainerStyle={styles.playlistsGrid}>
          {playlists.map((playlist) => (
            <TouchableOpacity
              key={playlist.name}
              onPress={() => handlePlaylistPress(playlist.name)}
              style={styles.playlistItem}
            >
              <Image source={playlist.image} style={styles.playlistImage} />
              <Text style={styles.playlistText}>{playlist.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Layout>

      {/* Profile Modal*/}
      <Modal visible={profileModalVisible} animationType="slide" transparent>
        <Layout style={styles.modalOverlay}>
          <Layout style={[styles.modalContent]} level="1">
            <Text style={styles.modalTitle}>User Profile</Text>
            <Button style={styles.modalClose} appearance="ghost" onPress={() => {
              setProfileModalVisible(false);
              setEditMode(false);
            }}>
              <Ionicons name="close" size={24} color="#fff" />
            </Button>
            {editMode ? (
              <>
                <Layout style={styles.profileImageContainer}>
                  {profileImage ? (
                    <Image source={{ uri: profileImage }} style={styles.profileImagePreview} />
                  ) : (
                    <Ionicons name="person-circle" size={100} color="#ccc" />
                  )}
                </Layout>
                <Layout style={styles.imageOptions}>
                  <Button onPress={handleTakePhoto} accessoryLeft={() => <Ionicons name="camera" size={20} color="#fff" />}>Camera</Button>
                  <Button onPress={handleChooseFromLibrary} accessoryLeft={() => <Ionicons name="images" size={20} color="#fff" />}>Gallery</Button>
                </Layout>
                <Input placeholder="First Name" value={firstName} onChangeText={setFirstName} style={styles.input} />
                <Input placeholder="Last Name" value={lastName} onChangeText={setLastName} style={styles.input} />
                <Input placeholder="Email" keyboardType="email-address" value={email} onChangeText={setEmail} style={styles.input} />
                <Input placeholder="Date of Birth (YYYY-MM-DD)" value={dob} onChangeText={setDob} style={styles.input} />
                <Input placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />
                <Button onPress={handleSaveProfile}>Save</Button>
              </>
            ) : (
              <>
                <Layout style={styles.profileImageContainer}>
                  {profileImage ? (
                    <Image source={{ uri: profileImage }} style={styles.profileImagePreview} />
                  ) : (
                    <Ionicons name="person-circle" size={100} color="#ccc" />
                  )}
                </Layout>
                <Layout style={styles.infoContainer}>
                  <Text style={styles.infoText}>First Name: {firstName}</Text>
                  <Text style={styles.infoText}>Last Name: {lastName}</Text>
                  <Text style={styles.infoText}>Email: {email}</Text>
                  <Text style={styles.infoText}>DOB: {dob}</Text>
                  <Text style={styles.infoText}>Password: ******</Text>
                </Layout>
                <Button onPress={() => setEditMode(true)}>Edit Profile</Button>
              </>
            )}
          </Layout>
        </Layout>
      </Modal>
    </Layout>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    backgroundColor: '#0D9488',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileButton: {
    backgroundColor: 'transparent',
    borderRadius: 20,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerText: {
    color: '#fff',
    fontWeight: '700',
  },
  musicPlayer: {
    alignItems: 'center',
    backgroundColor: '#1F2937',
    padding: 30,
    marginHorizontal: 20,
    marginTop: 25,
    borderRadius: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  playButton: {
    backgroundColor: '#0D9488',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  playlistsContainer: {
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#0D9488',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 12,
  },
  playlistsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  playlistItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 20,
  },
  playlistImage: {
    width: 85,
    height: 85,
    borderRadius: 10,
    marginBottom: 5,
  },
  playlistText: {
   
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    width: '90%',
    borderRadius: 12,
    padding: 25,
    position: 'relative',
    alignItems: 'stretch',
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: '#fff',
  },
  modalClose: {
    position: 'absolute',
    right: 20,
    top: 10,
  },
  profileImageContainer: {
    alignSelf: 'center',
    marginVertical: 20,
  },
  profileImagePreview: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  imageOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  infoContainer: {
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 6,
    
  },
  input: {
    marginBottom: 12,
  },
  nowPlayingText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  artistText: {
    fontSize: 16,
    marginBottom: 15,
    opacity: 0.8,
  },
  disabledButton: {
    backgroundColor: '#75918E',
  },
});
