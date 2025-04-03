//
// This file defines the CategoryScreen component.
// It displays a list of songs that belong to a specific category.
// The category name is passed via the navigation route parameters and a dummy
// list of songs is used to simulate category-based song selection.
// A back button is added at the top so the user can return to the previous screen.

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

type RootStackParamList = {
  Category: { category: string };
};

type CategoryScreenRouteProp = RouteProp<RootStackParamList, "Category">;

export default function CategoryScreen() {
  const route = useRoute<CategoryScreenRouteProp>();
  const navigation = useNavigation();
  const { category } = route.params;

  const songs = [
    { id: 1, title: `${category} Song 1` },
    { id: 2, title: `${category} Song 2` },
    { id: 3, title: `${category} Song 3` },
  ];

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#FF9800" />
      </TouchableOpacity>
      <FlatList
        data={songs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.title}>{item.title}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  backButton: { marginBottom: 10 },
  item: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#ddd" },
  title: { fontSize: 18 },
});
