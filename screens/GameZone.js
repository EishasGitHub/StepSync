import React from 'react';
import { View, Text, TextInput, Image, StyleSheet , TouchableOpacity} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { get, ref } from 'firebase/database';
import { useEffect } from 'react';
import { useState } from 'react';

const GameZone = ({navigation}) => {

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

    const buttonScale = useSharedValue(1);
  
    const animatedButtonStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: buttonScale.value }],
        backgroundColor: buttonScale.value === 1 ? '#2D1B3D' : '#00FF00', // Change color on press
      };
    });
  
    const handlePressIn = () => {
      buttonScale.value = withTiming(0.95, { duration: 100 });
    };
  
    const handlePressOut = () => {
      buttonScale.value = withTiming(1, { duration: 100 });
      navigation.push('mode');
    };

  const homepage = () => {
    navigation.push('home');
  }

  const progresspage = () => {
    navigation.push('progress');
  }

  const leaderpage = () => {
    navigation.push('leaderboard');
  }

  const settings = () => {
    navigation.push('setting');
  }
  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerBar}>
        <Text style={styles.headerText}>GAME ZONE</Text>
              {/* User Info Section */}
      <View style={styles.userSection}>
        <Image source={{ uri: 'https://via.placeholder.com/50' }} style={styles.profileImage} />
        <View style={styles.userInfo}>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.userStatus}>It's your 4th Day, Keep it up!</Text>
        </View>
      </View>
      </View>
      
      {/* Weight Info */}
      <View style={styles.weightSection}>
        <View style={styles.row}>
          <Text style={styles.label}>Game Mode:</Text>
          <TextInput style={styles.input} value="Puzzle" editable={false} />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Difficulty Level</Text>
          <TextInput style={styles.input} value="Easy" editable={false} />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Time Limit:</Text>
          <TextInput style={styles.input} value="00:10:00" editable={false} />
        </View>
      </View>
      
      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={settings}><Ionicons name="settings" size={24} color="black" /></TouchableOpacity>
        
        <TouchableOpacity onPress={leaderpage}><Ionicons name="bar-chart" size={24} color="black" /></TouchableOpacity>
        

        <View style={styles.homeIconContainer}>
        <TouchableOpacity onPress={homepage}><Ionicons name="home" size={28} color="black" /></TouchableOpacity>

        </View>
        <Ionicons name="game-controller" size={24} color="#FF00FF" />
        <TouchableOpacity onPress={progresspage}><Ionicons name="flame" size={24} color="black" /></TouchableOpacity>

      </View>

        <Animated.View style={[styles.button, animatedButtonStyle]}>
          <TouchableOpacity 
            onPressIn={handlePressIn} 
            onPressOut={handlePressOut} 
            // onPress={() => console.log("Button Pressed")}
          ><Text style={styles.buttonText}>START GAME</Text></TouchableOpacity>
          </Animated.View>
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
    marginTop: 10
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
    // fontWeight: 'bold',
    color: '#00FF00'
  },
  userStatus: {
    fontSize: 12,
    color: 'gray',
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 100,
  },
  weightSection: {
    marginTop: 100,
    width: '80%'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF00FF'
  },
  input: {
    width: '40%',
    height: 40,
    borderRadius: 10,
    backgroundColor: '#2D1B3D',
    textAlign: 'center',
    color: '#00FF00',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#00FF00'
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

  button: {
    backgroundColor: '#2D1B3D',
    paddingVertical: 10,
    width: '80%',
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 50,
        borderWidth: 1,
    borderColor: '#00FF00'
  },
  buttonText: {
    color: '#FF00FF',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: '#FF00FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});

export default GameZone;