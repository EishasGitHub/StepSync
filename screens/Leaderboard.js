import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { get, ref } from 'firebase/database';
import { useEffect } from 'react';
import { useState } from 'react';

const leaderboardData = [
  { name: 'profile 1', steps: '12,300', rank: 1 },
  { name: 'profile 2', steps: '10,200', rank: 2 },
  { name: 'profile 3', steps: '9,000', rank: 3 },
  { name: 'profile 4', steps: '8,000', rank: 4 },
  { name: 'YOU', steps: '7,500', rank: 5 },
];

const getRankIcon = (rank) => {
  switch (rank) {
    case 1:
      return 'medal';
    case 2:
      return 'medal-outline';
    case 3:
      return 'trophy-outline';
    default:
      return 'walk-outline';
  }
};

const Leaderboard = ({navigation}) => {

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

  const homepage = () => {
    navigation.push('home');
  }

  const progresspage = () => {
    navigation.push('progress');
  }

  const Zonepage = () => {
    navigation.push('gamezone');
  }

  const settings = () => {
    navigation.push('setting');
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerBar}>
        <Text style={styles.headerText}>🏆 LEADERBOARD</Text>
        <View style={styles.userSection}>
          <Image source={{ uri: 'https://via.placeholder.com/50' }} style={styles.profileImage} />
          <View style={styles.userInfo}>
            <Text style={styles.username}>{username}</Text>
            <Text style={styles.userStatus}>Day 4  |  Keep Going!</Text>
          </View>
        </View>
      </View>

      {/* Leaderboard Content */}
      <ScrollView style={styles.leaderboardContainer}>
        {leaderboardData.map((item, index) => (
          <View
            key={index}
            style={[styles.leaderboardItem, item.name === 'YOU' && styles.highlightSelf]}
          >
            <Ionicons
              name={getRankIcon(item.rank)}
              size={20}
              color={item.rank <= 3 ? '#FFD700' : '#fff'}
              style={styles.rankIcon}
            />
            <Text style={styles.rankText}>{item.rank}.</Text>
            <Image source={{ uri: 'https://via.placeholder.com/40' }} style={styles.avatar} />
            <Text style={styles.name}>{item.name}</Text>
            <View style={styles.stepSection}>
              <Text style={styles.steps}>{item.steps} steps</Text>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${100 - index * 15}%` }]} />
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={settings}><Ionicons name="settings" size={24} color="black" /></TouchableOpacity>
        
        <Ionicons name="bar-chart" size={24} color="#FF00FF" />
        <View style={styles.homeIconContainer}>
        <TouchableOpacity onPress={homepage}><Ionicons name="home" size={28} color="black" /></TouchableOpacity>
          
        </View>
        <TouchableOpacity onPress={Zonepage}><Ionicons name="game-controller" size={24} color="black" /></TouchableOpacity>
        
        <TouchableOpacity onPress={progresspage}><Ionicons name="flame" size={24} color="black" /></TouchableOpacity>
        
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    
  },
  headerBar: {
    width: '100%',
    height: 200,
    backgroundColor: '#2D1B3D',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 150,
    borderBottomRightRadius: 150,
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
    color: '#00FF00'
  },
  userStatus: {
    fontSize: 12,
    color: 'gray',
  },
  leaderboardContainer: {
    paddingHorizontal: 20,
    marginTop: '60%',
  },
  leaderboardItem: {
    backgroundColor: '#2D1B3D',
    marginVertical: 10,
    padding: 15,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#00FF00'
  },
  highlightSelf: {
    borderColor: '#FFD700',
    borderWidth: 2,
  },
  rankIcon: {
    marginRight: 6,
  },
  rankText: {
    fontSize: 16,
    color: '#FF00FF',
    marginRight: 6,
    width: 24,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  name: {
    flex: 1,
    color: '#FF00FF',
    fontSize: 16,
  },
  stepSection: {
    alignItems: 'flex-end',
  },
  steps: {
    color: '#00FF00',
    fontSize: 14,
    marginBottom: 4,
  },
  progressBarBg: {
    backgroundColor: '#fff',
    width: 100,
    height: 6,
    borderRadius: 4,
  },
  progressBarFill: {
    backgroundColor: '#FF00FF',
    height: 6,
    borderRadius: 4,
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

export default Leaderboard;
