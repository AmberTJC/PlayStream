import React, { useState, useRef, useEffect } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  View,
  ImageBackground,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Layout,
  Text,
  Input,
  Button,
  Card,
} from "@ui-kitten/components";

const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;

// REDESIGNED VERSION WITH MATCHING COLORS
console.log("REDESIGNED VERSION WITH MATCHING APP COLORS LOADED");

interface TrendingCardProps {
  image: any;
  index: number;
  onPress: () => void;
  isPlaying: boolean;
}

interface CategoryCardProps {
  category: string;
  image: any;
  index: number;
  onPress: () => void;
}

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

const categories = ["Trending", "Classic", "Chill", "Salsa", "Newest", "Country"];
const categoryImages = [
  require("../assets/search-page-images/thomas-kelley-2ZWCDBuw1B8-unsplash.jpg"),
  require("../assets/search-page-images/hanny-naibaho-aWXVxy8BSzc-unsplash.jpg"),
  require("../assets/search-page-images/adrian-korte-5gn2soeAc40-unsplash.jpg"),
  require("../assets/search-page-images/nainoa-shizuru-NcdG9mK3PBY-unsplash.jpg"),
  require("../assets/search-page-images/wes-hicks-MEL-jJnm7RQ-unsplash.jpg"),
  require("../assets/search-page-images/marcela-laskoski-YrtFlrLo2DQ-unsplash.jpg"),
];

