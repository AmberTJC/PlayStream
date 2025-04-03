import React, { useState } from 'react';
import { 
  View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, 
  Modal, TextInput, Button, Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

interface HomePageProps {
  setActiveTab?: (tab: string) => void;
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
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Form state for profile info  
  const [firstName, setFirstName] = useState('Surush');
  const [lastName, setLastName] = useState('Azaryun');
  const [email, setEmail] = useState('Surush.Az@gmail.com');
  const [dob, setDob] = useState('2001-07-01');
  const [password, setPassword] = useState('password');

  // Handler to take photo from camera  
  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera permissions are required to take a photo.');
      return;
    }
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled && result.assets?.length) {
      console.log('Image captured:', result.assets[0].uri);
      setProfileImage(result.assets[0].uri);
    }
  };

  // Handler to choose image from photo library  
  const handleChooseFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Media library permissions are required to choose a photo.');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled && result.assets?.length) {
      console.log('Image selected:', result.assets[0].uri);
      setProfileImage(result.assets[0].uri);
    }
  };

  // Handler to save changes and exit edit mode  
  const handleSaveProfile = () => {
    // Optionally save your data to a backend here  
    setEditMode(false);
    setProfileModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => setProfileModalVisible(true)} 
          style={styles.accountIconContainer}
        >
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileIcon} />
          ) : (
            <Ionicons name="person-circle" size={40} color="#fff" />
          )}
        </TouchableOpacity>
        <Text style={styles.headerText}>PlayStream</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Music Player */}
      <View style={styles.musicPlayer}>
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

      {/* Profile Modal */}
      <Modal visible={profileModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>User Profile</Text>
            <TouchableOpacity 
              onPress={() => { setProfileModalVisible(false); setEditMode(false); }}
              style={styles.modalClose}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            {editMode ? (
              <>
                <View style={styles.profileImageContainer}>
                  {profileImage ? (
                    <Image source={{ uri: profileImage }} style={styles.profileImagePreview} />
                  ) : (
                    <Ionicons name="person-circle" size={100} color="#ccc" />
                  )}
                </View>
                <View style={styles.imageOptions}>
                  <TouchableOpacity onPress={handleTakePhoto} style={styles.imageOptionButton}>
                    <Ionicons name="camera" size={28} color="#fff" />
                    <Text style={styles.imageOptionText}>Camera</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleChooseFromLibrary} style={styles.imageOptionButton}>
                    <Ionicons name="images" size={28} color="#fff" />
                    <Text style={styles.imageOptionText}>Gallery</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  placeholder="First Name"
                  placeholderTextColor="#bbb"
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                />
                <TextInput
                  placeholder="Last Name"
                  placeholderTextColor="#bbb"
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                />
                <TextInput
                  placeholder="Email"
                  placeholderTextColor="#bbb"
                  style={styles.input}
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
                <TextInput
                  placeholder="Date of Birth (YYYY-MM-DD)"
                  placeholderTextColor="#bbb"
                  style={styles.input}
                  value={dob}
                  onChangeText={setDob}
                />
                <TextInput
                  placeholder="Password"
                  placeholderTextColor="#bbb"
                  style={styles.input}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
                <Button title="Save" onPress={handleSaveProfile} color="#0D9488" />
              </>
            ) : (
              <>
                <View style={styles.profileImageContainer}>
                  {profileImage ? (
                    <Image source={{ uri: profileImage }} style={styles.profileImagePreview} />
                  ) : (
                    <Ionicons name="person-circle" size={100} color="#ccc" />
                  )}
                </View>
                <View style={styles.infoContainer}>
                  <Text style={styles.infoText}>First Name: {firstName}</Text>
                  <Text style={styles.infoText}>Last Name: {lastName}</Text>
                  <Text style={styles.infoText}>Email: {email}</Text>
                  <Text style={styles.infoText}>DOB: {dob}</Text>
                  <Text style={styles.infoText}>Password: ******</Text>
                </View>
                <Button title="Edit Profile" onPress={() => setEditMode(true)} color="#0D9488" />
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    backgroundColor: '#0D9488',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  musicPlayer: {
    alignItems: 'center',
    backgroundColor: '#1F2937',
    padding: 30,
    marginHorizontal: 20,
    marginTop: 25,
    borderRadius: 12,
    elevation: 3,
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
    color: '#fff',
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
    top: 20,
  },
  profileImageContainer: {
    alignSelf: 'center',
    marginTop: 30,
    marginBottom: 20,
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
  imageOptionButton: {
    backgroundColor: '#0D9488',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  imageOptionText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 6,
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#555',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 14,
    fontSize: 16,
    color: '#fff',
  },
});



