import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useNavigation, NavigationProp } from '@react-navigation/native';

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

const categoryImages = [
  require('../assets/search-page-images/thomas-kelley-2ZWCDBuw1B8-unsplash.jpg'),
  require('../assets/search-page-images/hanny-naibaho-aWXVxy8BSzc-unsplash.jpg'),
  require('../assets/search-page-images/adrian-korte-5gn2soeAc40-unsplash.jpg'),
  require('../assets/search-page-images/nainoa-shizuru-NcdG9mK3PBY-unsplash.jpg'),
  require('../assets/search-page-images/wes-hicks-MEL-jJnm7RQ-unsplash.jpg'),
  require('../assets/search-page-images/marcela-laskoski-YrtFlrLo2DQ-unsplash.jpg'),
];

const categories = ['Trending', 'Classic', 'Chill', 'Salsa', 'Newest', 'Country'];

type RootStackParamList = {
  Category: { category: string };
};

export default function SearchPage() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  // State to manage sound objects keyed by trending index
  const [soundObjects, setSoundObjects] = useState<{ [key: number]: Audio.Sound }>({});
  // Manage the UI overlay status for each trending image
  const [audioStatus, setAudioStatus] = useState<{ [key: number]: 'hidden' | 'play' | 'stop' }>({});

  const handleAudioToggle = async (index: number) => {
    // Ensure only one audio plays at a time
    for (const key in soundObjects) {
      const keyNum = parseInt(key);
      if (keyNum !== index && audioStatus[keyNum] === 'play') {
        try {
          await soundObjects[keyNum].stopAsync();
          await soundObjects[keyNum].unloadAsync();
          setSoundObjects(prev => {
            const newState = { ...prev };
            delete newState[keyNum];
            return newState;
          });
          setAudioStatus(prev => ({ ...prev, [keyNum]: 'hidden' }));
        } catch (error) {
          console.error(`Error stopping sound at index ${keyNum}:`, error);
        }
      }
    }

    const currentStatus = audioStatus[index] || 'hidden';

    if (currentStatus === 'hidden' || currentStatus === 'stop') {
      try {
        const { sound } = await Audio.Sound.createAsync(trendingMusics[index]);
        await sound.playAsync();
        setSoundObjects(prev => ({ ...prev, [index]: sound }));
        setAudioStatus(prev => ({ ...prev, [index]: 'play' }));
      } catch (error) {
        console.error('Error playing sound:', error);
      }
    } else if (currentStatus === 'play') {
      try {
        const sound = soundObjects[index];
        if (sound) {
          await sound.stopAsync();
          await sound.unloadAsync();
          setSoundObjects(prev => {
            const newState = { ...prev };
            delete newState[index];
            return newState;
          });
        }
        setAudioStatus(prev => ({ ...prev, [index]: 'hidden' }));
      } catch (error) {
        console.error('Error stopping sound:', error);
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Redesigned search bar */}
      <View style={styles.searchBarContainer}>
        <Ionicons name="search" size={24} color="#ccc" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for music..."
          placeholderTextColor="#ccc"
        />
      </View>

      {/* Trending Section */}
      <Text style={styles.sectionTitle}>Trending Now</Text>
      <View style={styles.trendingGrid}>
        {trendingImages.map((image, index) => {
          const status = audioStatus[index] || 'hidden';
          return (
            <TouchableOpacity
              key={index}
              style={styles.trendingItem}
              onPress={() => handleAudioToggle(index)}
            >
              <Image source={image} style={styles.trendingImage} />
              {status !== 'hidden' && (
                <View style={styles.overlayIcon}>
                  {status === 'play' ? (
                    <Ionicons name="play-circle" size={32} color="#FF9800" />
                  ) : (
                    <Ionicons name="stop-circle" size={32} color="#F44336" />
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Categories Section */}
      <Text style={styles.sectionTitle}>All Categories</Text>
      <View style={styles.categoriesGrid}>
        {categories.map((category, index) => (
          <TouchableOpacity
            key={category}
            style={styles.categoryItem}
            onPress={() => navigation.navigate('Category', { category })}
          >
            <Image source={categoryImages[index]} style={styles.categoryImage} />
            <Text style={styles.categoryText}>{category}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF9800',
    marginVertical: 10,
  },
  trendingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  trendingItem: {
    width: '48%',
    aspectRatio: 1,
    marginBottom: 16,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#1f1f1f',
  },
  trendingImage: {
    width: '100%',
    height: '100%',
  },
  overlayIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -16 }, { translateY: -16 }],
    opacity: 0.9,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  categoryItem: {
    width: '30%',
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 10,
  },
  categoryImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginBottom: 6,
  },
  categoryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});