import React, { useState, useRef } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Layout,
  Text,
  Input,
  useTheme,
} from "@ui-kitten/components";

const deviceWidth = Dimensions.get("window").width;

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
  const navigation = useNavigation<NavigationProp<{ Category: { category: string } }>>();
  const [searchQuery, setSearchQuery] = useState('');
  const [soundObjects, setSoundObjects] = useState<{ [key: number]: Audio.Sound }>({});
  const [audioStatus, setAudioStatus] = useState<{ [key: number]: 'hidden' | 'play' | 'stop' }>({});
  const theme = useTheme();

  const handleAudioToggle = async (index: number) => {
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
  };

  const filteredCategories = categories.filter(cat =>
    cat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout style={{ flex: 1 }} level="1">
  <ScrollView
    contentContainerStyle={{
      padding: 16,
    }}
    >
        <Layout style={styles.searchBarContainer}level="2"
>
          <Ionicons name="search" size={24} color={isDarkMode ? '#ccc' : '#333'} style={styles.searchIcon} />
          <Input
             placeholder="Search for music..."
             value={searchQuery}
             onChangeText={setSearchQuery}
             style={{ flex: 1 }}
             placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
             status="basic"
/>
        </Layout>

        {searchQuery.trim() !== '' ? (
          <Layout>
            <Text style={styles.sectionTitle}>Search Results</Text>
            <Layout style={styles.resultsGrid}>
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
                <Text appearance="hint" style={{ fontStyle: 'italic' }}>
                  No matching categories found.
                </Text>
              )}
            </Layout>
          </Layout>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Trending Now</Text>
            <Layout style={styles.trendingGrid}>
              {trendingImages.map((image, index) => (
                <TrendingCard
                  key={index}
                  image={image}
                  index={index}
                  onPress={() => handleAudioToggle(index)}
                  isPlaying={audioStatus[index] === 'play'}
                />
              ))}
            </Layout>

            <Text style={styles.sectionTitle}>All Categories</Text>
            <Layout style={styles.categoriesList}>
              {categories.map((cat, index) => (
                <CategoryCard
                  key={cat}
                  category={cat}
                  index={index}
                  image={categoryImages[index]}
                  onPress={() => navigation.navigate('Category', { category: cat })}
                />
              ))}
            </Layout>
          </>
        )}
      </ScrollView>
    </Layout>
  );
}

function TrendingCard({ image, index, onPress, isPlaying }: TrendingCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <AnimatedTouchable
      onPressIn={() => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}
      onPress={onPress}
      style={{ transform: [{ scale }], marginBottom: 16 }}
    >
      <Layout style={styles.trendingItemContainer}>
        <Image source={image} style={styles.trendingImage} />
        <Layout style={styles.trendingIconOverlay}>
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
  safeArea: { flex: 1 },
  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
  },
  searchIcon: { marginRight: 8 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginVertical: 12,
    color: "#0D9488",
  },
  trendingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  trendingItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#333",
  },
  trendingImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  trendingIconOverlay: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  categoriesList: {
    flexDirection: "column",
  },
  categoryCard: {
    width: "98%",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 20,
  },
  categoryCardImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  categoryCardText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  searchResults: { marginBottom: 30 },
  resultsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});
