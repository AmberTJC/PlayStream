import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import images
const trendingImages = [
  require('../assets/search-page-images/daniel-schludi-mbGxz7pt0jM-unsplash.jpg'),
  require('../assets/search-page-images/ivan-dorofeev-bsLXJsucvxc-unsplash.jpg'),
  require('../assets/search-page-images/victor-rodvang-rbSpGv1wb5M-unsplash.jpg'),
  require('../assets/search-page-images/chad-morehead-AHnmupFDWCc-unsplash.jpg'),
  require('../assets/search-page-images/john-matychuk-gUK3lA3K7Yo-unsplash.jpg'),
  require('../assets/search-page-images/israel-palacio-Y20JJ_ddy9M-unsplash.jpg'),
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

export default function SearchPage() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>PlayStream</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for your favorite music"
          placeholderTextColor="#666"
        />
      </View>

      {/* Trending Now Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trending Now</Text>
        <View style={styles.trendingGrid}>
          {trendingImages.map((image, index) => (
            <View key={index} style={styles.trendingItem}>
              <Image
                source={image}
                style={styles.trendingImage}
              />
            </View>
          ))}
        </View>
      </View>

      {/* Categories */}
      <ScrollView style={styles.categoriesContainer}>
        <Text style={styles.sectionTitle}>All categories</Text>
        <View style={styles.categoriesGrid}>
          {categories.map((category, index) => (
            <TouchableOpacity key={category} style={styles.categoryItem}>
              <Text style={styles.categoryText}>{category}</Text>
              <Image
                source={categoryImages[index]}
                style={styles.categoryImage}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color="#0D9488" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="search" size={24} color="#0D9488" />
          <Text style={styles.navText}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="settings" size={24} color="#0D9488" />
          <Text style={styles.navText}>Settings</Text>
        </TouchableOpacity>
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    backgroundColor: '#0D9488',
    padding: 12,
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  searchContainer: {
    padding: 16,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 12,
    fontSize: 14,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    color: '#0D9488',
    fontSize: 14,
    marginBottom: 12,
  },
  trendingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  trendingItem: {
    width: '31%',
    aspectRatio: 1,
  },
  trendingImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  categoriesContainer: {
    flex: 1,
    padding: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryItem: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#0D9488',
  },
  categoryText: {
    color: '#fff',
    fontWeight: '500',
  },
  categoryImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
    backgroundColor: '#000',
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    color: '#0D9488',
    fontSize: 12,
    marginTop: 4,
  },
});