const tealGradients: [string, string][] = [
  ["#0D9488", "#14B8A6"],
  ["#0F766E", "#0D9488"],
  ["#14B8A6", "#2DD4BF"],
  ["#0D9488", "#0F766E"],
  ["#0E7490", "#0891B2"],
  ["#06B6D4", "#22D3EE"],
];

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function SearchPage({ isDarkMode }: { isDarkMode: boolean }) {
  const navigation = useNavigation<NavigationProp<{ Category: { category: string } }>>();
  const [searchQuery, setSearchQuery] = useState('');
  const [soundObjects, setSoundObjects] = useState<{ [key: number]: Audio.Sound }>({});
  const [audioStatus, setAudioStatus] = useState<{ [key: number]: 'hidden' | 'play' | 'stop' }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Trending");
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  useEffect(() => {
    // Start animations on load
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleAudioToggle = async (index: number) => {
    setIsLoading(true);
    
    for (const key in soundObjects) {
      const keyNum = parseInt(key);
      if (keyNum !== index && audioStatus[keyNum] === 'play') {
        await soundObjects[keyNum]?.stopAsync();
        await soundObjects[keyNum]?.unloadAsync();
        setSoundObjects(prev => {
          const copy = { ...prev };
          delete copy[keyNum];
          return copy;
        });
        setAudioStatus(prev => ({ ...prev, [keyNum]: 'hidden' }));
      }
    }

    const current = audioStatus[index] || 'hidden';
    if (current === 'hidden' || current === 'stop') {
      const { sound } = await Audio.Sound.createAsync(trendingMusics[index]);
      await sound.playAsync();
      setSoundObjects(prev => ({ ...prev, [index]: sound }));
      setAudioStatus(prev => ({ ...prev, [index]: 'play' }));
    } else {
      const sound = soundObjects[index];
      await sound.stopAsync();
      await sound.unloadAsync();
      setSoundObjects(prev => {
        const copy = { ...prev };
        delete copy[index];
        return copy;
      });
      setAudioStatus(prev => ({ ...prev, [index]: 'hidden' }));
    }
    
    setIsLoading(false);
  };

  const handleCategoryPress = (category: string) => {
    setActiveCategory(category);
    navigation.navigate('Category', { category });
  };

  const filteredCategories = categories.filter(cat =>
    cat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0D9488" />
      <View style={styles.container}>
        {/* Big Logo Banner */}
        <View style={styles.logoBanner}>
          <Text style={styles.logoText}>PLAYSTREAM</Text>
        </View>
        
        {/* Search Container */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={24} color="white" style={styles.searchIcon} />
            <Input
              placeholder="Find your music..."
              placeholderTextColor="rgba(255,255,255,0.7)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              size="large"
              status="control"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={24} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {/* Category Chips */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryChipsContainer}
          contentContainerStyle={styles.categoryChipsContent}
        >
          {categories.map((category) => (
            <TouchableOpacity 
              key={category}
              onPress={() => handleCategoryPress(category)}
              style={[
                styles.categoryChip,
                activeCategory === category && styles.categoryChipActive
              ]}
            >
              <Text style={styles.categoryChipText}>{category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>Loading amazing music...</Text>
          </View>
        ) : (
          <Animated.ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}
          >
            {searchQuery.trim() !== '' ? (
              <View style={styles.resultsContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Search Results</Text>
                  <View style={styles.resultCountContainer}>
                    <Text style={styles.resultCountText}>{filteredCategories.length}</Text>
                  </View>
                </View>
                
                <View style={styles.resultsGrid}>
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map(cat => {
                      const index = categories.indexOf(cat);
                      return (
                        <CategoryCard
                          key={cat}
                          category={cat}
                          index={index}
                          image={categoryImages[index]}
                          onPress={() => navigation.navigate('Category', { category: cat })}
                        />
                      );
                    })
                  ) : (
                    <View style={styles.emptyContainer}>
                      <Ionicons name="musical-notes" size={40} color="rgba(255,255,255,0.4)" />
                      <Text style={styles.emptyText}>
                        No matching categories found.
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ) : (
              <>
                {/* Featured Track */}
                <View style={styles.featuredContainer}>
                  <Text style={styles.sectionTitle}>Featured</Text>
                  <ImageBackground 
                    source={trendingImages[0]}
                    style={styles.featuredCard}
                    imageStyle={styles.featuredCardImage}
                  >
                    <LinearGradient
                      colors={['transparent', 'rgba(213,0,0,0.9)']}
                      style={styles.featuredGradient}
                    >
                      <View style={styles.featuredContent}>
                        <Text style={styles.featuredTitle}>Featured Track</Text>
                        <Text style={styles.featuredArtist}>PlayStream Selection</Text>
                        <TouchableOpacity 
                          style={styles.featuredPlayButton}
                          onPress={() => handleAudioToggle(0)}
                        >
                          <Ionicons 
                            name={audioStatus[0] === 'play' ? 'pause' : 'play'} 
                            size={24} 
                            color="#0D9488" 
                          />
                          <Text style={styles.featuredPlayText}>
                            {audioStatus[0] === 'play' ? 'PAUSE' : 'PLAY'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </LinearGradient>
                  </ImageBackground>
                </View>

                {/* Trending Tracks */}
                <View style={styles.trendingContainer}>
                  <Text style={styles.sectionTitle}>Trending Now</Text>
                  <View style={styles.trendingGrid}>
                    {trendingImages.slice(1).map((image, index) => (
                      <TrendingCard
                        key={index + 1}
                        image={image}
                        index={index + 1}
                        onPress={() => handleAudioToggle(index + 1)}
                        isPlaying={audioStatus[index + 1] === 'play'}
                      />
                    ))}
                  </View>
                </View>

                {/* Genres Grid */}
                <View style={styles.genresContainer}>
                  <Text style={styles.sectionTitle}>Explore Genres</Text>
                  <View style={styles.categoriesList}>
                    {categories.map((cat, index) => (
                      <CategoryCard
                        key={cat}
                        category={cat}
                        index={index}
                        image={categoryImages[index]}
                        onPress={() => navigation.navigate('Category', { category: cat })}
                      />
                    ))}
                  </View>
                </View>
              </>
            )}
          </Animated.ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

function TrendingCard({ image, index, onPress, isPlaying }: TrendingCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <AnimatedTouchable
      onPressIn={() => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}
      onPress={onPress}
      style={[
        { transform: [{ scale }] },
        styles.trackCardTouchable
      ]}
    >
      <LinearGradient
        colors={['#1F2937', '#111827']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.trackItemContainer}
      >
        <Image source={image} style={styles.trackImage} />
        <View style={styles.trackTextContainer}>
          <Text style={styles.trackTitle} numberOfLines={1}>Trending Track {index}</Text>
          <Text style={styles.trackArtist} numberOfLines={1}>PlayStream Artist</Text>
        </View>
        <View style={styles.trackIconContainer}>
          <View style={[styles.playButton, isPlaying ? styles.playButtonActive : null]}>
            <Ionicons 
              name={isPlaying ? 'pause' : 'play'} 
              size={20} 
              color="#fff" 
            />
          </View>
        </View>
      </LinearGradient>
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
      style={[
        { transform: [{ scale }] },
        styles.categoryCardTouchable
      ]}
    >
      <LinearGradient
        colors={tealGradients[index % tealGradients.length]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.categoryCard}
      >
        <Image source={image} style={styles.categoryCardImage} />
        <View style={styles.categoryOverlay}>
          <Text style={styles.categoryCardText}>{category}</Text>
        </View>
      </LinearGradient>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#111827',
  },
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  logoBanner: {
    backgroundColor: '#0D9488',
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 3,
  },
  searchContainer: {
    backgroundColor: '#0D9488',
    padding: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 30,
    padding: 5,
  },
  searchIcon: {
    marginLeft: 12,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    color: 'white',
  },
  clearButton: {
    padding: 8,
  },
  categoryChipsContainer: {
    maxHeight: 50,
    backgroundColor: '#121212',
  },
  categoryChipsContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  categoryChipActive: {
    backgroundColor: '#0D9488',
  },
  categoryChipText: {
    color: 'white',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 16,
    fontSize: 16,
  },
  scrollContainer: {
    padding: 16,
  },
  resultsContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#0D9488',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  resultCountContainer: {
    backgroundColor: '#0D9488',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  resultCountText: {
    color: 'white',
    fontWeight: 'bold',
  },
  featuredContainer: {
    marginBottom: 24,
  },
  featuredCard: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 12,
  },
  featuredCardImage: {
    borderRadius: 16,
  },
  featuredGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    justifyContent: 'flex-end',
  },
  featuredContent: {
    padding: 16,
  },
  featuredTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  featuredArtist: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    marginBottom: 16,
  },
  featuredPlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
    alignSelf: 'flex-start',
  },
  featuredPlayText: {
    color: '#0D9488',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  trendingContainer: {
    marginBottom: 24,
  },
  genresContainer: {
    marginBottom: 24,
  },
  trendingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  resultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  trackCardTouchable: {
    width: deviceWidth / 2 - 24,
    marginBottom: 12,
  },
  trackItemContainer: {
    flexDirection: 'column',
    padding: 12,
    borderRadius: 12,
    overflow: 'hidden',
    height: 180,
  },
  trackImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  trackTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: 'white',
  },
  trackArtist: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  trackIconContainer: {
    position: 'absolute',
    top: 76,
    right: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 40, 
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonActive: {
    backgroundColor: '#FF9800',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    marginTop: 12,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 12,
  },
  categoriesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  categoryCardTouchable: {
    width: deviceWidth / 2 - 24,
    marginBottom: 16,
  },
  categoryCard: {
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  categoryCardImage: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  categoryOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  categoryCardText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
