import React from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Progress from 'react-native-progress';

const Home = ({navigation}) => {
  // Example step count and goal
  const steps = 3700;
  const goal = 5000;
  const progress = steps / goal; // Calculate progress as a percentage

  const progresspage = () => {
    navigation.push('progress');
  }

  const leaderpage = () => {
    navigation.push('leaderboard');
  }

  const Zonepage = () => {
    navigation.push('gamezone');
  }

  const settings = () => {
    navigation.push('setting');
  }

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerBar}>
        <Text style={styles.headerText}>Step Sync</Text>
        <Text style={styles.subtitle}>Join the fitness revolution!</Text>
      </View>

      {/* Welcome & Motivation */}
      <Text style={styles.greeting}>Welcome back, User!</Text>
      <Text style={styles.motivation}>You're just {goal - steps} steps away from your goal today! Keep going!</Text>

      {/* Circular Progress Bar and Step Tracker */}
      <View style={styles.stepTracker}>
        <Progress.Circle
          progress={progress}
          size={150}
          showsText={true}
          textStyle={styles.progressText}
          borderWidth={10}
          color="#FF00FF"
          unfilledColor="#0000"
          thickness={8}
        />
        <Text style={styles.stepCount}>{steps} / {goal} steps</Text>
        <Text style={styles.stepGoal}>Goal: {goal} steps</Text>
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={settings}><Ionicons name="settings" size={24} color="black" /></TouchableOpacity>
        
        <TouchableOpacity onPress={leaderpage}><Ionicons name="bar-chart" size={24} color="black" /></TouchableOpacity>
        
        <View style={styles.homeIconContainer}>
          <Ionicons name="home" size={28} color="#FF00FF" />
        </View>
        <TouchableOpacity onPress={Zonepage}><Ionicons name="game-controller" size={24} color="black" /></TouchableOpacity>
        
        <TouchableOpacity onPress={progresspage}>
          <Ionicons name="flame" size={24} color="black" />
        </TouchableOpacity>
        
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
        marginTop: '14%',
        textShadowColor: '#FF00FF',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    subtitle: {
        marginTop: 5,
        fontSize: 16,
        color: 'gray',
        textAlign: 'center',
        marginBottom: 50,
      },
    greeting: {
        fontSize: 20,
        color: '#00FF00',
        textAlign: 'center',
        marginTop: 80,
      },
      motivation: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        marginTop: 10,
      },
      stepTracker: {
        marginTop: 50,
        alignItems: 'center',
      },
      progressText: {
        fontSize: 18,
        color: '#00FF00',
        fontWeight: 'bold',
      },
      stepCount: {
        fontSize: 30,
        fontWeight: 'bold',
        marginTop: 50,
        color: '#FF00FF'
      },
      stepGoal: {
        fontSize: 18,
        color: '#00FF00',
        marginTop: 5,
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
    color: '#FF00FF'
  },
  userStatus: {
    fontSize: 12,
    color: 'gray',
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#00FF00', // Neon pink color for title
    textShadowColor: '#00FF00',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    marginTop: '20%'
  },
  weightSection: {
    marginTop: 80,
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
    textAlign: 'center',
    color: '#00FF00',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#00FF00', // Neon green border for inputs
    backgroundColor: '#2D1B3D',
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

export default Home;