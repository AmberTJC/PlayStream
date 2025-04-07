import React, { useState, useRef, useEffect } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Layout,
  Text,
  Input,
  useTheme,
} from "@ui-kitten/components";
import { searchTracks, fetchTracksByGenre, Track } from "../services/musicService";

const deviceWidth = Dimensions.get("window").width;

interface TrendingCardProps {
  track: Track;
  onPress: () => void;
  isPlaying: boolean;
}

interface CategoryCardProps {
  category: string;
  image: any;
  index: number;
  onPress: () => void;
}

// Reuse category images from existing code
const categories = ["Trending", "Rock", "Chill", "Electronic", "Jazz", "Acoustic"];
const categoryImages = [
  require("../assets/search-page-images/thomas-kelley-2ZWCDBuw1B8-unsplash.jpg"),
  require("../assets/search-page-images/hanny-naibaho-aWXVxy8BSzc-unsplash.jpg"),
  require("../assets/search-page-images/adrian-korte-5gn2soeAc40-unsplash.jpg"),
  require("../assets/search-page-images/nainoa-shizuru-NcdG9mK3PBY-unsplash.jpg"),
  require("../assets/search-page-images/wes-hicks-MEL-jJnm7RQ-unsplash.jpg"),
  require("../assets/search-page-images/marcela-laskoski-YrtFlrLo2DQ-unsplash.jpg"),
];

const gradientColors: [string, string][] = [
  ["#ff7e5f", "#feb47b"],
  ["#86A8E7", "#91EAE4"],
  ["#D299C2", "#F2C94C"],
  ["#C6FFDD", "#FBD786"],
  ["#a18cd1", "#fbc2eb"],
  ["#FF9A9E", "#FECFEF"],
];

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function SearchPage({ isDarkMode }: { isDarkMode: boolean }) {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [trendingTracks, setTrendingTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const theme = useTheme();

  // Fetch trending tracks on load
  useEffect(() => {
    const loadTrendingTracks = async () => {
      setIsLoading(true);
      try {
        const tracks = await fetchTracksByGenre('trending', 6);
        setTrendingTracks(tracks);
      } catch (error) {
        console.error('Error loading trending tracks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTrendingTracks();

    // Cleanup sound on unmount
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const results = await searchTracks(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching tracks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAudioToggle = async (track: Track) => {
    // Stop current track if playing
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
      
      // If toggling the same track, just stop playback
      if (playingTrackId === track.id) {
        setPlayingTrackId(null);
        return;
      }
    }
    
    // Play new track
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: track.audio },
        { shouldPlay: true }
      );
      
      setSound(newSound);
      setPlayingTrackId(track.id);
      
      // Set up status update handler
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingTrackId(null);
        }
      });
    } catch (error) {
      console.error('Error playing track:', error);
    }
  };

  const handleCategoryPress = async (category: string) => {
    setIsLoading(true);
    try {
      const tracks = await fetchTracksByGenre(category.toLowerCase(), 10);
      setSearchResults(tracks);
      setSearchQuery(category); // Update search query to match selected category
    } catch (error) {
      console.error(`Error loading ${category} tracks:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout style={{ flex: 1 }} level="1">
      <ScrollView
        contentContainerStyle={{
          padding: 16,
        }}
      >
        <Layout style={styles.searchBarContainer} level="2">
          <Ionicons name="search" size={24} color={isDarkMode ? '#ccc' : '#333'} style={styles.searchIcon} />
          <Input
            placeholder="Search for music..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ flex: 1 }}
            placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
            status="basic"
            onSubmitEditing={handleSearch}
          />
        </Layout>

        {isLoading && (
          <Layout style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0D9488" />
          </Layout>
        )}

        {searchResults.length > 0 ? (
          <Layout>
            <Text style={styles.sectionTitle}>Search Results</Text>
            <Layout style={styles.tracksGrid}>
              {searchResults.map(track => (
                <TrackCard
                  key={track.id}
                  track={track}
                  onPress={() => handleAudioToggle(track)}
                  isPlaying={playingTrackId === track.id}
                />
              ))}
            </Layout>
          </Layout>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Trending Now</Text>
            {trendingTracks.length > 0 ? (
              <Layout style={styles.tracksGrid}>
                {trendingTracks.map(track => (
                  <TrackCard
                    key={track.id}
                    track={track}
                    onPress={() => handleAudioToggle(track)}
                    isPlaying={playingTrackId === track.id}
                  />
                ))}
              </Layout>
            ) : (
              <Text appearance="hint" style={styles.emptyMessage}>
                No trending tracks available. Try searching instead.
              </Text>
            )}

            <Text style={styles.sectionTitle}>Categories</Text>
            <Layout style={styles.categoriesList}>
              {categories.map((cat, index) => (
                <CategoryCard
                  key={cat}
                  category={cat}
                  index={index}
                  image={categoryImages[index]}
                  onPress={() => handleCategoryPress(cat)}
                />
              ))}
            </Layout>
          </>
        )}
      </ScrollView>
    </Layout>
  );
}

function TrackCard({ track, onPress, isPlaying }: TrendingCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <AnimatedTouchable
      onPressIn={() => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}
      onPress={onPress}
      style={{ transform: [{ scale }], marginBottom: 16 }}
    >
      <Layout style={styles.trackItemContainer}>
        <Image 
          source={{ uri: track.image }} 
          style={styles.trackImage} 
          defaultSource={require("../assets/search-page-images/daniel-schludi-mbGxz7pt0jM-unsplash.jpg")}
        />
        <Layout style={styles.trackTextContainer}>
          <Text style={styles.trackTitle} numberOfLines={1}>{track.name}</Text>
          <Text style={styles.trackArtist} numberOfLines={1}>{track.artist_name}</Text>
        </Layout>
        <Layout style={styles.trackIconOverlay}>
          <Ionicons name={isPlaying ? 'pause-circle' : 'play-circle'} size={36} color="#FF9800" />
        </Layout>
      </Layout>
    </AnimatedTouchable>
  );
}

function CategoryCard({ category, image, index, onPress }: CategoryCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <AnimatedTouchable
      onPressIn={() => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}
      onPress={onPress}
      style={{ transform: [{ scale }], marginBottom: 16 }}
    >
      <LinearGradient
        colors={gradientColors[index % gradientColors.length]}
        style={styles.categoryCard}
      >
        <Image source={image} style={styles.categoryCardImage} />
        <Text style={styles.categoryCardText}>{category}</Text>
      </LinearGradient>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 20,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  sectionTitle: {
    color: '#0D9488',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 20,
  },
  tracksGrid: {
    flexDirection: "column",
  },
  trackItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  trackImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
  },
  trackTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  trackArtist: {
    fontSize: 14,
    opacity: 0.7,
  },
  trackIconOverlay: {
    marginLeft: 'auto',
  },
  emptyMessage: {
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
  },
  categoriesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  categoryCard: {
    width: deviceWidth / 2 - 24,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  categoryCardImage: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  categoryCardText: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
}); 