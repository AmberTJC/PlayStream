import React, { useState, useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

const deviceWidth = Dimensions.get("window").width;

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

const categoryImages = [
  require("../assets/search-page-images/thomas-kelley-2ZWCDBuw1B8-unsplash.jpg"),
  require("../assets/search-page-images/hanny-naibaho-aWXVxy8BSzc-unsplash.jpg"),
  require("../assets/search-page-images/adrian-korte-5gn2soeAc40-unsplash.jpg"),
  require("../assets/search-page-images/nainoa-shizuru-NcdG9mK3PBY-unsplash.jpg"),
  require("../assets/search-page-images/wes-hicks-MEL-jJnm7RQ-unsplash.jpg"),
  require("../assets/search-page-images/marcela-laskoski-YrtFlrLo2DQ-unsplash.jpg"),
];

const categories = [
  "Trending",
  "Classic",
  "Chill",
  "Salsa",
  "Newest",
  "Country",
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

// --- Trending Card ---
// Updated TrendingCard component and grid layout:
function TrendingCard({
  image,
  index,
  onPress,
  isPlaying,
}: {
  image: any;
  index: number;
  onPress: () => void;
  isPlaying: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <AnimatedTouchable
      onPressIn={() => {
        Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start();
      }}
      onPressOut={() => {
        Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }).start();
      }}
      onPress={onPress}
      style={{ transform: [{ scale }], marginBottom: 16 }}
    >
      <View style={styles.trendingItemContainer}>
        <Image source={image} style={styles.trendingImage} />
        <View style={styles.trendingIconOverlay}>
          {isPlaying ? (
            <Ionicons name="pause-circle" size={36} color="#FF9800" />
          ) : (
            <Ionicons name="play-circle" size={36} color="#FF9800" />
          )}
        </View>
      </View>
    </AnimatedTouchable>
  );
}

// --- Category Card ---
// Uses a full-width horizontal card with an image on the left and bold text on the right.
function CategoryCard({
  category,
  image,
  index,
  onPress,
}: {
  category: string;
  image: any;
  index: number;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <AnimatedTouchable
      onPressIn={() => {
        Animated.spring(scale, {
          toValue: 0.95,
          useNativeDriver: true,
        }).start();
      }}
      onPressOut={() => {
        Animated.spring(scale, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }).start();
      }}
      onPress={onPress}
      style={{ transform: [{ scale }], marginBottom: 16 }}
    >
      <LinearGradient
        colors={gradientColors[index % gradientColors.length]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.categoryCard}
      >
        <Image source={image} style={styles.categoryCardImage} />
        <Text style={styles.categoryCardText}>{category}</Text>
      </LinearGradient>
    </AnimatedTouchable>
  );
}

export default function SearchPage() {
  const navigation =
    useNavigation<NavigationProp<{ Category: { category: string } }>>();
  const [searchQuery, setSearchQuery] = useState("");
  const [soundObjects, setSoundObjects] = useState<{ [key: number]: Audio.Sound }>({});
  const [audioStatus, setAudioStatus] = useState<{ [key: number]: "hidden" | "play" | "stop" }>({});

  const handleAudioToggle = async (index: number) => {
    // Stop other audios if playing
    for (const key in soundObjects) {
      const keyNum = parseInt(key);
      if (keyNum !== index && audioStatus[keyNum] === "play") {
        try {
          await soundObjects[keyNum].stopAsync();
          await soundObjects[keyNum].unloadAsync();
          setSoundObjects((prev) => {
            const newState = { ...prev };
            delete newState[keyNum];
            return newState;
          });
          setAudioStatus((prev) => ({ ...prev, [keyNum]: "hidden" }));
        } catch (error) {
          console.error(`Error stopping sound at index ${keyNum}:`, error);
        }
      }
    }
    const currentStatus = audioStatus[index] || "hidden";
    if (currentStatus === "hidden" || currentStatus === "stop") {
      try {
        const { sound } = await Audio.Sound.createAsync(trendingMusics[index]);
        await sound.playAsync();
        setSoundObjects((prev) => ({ ...prev, [index]: sound }));
        setAudioStatus((prev) => ({ ...prev, [index]: "play" }));
      } catch (error) {
        console.error("Error playing sound:", error);
      }
    } else if (currentStatus === "play") {
      try {
        const sound = soundObjects[index];
        if (sound) {
          await sound.stopAsync();
          await sound.unloadAsync();
          setSoundObjects((prev) => {
            const newState = { ...prev };
            delete newState[index];
            return newState;
          });
        }
        setAudioStatus((prev) => ({ ...prev, [index]: "hidden" }));
      } catch (error) {
        console.error("Error stopping sound:", error);
      }
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    // A subtle dark gradient background works well on both iOS and Android devices.
    <LinearGradient colors={["#121212", "#1b1b1b"]} style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.searchBarContainer}>
          <Ionicons name="search" size={24} color="#ccc" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for music..."
            placeholderTextColor="#ccc"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        {searchQuery.trim() !== "" ? (
          <View style={styles.searchResults}>
            <Text style={styles.sectionTitle}>Search Results</Text>
            <View style={styles.resultsGrid}>
              {filteredCategories.length > 0 ? (
                filteredCategories.map((cat) => {
                  const imgIndex = categories.indexOf(cat);
                  return (
                    <CategoryCard
                      key={cat}
                      category={cat}
                      index={imgIndex}
                      image={categoryImages[imgIndex]}
                      onPress={() =>
                        navigation.navigate("Category", { category: cat })
                      }
                    />
                  );
                })
              ) : (
                <Text style={styles.noResults}>No matching categories found.</Text>
              )}
            </View>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Trending Now</Text>
            <View style={styles.trendingGrid}>
              {trendingImages.map((image, index) => (
                <TrendingCard
                  key={index}
                  image={image}
                  index={index}
                  isPlaying={audioStatus[index] === "play"}
                  onPress={() => handleAudioToggle(index)}
                />
              ))}
            </View>
            <Text style={styles.sectionTitle}>All Categories</Text>
            <View style={styles.categoriesList}>
              {categories.map((category, index) => (
                <CategoryCard
                  key={category}
                  category={category}
                  index={index}
                  image={categoryImages[index]}
                  onPress={() => navigation.navigate("Category", { category })}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
    // Increased top padding to move search bar down
    paddingTop: 60,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1f1f1f",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: "#fff", fontSize: 16 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0D9488",
    marginVertical: 12,
  },
  // Trending Now – unique full-width horizontal cards
  trendingList: { flexDirection: "column" },
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
    alignSelf: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 8,
    elevation: 7,
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
  // All Categories – full-width horizontal cards (unchanged)
  categoriesList: { flexDirection: "column" },
  categoryCard: {
    width: "98%",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
    elevation: 5,
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
  // Search results & grid
  searchResults: { marginBottom: 30 },
  resultsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  noResults: { color: "#fff", fontStyle: "italic" },
});