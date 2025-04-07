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
} from "react-native";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from "@expo/vector-icons";
import { fetchTracksByGenre, Track } from "../services/musicService";

type RootStackParamList = {
  Main: undefined;
  Category: { category: string; limit?: number };
};

type CategoryScreenRouteProp = RouteProp<RootStackParamList, "Category">;
type CategoryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Category">;

export default function CategoryScreen() {
  const route = useRoute<CategoryScreenRouteProp>();
  const navigation = useNavigation<CategoryScreenNavigationProp>();
  const { category, limit = 30 } = route.params; // Default to 30 tracks
  
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
  }, [category, limit]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#0D9488" />
      </TouchableOpacity>
      
      <Text style={styles.categoryTitle}>{category}</Text>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0D9488" />
          <Text style={styles.loadingText}>Loading {limit} tracks...</Text>
        </View>
      ) : (
        <FlatList
          data={tracks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.title}>{item.name}</Text>
              <Text style={styles.artist}>{item.artist_name}</Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No tracks found for this category</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  // Added marginTop to move the back arrow down for easier accessibility
  backButton: { marginTop: 30, marginBottom: 10 },
  item: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#ddd" },
  title: { fontSize: 18 },
  categoryTitle: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { fontSize: 18, marginTop: 10 },
  emptyText: { fontSize: 18, textAlign: "center", marginTop: 10 },
  artist: { fontSize: 14, color: "#666" },
});
