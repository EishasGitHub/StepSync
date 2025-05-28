import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { get, ref } from 'firebase/database';
import { useEffect } from 'react';
import { useState } from 'react';

const Settings = ({navigation}) => {

  const [username, setUsername] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const uid = user.uid;
        const db = getDatabase();
        const snapshot = await get(ref(db, `users/${uid}`));

        if (snapshot.exists()) {
          const data = snapshot.val();
          setUsername(data.username);
        }
      }
    };

    fetchUserData();
    }, []);

  const progresspage = () => {
    navigation.push('progress');
  }

  const leaderpage = () => {
    navigation.push('leaderboard');
  }

  const Zonepage = () => {
    navigation.push('gamezone');
  }

  const homepage = () => {
    navigation.push('home');
  }

  const profile = () => {
    navigation.push('editprofile');
  }

  const help = () => {
    navigation.push('help');
  }

  const bug = () => {
    navigation.push('bugreport');
  }

  const logout = () => {
    navigation.push('login');
  }

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerBar}>
        <Text style={styles.headerText}>SETTINGS</Text>
        <View style={styles.userSection}>
          <Image source={{ uri: 'https://via.placeholder.com/50' }} style={styles.profileImage} />
          <View style={styles.userInfo}>
            <Text style={styles.username}>{username}</Text>
            <Text style={styles.userStatus}>It's your 4th Day, Keep it up!</Text>
          </View>
        </View>
      </View>
      
      {/* Settings Options */}
      <View style={styles.settingsList}>
        <TouchableOpacity style={styles.option} onPress={profile}><Text style={styles.optionText}>Edit Profile</Text></TouchableOpacity>
        <TouchableOpacity style={styles.option}><Text style={styles.optionText}>Connect to heart rate device</Text></TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Notifications</Text>
          <MaterialIcons name="check-circle" size={20} color="#00FF00" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={help}><Text style={styles.optionText}>Help</Text></TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={bug}><Text style={styles.optionText}>Report a bug</Text></TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={logout}><Text style={styles.optionText}>Log out</Text></TouchableOpacity>
      </View>
      
      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        
        <Ionicons name="settings" size={24} color="#FF00FF" />
        <TouchableOpacity onPress={leaderpage}><Ionicons name="bar-chart" size={24} color="#black" /></TouchableOpacity>
        
        <View style={styles.homeIconContainer}>
        <TouchableOpacity onPress={homepage}><Ionicons name="home" size={28} color="#black" /></TouchableOpacity>

        </View>
        <TouchableOpacity onPress={Zonepage}><Ionicons name="game-controller" size={24} color="#black" /></TouchableOpacity>


        <TouchableOpacity onPress={progresspage}><Ionicons name="flame" size={24} color="black" /></TouchableOpacity>


      </View>
    </View>
  );
};

const styles = StyleSheet.create({
container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
    },
    headerBar: {
    width: '120%',
    height: 200,
    backgroundColor: '#2D1B3D',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 200,
    borderBottomRightRadius: 200,
    position: 'absolute',
    top: 0,
    },
    headerText: {
    color: '#FF00FF',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: '5%',
    textShadowColor: '#FF00FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    },
userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -20,
    padding: 10,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginTop: 10,
    },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#D3B3E5',
  },
  userInfo: {
    marginLeft: 10,
  },
  username: {
    fontSize: 16,
    color: '#FF00FF'
  },
  userStatus: {
    fontSize: 12,
    color: 'gray',
  },
  settingsList: {
    marginTop: '30%',
    // paddingHorizontal: 20,
    width: '90%',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#00FF00',
  },
  optionText: {
    fontSize: 20,
    color: '#FF00FF'
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 70,
    backgroundColor: '#2D1B3D',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  homeIconContainer: {
    backgroundColor: '#2D1B3D',
    padding: 10,
    borderRadius: 30,
    marginBottom: 10,
  },
});

export default Settings;
