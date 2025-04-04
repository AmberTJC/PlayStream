import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Layout, Text, Toggle, useTheme } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';


interface SettingsPageProps {
  onSignOut: () => void;
  toggleTheme: () => void;
  isDarkMode: boolean;
}

export default function SettingsPage({
  onSignOut,
  toggleTheme,
  isDarkMode,
}: SettingsPageProps) {
  const [stickyRepeat, setStickyRepeat] = useState(false);
  const [gaplessPlayback, setGaplessPlayback] = useState(false);

  const theme = useTheme();

  return (
    <Layout style={[
      styles.container,
      { backgroundColor: isDarkMode ? '#000' : '#fff' }
    ]}>
      
      {/* Header */}
      <Layout style={[styles.header, { backgroundColor: theme['color-header-background'] }]} level="1">
        <Text category="h6" style={styles.headerText}>PlayStream</Text>
      </Layout>
      {/* Account Section */}
      <Layout style={styles.section}>
        <Layout style={styles.row}>
          <Ionicons name="person-circle-outline" size={32} color="#0D9488" />
          <Text category="s1" style={styles.sectionTitle}>Account Settings</Text>
        </Layout>
        <Text appearance="hint" style={styles.subText}>Manage Account</Text>
      </Layout>

      {/* Sticky Repeat */}
      <Layout style={styles.section}>
        <Layout style={styles.row}>
          <Ionicons name="repeat-outline" size={32} color="#0D9488" />
          <Text category="s1" style={styles.sectionTitle}>Sticky Repeat</Text>
          <Toggle
            checked={stickyRepeat}
            onChange={setStickyRepeat}
          />
        </Layout>
        <Text appearance="hint" style={styles.subText}>Repeat persists between song selections</Text>
      </Layout>

      {/* Gapless Playback */}
      <Layout style={styles.section}>
        <Layout style={styles.row}>
          <Ionicons name="sync-outline" size={32} color="#0D9488" />
          <Text category="s1" style={styles.sectionTitle}>Gapless Playback</Text>
          <Toggle
            checked={gaplessPlayback}
            onChange={setGaplessPlayback}
          />
        </Layout>
        <Text appearance="hint" style={styles.subText}>Plays without pausing between songs</Text>
      </Layout>

      {/* Display Mode */}
      <Layout style={styles.section}>
        <Layout style={styles.row} level="1">
          <Ionicons name="toggle-outline" size={32} color="#0D9488" />
          <Text category="s1" style={styles.sectionTitle}>Display</Text>
          <Toggle
            checked={isDarkMode}
            onChange={toggleTheme}
          />
        </Layout>
        <Text appearance="hint" style={styles.subText}>Toggles between dark and light mode</Text>
      </Layout>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 12,
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
  },
  section: {
  backgroundColor: 'transparent',
  paddingHorizontal: 16,
  paddingVertical: 8,
  marginBottom: 32,
  borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
   
  },
  sectionTitle: {
    marginLeft: 10,
    flex: 1,
    color: '#0D9488',
  },
  subText: {
    marginLeft: 42,
    marginTop: 4,
    fontSize: 13,
  },
});
