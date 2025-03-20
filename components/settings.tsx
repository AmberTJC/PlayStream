import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsPage()
{
    return(
        <View style={styles.container}>
            <View style={styles.header}>
                    <Text style={styles.headerText}>PlayStream</Text>
                  </View>
            <View>
                <Ionicons name = "person-circle-outline" size={40} color="#0D9488"></Ionicons>
                <Text style = {styles.sectionTitle}>Account Settings</Text>
                <Text style = {styles.subText}>Manage Account</Text>
            </View>
            <View>
                <Ionicons name = "repeat-outline" size={40} color="#0D9488"></Ionicons>
                <Text style = {styles.sectionTitle}>Sticky Repeat</Text>
                <Text style = {styles.subText}>Repeat persists between song selections</Text>
            </View>
            <View>
                <Text style = {styles.sectionTitle}>Gapless Playback</Text>
                <Text style = {styles.subText}>Plays without pausing between songs</Text>
            </View>
            <View>
                <Text style = {styles.sectionTitle}>Display</Text>
                <Text style = {styles.subText}>Toggles between dark and light mode</Text>
            </View>
        </View>

        
    );

    
       
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000',
      paddingTop: 0, 
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
    sectionTitle: {
        color: '#0D9488',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
      },
      subText: {
        color: '#0D9488',
        fontSize: 14,
        marginBottom: 12,
      },
});