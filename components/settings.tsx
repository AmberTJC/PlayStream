import React, {useState} from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsPage()
{

    const [stickyRepeat, setStickyRepeat] = useState(false);
    const [gaplessPlayback, setGaplessPlayback] = useState(false);
    const [displayMode, setDisplayMode] = useState(false);


    return(
        <View style={styles.container}>
            <View style={styles.header}>
                    <Text style={styles.headerText}>PlayStream</Text>
                  </View>
            <View>
                <View style = {styles.row}>
                <Ionicons style ={styles.icons} name = "person-circle-outline" size={40} color="#0D9488"></Ionicons>
                <Text style = {styles.sectionTitle}>Account Settings</Text>
                </View>
                <Text style = {styles.subText}>Manage Account</Text>
            </View>
            <View>
                <View style = {styles.row}>
                <Ionicons style ={styles.icons} name = "repeat-outline" size={40} color="#0D9488"></Ionicons>
                <Text style = {styles.sectionTitle}>Sticky Repeat</Text>
                <Switch
                            value={stickyRepeat}
                            onValueChange={setStickyRepeat}
                            thumbColor={stickyRepeat ? "#0D9488" : "#888"}
                            trackColor={{ false: "#333", true: "#0D9488" }}
                        />
                </View>
                <Text style = {styles.subText}>Repeat persists between song selections</Text>
            </View>
            <View>
                <View style = {styles.row}>
            <Ionicons style ={styles.icons} name = "sync-outline" size={40} color="#0D9488"></Ionicons>
                <Text style = {styles.sectionTitle}>Gapless Playback</Text>
                <Switch
                            value={gaplessPlayback}
                            onValueChange={setGaplessPlayback}
                            thumbColor={gaplessPlayback ? "#0D9488" : "#888"}
                            trackColor={{ false: "#333", true: "#0D9488" }}
                        />
                </View>
                <Text style = {styles.subText}>Plays without pausing between songs</Text>
            </View>
            <View>
                <View style = {styles.row}>
            <Ionicons style ={styles.icons} name = "toggle-outline" size={40} color="#0D9488"></Ionicons>
                <Text style = {styles.sectionTitle}>Display</Text>
                <Switch
                            value={displayMode}
                            onValueChange={setDisplayMode}
                            thumbColor={displayMode ? "#0D9488" : "#888"}
                            trackColor={{ false: "#333", true: "#0D9488" }}
                        />
                </View>
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
        marginLeft: 10,
        marginTop: 15,
        flex: 1,
        flexShrink: 1,
      },
      subText: {
        color: '#0D9488',
        fontSize: 14,
        marginBottom: 40,
        marginLeft: 50,
      },
      icons: {
        marginTop: 15,
      },

      row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        
      }
});