import React from 'react';
import { View, Text, TextInput, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, get, push, set, onValue, off } from 'firebase/database';
import { useEffect, useState } from 'react';

import StepSyncApiServices from '../services/StepSyncApi';

const GameZone = ({navigation}) => {

  const [username, setUsername] = useState('');
  const [profilePic, setprofilePic] = useState('');
  const [streakCount, setStreakCount] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [todaySessionCount, setTodaySessionCount] = useState(0);

  const profilePictures = {
    'default.jpg': require('../assets/defaultProfile.jpg'),
    'girlBlack.jpg': require('../assets/gamerGirlBlack.jpg'),
    'boyWhite.png': require('../assets/gamerBoyWhite.png'),
    'kid.png': require('../assets/gamerKid.png'),
    'girlAsian.png': require('../assets/gamerGirlAsian.png')
  };
  
  // Game mode options with recommended option
  const [gameModeOptions] = useState([
    { key: 'btc', value: 'Beat the Clock', recommended: true },
    { key: 'memory', value: 'Memory Game', recommended: false },
    { key: 'mirror', value: 'Mirror Game', recommended: false }
  ]);
  
  // Difficulty level options with recommended option
  const [difficultyOptions, setDifficultyOptions] = useState([
    { key: 'easy', value: 'Easy', recommended: true },
    { key: 'medium', value: 'Medium', recommended: false },
    { key: 'hard', value: 'Hard', recommended: false }
  ]);
  
  // Get recommended options
  const getRecommendedOption = (options) => {
    return options.find(option => option.recommended);
  };
  
  // State for selected values - default to recommended
  const [selectedGameMode, setSelectedGameMode] = useState(getRecommendedOption(gameModeOptions)?.key || '');
  const [selectedDifficulty, setSelectedDifficulty] = useState(getRecommendedOption(difficultyOptions)?.key || '');

  // Helper function to calculate streak from session timestamps
  const calculateStreakFromSessions = (sessions) => {
    if (!sessions || Object.keys(sessions).length === 0) return 0;

    const sessionDates = Object.values(sessions)
      .map(session => {
        const date = new Date(session.timestamp * 1000);
        return date.toISOString().split('T')[0];
      })
      .filter(date => date);

    const uniqueDates = [...new Set(sessionDates)].sort().reverse();
    
    if (uniqueDates.length === 0) return 0;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    let streak = 0;
    let currentDate = new Date(today);
    
    let startDate = todayStr;
    if (uniqueDates[0] === yesterdayStr && !uniqueDates.includes(todayStr)) {
      startDate = yesterdayStr;
      currentDate = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    }

    for (let i = 0; i < uniqueDates.length; i++) {
      const sessionDate = uniqueDates[i];
      const expectedDate = currentDate.toISOString().split('T')[0];
      
      if (sessionDate === expectedDate) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  };

  // Helper function to get today's session count
  const getTodaySessionCount = (sessions) => {
    if (!sessions) return 0;
    
    const today = new Date().toISOString().split('T')[0];
    
    return Object.values(sessions).filter(session => {
      const sessionDate = new Date(session.timestamp * 1000).toISOString().split('T')[0];
      return sessionDate === today;
    }).length;
  };

  // Dynamic status message for GameZone
  const getGameZoneStatusMessage = () => {
    if (totalSessions === 0) {
      return "Ready to start your first gaming session?";
    } else if (todaySessionCount === 0) {
      if (streakCount === 0) {
        return "Time to get back in the game!";
      } else if (streakCount >= 7) {
        return `${streakCount}-day streak! Keep the fire burning! 🔥`;
      } else {
        return `Day ${streakCount} streak - don't break it now!`;
      }
    } else if (todaySessionCount >= 2) {
      return `${todaySessionCount} sessions today! You're crushing it! 💪`;
    } else {
      return "Great session! Ready for another challenge?";
    }
  };

  // Function to create game session
  const createGameSession = async (userId, userEmail, gameMode, difficulty) => {
    try {
      const db = getDatabase();
      
      // Create session ID using push().key
      const sessionRef = push(ref(db, 'pendingSessions'));
      const sessionId = sessionRef.key;
      
      // Create pending session data
      const pendingSession = {
        userId: userId,
        userEmail: userEmail,
        gameMode: gameMode,
        difficulty: difficulty,
        timestamp: Date.now(),
        status: 'pending'
      };
      
      // Write to pending sessions
      await set(sessionRef, pendingSession);
      
      console.log('Game session created:', sessionId);
      return sessionId;
      
    } catch (error) {
      console.error('Error creating game session:', error);
      throw error;
    }
  };

  // Function to update difficulty recommendations
  const updateRecommendedDifficulty = (newRecommendedKey) => {
    setDifficultyOptions(prev => 
      prev.map(option => ({
        ...option,
        recommended: option.key === newRecommendedKey
      }))
    );
    setSelectedDifficulty(newRecommendedKey);
  };

  // Function to update recommendations
  const updateRecommendedGameMode = (newRecommendedKey) => {
    setGameModeOptions(prev => 
      prev.map(option => ({
        ...option,
        recommended: option.key === newRecommendedKey
      }))
    );
  };

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const db = getDatabase();
      const userRef = ref(db, `users/${user.uid}`);

      const unsubscribe = onValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          
          setUsername(userData.username || 'Player');
          setprofilePic(userData.profilePicUrl || 'default.jpg');
          
          if (userData.sessions) {
            const sessions = userData.sessions;
            
            // Calculate dynamic values
            const streak = calculateStreakFromSessions(sessions);
            const todaySessions = getTodaySessionCount(sessions);
            const total = Object.keys(sessions).length;
            
            setStreakCount(streak);
            setTodaySessionCount(todaySessions);
            setTotalSessions(total);
          } else {
            // No sessions data
            setStreakCount(0);
            setTodaySessionCount(0);
            setTotalSessions(0);
          }
          
          // Get API recommendation
          fetchAPIRecommendation(userData);
        }
      });

      return () => {
        off(userRef);
      };
    }
  }, []);

  // Separate async function for API call
  const fetchAPIRecommendation = async (userData) => {
    try {
      // Calculate BMI if not provided
      let bmi = userData.bmi;
      if (!bmi && userData.weight && userData.height) {
        bmi = userData.weight / ((userData.height / 100) ** 2);
      }

      const healthData = {
        age: userData.age,
        bmi: bmi,
        restingBPM: userData.restingBPM || 70,
        workoutFrequency: userData.workoutFrequency || 100
      };

      console.log('User health data:', healthData);

      // Call your API
      const response = await fetch('https://stepsync-api-v2-production.up.railway.app/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          features: [healthData.age, healthData.bmi, healthData.restingBPM, healthData.workoutFrequency]
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('API response:', result);
        const recommendedDifficulty = result.predicted_class.toLowerCase();
        console.log('Recommended difficulty:', recommendedDifficulty);
        updateRecommendedDifficulty(recommendedDifficulty);
      }
    } catch (error) {
      console.error('API error:', error);
      // Keep default "easy" if API fails
    }
  };

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
    onStartGame();
  };

  // Function to handle game start
  const onStartGame = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        Alert.alert('Error', 'Please log in to start a game');
        return;
      }

      const userId = user.uid;
      const userEmail = user.email;
      
      // Validate selections
      if (!selectedGameMode || !selectedDifficulty) {
        Alert.alert('Error', 'Please select both game mode and difficulty');
        return;
      }

      console.log('Starting game with:', {
        userId,
        userEmail,
        gameMode: selectedGameMode,
        difficulty: selectedDifficulty
      });

      // Create game session
      const sessionId = await createGameSession(userId, userEmail, selectedGameMode, selectedDifficulty);
      
      // Navigate to game mode page with session data
      Alert.alert(
        'Game Session Created!', 
        `Your game session has been created. Session ID: ${sessionId}\n\nYou can now start the game on your PC.`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to the game mode page (PuzzleMode handles all game modes)
              navigation.push('mode', { 
                sessionId: sessionId,
                gameMode: selectedGameMode,
                difficulty: selectedDifficulty 
              });
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Error starting game:', error);
      Alert.alert('Error', 'Failed to start game session. Please try again.');
    }
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

  // Custom dropdown component
  const CustomDropdown = ({ data, placeholder, onSelect, selectedValue }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const selectedOption = data.find(item => item.key === selectedValue);
    
    return (
      <>
        <View style={styles.dropdownContainer}>
          <TouchableOpacity 
            style={styles.dropdownButton} 
            onPress={() => setIsOpen(!isOpen)}
          >
            <Text style={styles.dropdownButtonText}>
              {selectedOption ? selectedOption.value : placeholder}
              {selectedOption?.recommended && ' ⭐'}
            </Text>
            <Ionicons 
              name={isOpen ? "chevron-up" : "chevron-down"} 
              size={16} 
              color="#00FF00" 
            />
          </TouchableOpacity>
        </View>
        
        {isOpen && (
          <>
            <TouchableOpacity 
              style={styles.dropdownOverlay} 
              onPress={() => setIsOpen(false)}
              activeOpacity={1}
            />
            <View style={styles.dropdownList}>
              {data.map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.dropdownItem,
                    selectedValue === item.key && styles.selectedItem
                  ]}
                  onPress={() => {
                    onSelect(item.key);
                    setIsOpen(false);
                  }}
                >
                  <Text style={[
                    styles.dropdownItemText,
                    selectedValue === item.key && styles.selectedItemText
                  ]}>
                    {item.value}
                    {item.recommended && ' ⭐'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerBar}>
        <Text style={styles.headerText}>GAME ZONE</Text>
              {/* User Info Section */}
      <View style={styles.userSection}>
        <Image source={profilePictures[profilePic] } style={styles.profileImage} />
        <View style={styles.userInfo}>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.userStatus}>{getGameZoneStatusMessage()}</Text>
        </View>
      </View>
      </View>
      
      {/* Weight Info */}
      <View style={styles.weightSection}>
        <View style={styles.row}>
          <Text style={styles.label}>Game Mode:</Text>
          <CustomDropdown
            data={gameModeOptions}
            placeholder="Select Game Mode"
            selectedValue={selectedGameMode}
            onSelect={setSelectedGameMode}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Difficulty Level</Text>
          <CustomDropdown
            data={difficultyOptions}
            placeholder="Select Difficulty"
            selectedValue={selectedDifficulty}
            onSelect={setSelectedDifficulty}
          />
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
    color: '#00FF00'
  },
  userStatus: {
    fontSize: 12,
    color: 'gray',
  },
  apiStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  apiStatusText: {
    fontSize: 10,
    color: '#888',
  },
  testButton: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#444',
    borderRadius: 4,
  },
  testButtonText: {
    fontSize: 8,
    color: '#00FF00',
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
  difficultyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '45%',
  },
  refreshButton: {
    marginLeft: 8,
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#2D1B3D',
    borderWidth: 1,
    borderColor: '#00FF00',
  },
  recommendationInfo: {
    backgroundColor: 'rgba(45, 27, 61, 0.3)',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#00FF00',
  },
  recommendationText: {
    color: '#00FF00',
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  debugInfo: {
    backgroundColor: 'rgba(255, 0, 255, 0.1)',
    padding: 8,
    borderRadius: 4,
    marginTop: 10,
  },
  debugText: {
    color: '#FF00FF',
    fontSize: 10,
    textAlign: 'center',
  },
  dropdownContainer: {
    width: '40%',
    position: 'relative',
  },
  dropdownButton: {
    height: 40,
    borderRadius: 10,
    backgroundColor: '#2D1B3D',
    borderWidth: 1,
    borderColor: '#00FF00',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  dropdownButtonText: {
    color: '#00FF00',
    fontSize: 14,
    flex: 1,
    textAlign: 'center',
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9998,
  },
  dropdownList: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -80 }, { translateY: -60 }],
    width: 160,
    backgroundColor: '#2D1B3D',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#00FF00',
    maxHeight: 150,
    zIndex: 9999,
    elevation: 20,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  dropdownItemText: {
    color: '#00FF00',
    fontSize: 14,
    textAlign: 'center',
  },
  selectedItem: {
    backgroundColor: '#444',
  },
  selectedItemText: {
    color: '#FF00FF',
    fontWeight: 'bold',
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

// import React from 'react';
// import { View, Text, TextInput, Image, StyleSheet , TouchableOpacity} from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
// import { getAuth } from 'firebase/auth';
// import { getDatabase } from 'firebase/database';
// import { get, ref } from 'firebase/database';
// import { useEffect } from 'react';
// import { useState } from 'react';

// import StepSyncApiServices from '../services/StepSyncApi';

// const GameZone = ({navigation}) => {

//   const [username, setUsername] = useState('');

//   const [profilePic, setprofilePic] = useState('');

//   const profilePictures = {
//   'default.jpg': require('../assets/defaultProfile.jpg'),
//   'girlBlack.jpg': require('../assets/gamerGirlBlack.jpg'),
//   'boyWhite.png': require('../assets/gamerBoyWhite.png'),
//   'kid.png': require('../assets/gamerKid.png'),
//   'girlAsian.png': require('../assets/gamerGirlAsian.png')
//   };
  
//   // Game mode options with recommended option
//   const [gameModeOptions] = useState([
//     { key: 'beat-clock', value: 'Beat the Clock', recommended: true },
//     { key: 'memory', value: 'Memory Game', recommended: false },
//     { key: 'mirror', value: 'Mirror Game', recommended: false }
//   ]);
  
//   // Difficulty level options with recommended option
//   const [difficultyOptions, setDifficultyOptions] = useState([
//     { key: 'easy', value: 'Easy', recommended: true },
//     { key: 'medium', value: 'Medium', recommended: false },
//     { key: 'hard', value: 'Hard', recommended: false }
//   ]);
  
//   // Get recommended options
//   const getRecommendedOption = (options) => {
//     return options.find(option => option.recommended);
//   };
  
//   // State for selected values - default to recommended
//   const [selectedGameMode, setSelectedGameMode] = useState(getRecommendedOption(gameModeOptions)?.key || '');
//   const [selectedDifficulty, setSelectedDifficulty] = useState(getRecommendedOption(difficultyOptions)?.key || '');

//   // Function to update difficulty recommendations
//   const updateRecommendedDifficulty = (newRecommendedKey) => {
//     setDifficultyOptions(prev => 
//       prev.map(option => ({
//         ...option,
//         recommended: option.key === newRecommendedKey
//       }))
//     );
//     setSelectedDifficulty(newRecommendedKey);
//   };

//   // Function to update recommendations
//   const updateRecommendedGameMode = (newRecommendedKey) => {
//     setGameModeOptions(prev => 
//       prev.map(option => ({
//         ...option,
//         recommended: option.key === newRecommendedKey
//       }))
//     );
//   };

//   useEffect(() => {
//     const fetchUserDataAndRecommendation = async () => {
//       const auth = getAuth();
//       const user = auth.currentUser;

//       if (user) {
//         const uid = user.uid;
//         const db = getDatabase();
//         const snapshot = await get(ref(db, `users/${uid}`));

//         if (snapshot.exists()) {
//           const data = snapshot.val();
//           setUsername(data.username);
//           setprofilePic(data.profilePicUrl);
          
//           // Get API recommendation
//           try {
//             // Calculate BMI if not provided
//             let bmi = data.bmi;
//             if (!bmi && data.weight && data.height) {
//               bmi = data.weight / ((data.height / 100) ** 2);
//             }

//             const healthData = {
//               age: data.age,
//               bmi: bmi,
//               restingBPM: data.restingBPM || 70,
//               workoutFrequency: data.workoutFrequency || 100
//             };

//             console.log('User health data:', healthData);

//             // Call your API
//             const response = await fetch('https://stepsync-api-v2-production.up.railway.app/predict', {
//               method: 'POST',
//               headers: {
//                 'Content-Type': 'application/json',
//               },
//               body: JSON.stringify({
//                 features: [healthData.age, healthData.bmi, healthData.restingBPM, healthData.workoutFrequency]
//               }),
//             });

//             if (response.ok) {
//               const result = await response.json();
//               console.log('API response:', result);
//               const recommendedDifficulty = result.predicted_class.toLowerCase();
//               console.log('Recommended difficulty:', recommendedDifficulty);
//               updateRecommendedDifficulty(recommendedDifficulty);
//             }
//           } catch (error) {
//             console.error('API error:', error);
//             // Keep default "easy" if API fails
//           }
//         }
//       }
//     };

//     fetchUserDataAndRecommendation();
//   }, []);

//   const buttonScale = useSharedValue(1);

//   const animatedButtonStyle = useAnimatedStyle(() => {
//     return {
//       transform: [{ scale: buttonScale.value }],
//       backgroundColor: buttonScale.value === 1 ? '#2D1B3D' : '#00FF00', // Change color on press
//     };
//   });

//   const handlePressIn = () => {
//     buttonScale.value = withTiming(0.95, { duration: 100 });
//   };

//   const handlePressOut = () => {
//     buttonScale.value = withTiming(1, { duration: 100 });
//     navigation.push('mode');
//   };

//   const homepage = () => {
//     navigation.push('home');
//   }

//   const progresspage = () => {
//     navigation.push('progress');
//   }

//   const leaderpage = () => {
//     navigation.push('leaderboard');
//   }

//   const settings = () => {
//     navigation.push('setting');
//   }

//   // Custom dropdown component
//   const CustomDropdown = ({ data, placeholder, onSelect, selectedValue }) => {
//     const [isOpen, setIsOpen] = useState(false);
    
//     const selectedOption = data.find(item => item.key === selectedValue);
    
//     return (
//       <>
//         <View style={styles.dropdownContainer}>
//           <TouchableOpacity 
//             style={styles.dropdownButton} 
//             onPress={() => setIsOpen(!isOpen)}
//           >
//             <Text style={styles.dropdownButtonText}>
//               {selectedOption ? selectedOption.value : placeholder}
//               {selectedOption?.recommended && ' ⭐'}
//             </Text>
//             <Ionicons 
//               name={isOpen ? "chevron-up" : "chevron-down"} 
//               size={16} 
//               color="#00FF00" 
//             />
//           </TouchableOpacity>
//         </View>
        
//         {isOpen && (
//           <>
//             <TouchableOpacity 
//               style={styles.dropdownOverlay} 
//               onPress={() => setIsOpen(false)}
//               activeOpacity={1}
//             />
//             <View style={styles.dropdownList}>
//               {data.map((item) => (
//                 <TouchableOpacity
//                   key={item.key}
//                   style={[
//                     styles.dropdownItem,
//                     selectedValue === item.key && styles.selectedItem
//                   ]}
//                   onPress={() => {
//                     onSelect(item.key);
//                     setIsOpen(false);
//                   }}
//                 >
//                   <Text style={[
//                     styles.dropdownItemText,
//                     selectedValue === item.key && styles.selectedItemText
//                   ]}>
//                     {item.value}
//                     {item.recommended && ' ⭐'}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           </>
//         )}
//       </>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       {/* Header Section */}
//       <View style={styles.headerBar}>
//         <Text style={styles.headerText}>GAME ZONE</Text>
//               {/* User Info Section */}
//       <View style={styles.userSection}>
//         <Image source={profilePictures[profilePic] } style={styles.profileImage} />
//         <View style={styles.userInfo}>
//           <Text style={styles.username}>{username}</Text>
//           <Text style={styles.userStatus}>It's your 4th Day, Keep it up!</Text>
//         </View>
//       </View>
//       </View>
      
//       {/* Weight Info */}
//       <View style={styles.weightSection}>
//         <View style={styles.row}>
//           <Text style={styles.label}>Game Mode:</Text>
//           <CustomDropdown
//             data={gameModeOptions}
//             placeholder="Select Game Mode"
//             selectedValue={selectedGameMode}
//             onSelect={setSelectedGameMode}
//           />
//         </View>
//         <View style={styles.row}>
//           <Text style={styles.label}>Difficulty Level</Text>
//           <CustomDropdown
//             data={difficultyOptions}
//             placeholder="Select Difficulty"
//             selectedValue={selectedDifficulty}
//             onSelect={setSelectedDifficulty}
//           />
//         </View>
//         <View style={styles.row}>
//           <Text style={styles.label}>Time Limit:</Text>
//           <TextInput style={styles.input} value="00:10:00" editable={false} />
//         </View>
//       </View>
      
//       {/* Bottom Navigation Bar */}
//       <View style={styles.bottomNav}>
//         <TouchableOpacity onPress={settings}><Ionicons name="settings" size={24} color="black" /></TouchableOpacity>
        
//         <TouchableOpacity onPress={leaderpage}><Ionicons name="bar-chart" size={24} color="black" /></TouchableOpacity>
        

//         <View style={styles.homeIconContainer}>
//         <TouchableOpacity onPress={homepage}><Ionicons name="home" size={28} color="black" /></TouchableOpacity>

//         </View>
//         <Ionicons name="game-controller" size={24} color="#FF00FF" />
//         <TouchableOpacity onPress={progresspage}><Ionicons name="flame" size={24} color="black" /></TouchableOpacity>

//       </View>

//         <Animated.View style={[styles.button, animatedButtonStyle]}>
//           <TouchableOpacity 
//             onPressIn={handlePressIn} 
//             onPressOut={handlePressOut} 
//             // onPress={() => console.log("Button Pressed")}
//           ><Text style={styles.buttonText}>START GAME</Text></TouchableOpacity>
//           </Animated.View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     width: '100%'
//   },
//   headerBar: {
//     width: '120%',
//     height: 200,
//     backgroundColor: '#2D1B3D',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderBottomLeftRadius: 200,
//     borderBottomRightRadius: 200,
//     position: 'absolute',
//     top: 0,
//   },
//   headerText: {
//     color: '#FF00FF',
//     fontSize: 28,
//     fontWeight: 'bold',
//     marginTop: '5%',
//     textShadowColor: '#FF00FF',
//     textShadowOffset: { width: 0, height: 0 },
//     textShadowRadius: 10,
//   },
//   userSection: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 10,
//     borderRadius: 15,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     marginTop: 10
//   },
//   profileImage: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: '#D3B3E5',
//   },
//   userInfo: {
//     marginLeft: 10,
//   },
//   username: {
//     fontSize: 16,
//     color: '#00FF00'
//   },
//   userStatus: {
//     fontSize: 12,
//     color: 'gray',
//   },
//   apiStatusContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 4,
//   },
//   statusDot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     marginRight: 6,
//   },
//   apiStatusText: {
//     fontSize: 10,
//     color: '#888',
//   },
//   testButton: {
//     marginLeft: 8,
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     backgroundColor: '#444',
//     borderRadius: 4,
//   },
//   testButtonText: {
//     fontSize: 8,
//     color: '#00FF00',
//   },
//   weightSection: {
//     marginTop: 100,
//     width: '80%'
//   },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 30,
//   },
//   label: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#FF00FF'
//   },
//   input: {
//     width: '40%',
//     height: 40,
//     borderRadius: 10,
//     backgroundColor: '#2D1B3D',
//     textAlign: 'center',
//     color: '#00FF00',
//     fontSize: 16,
//     borderWidth: 1,
//     borderColor: '#00FF00'
//   },
//   difficultyContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     width: '45%',
//   },
//   refreshButton: {
//     marginLeft: 8,
//     padding: 8,
//     borderRadius: 20,
//     backgroundColor: '#2D1B3D',
//     borderWidth: 1,
//     borderColor: '#00FF00',
//   },
//   recommendationInfo: {
//     backgroundColor: 'rgba(45, 27, 61, 0.3)',
//     padding: 12,
//     borderRadius: 8,
//     marginTop: 10,
//     borderWidth: 1,
//     borderColor: '#00FF00',
//   },
//   recommendationText: {
//     color: '#00FF00',
//     fontSize: 12,
//     textAlign: 'center',
//     fontStyle: 'italic',
//   },
//   debugInfo: {
//     backgroundColor: 'rgba(255, 0, 255, 0.1)',
//     padding: 8,
//     borderRadius: 4,
//     marginTop: 10,
//   },
//   debugText: {
//     color: '#FF00FF',
//     fontSize: 10,
//     textAlign: 'center',
//   },
//   dropdownContainer: {
//     width: '40%',
//     position: 'relative',
//   },
//   dropdownButton: {
//     height: 40,
//     borderRadius: 10,
//     backgroundColor: '#2D1B3D',
//     borderWidth: 1,
//     borderColor: '#00FF00',
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 10,
//   },
//   dropdownButtonText: {
//     color: '#00FF00',
//     fontSize: 14,
//     flex: 1,
//     textAlign: 'center',
//   },
//   dropdownOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     zIndex: 9998,
//   },
//   dropdownList: {
//     position: 'absolute',
//     top: '50%',
//     left: '50%',
//     transform: [{ translateX: -80 }, { translateY: -60 }],
//     width: 160,
//     backgroundColor: '#2D1B3D',
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: '#00FF00',
//     maxHeight: 150,
//     zIndex: 9999,
//     elevation: 20,
//   },
//   dropdownItem: {
//     padding: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#444',
//   },
//   dropdownItemText: {
//     color: '#00FF00',
//     fontSize: 14,
//     textAlign: 'center',
//   },
//   selectedItem: {
//     backgroundColor: '#444',
//   },
//   selectedItemText: {
//     color: '#FF00FF',
//     fontWeight: 'bold',
//   },
//   bottomNav: {
//     position: 'absolute',
//     bottom: 0,
//     width: '100%',
//     height: 70,
//     backgroundColor: '#2D1B3D',
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     alignItems: 'center',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//   },
//   homeIconContainer: {
//     backgroundColor: '#2D1B3D',
//     padding: 10,
//     borderRadius: 30,
//     marginBottom: 10,
//   },
//   button: {
//     backgroundColor: '#2D1B3D',
//     paddingVertical: 10,
//     width: '80%',
//     borderRadius: 10,
//     alignItems: 'center',
//     marginTop: 50,
//     borderWidth: 1,
//     borderColor: '#00FF00'
//   },
//   buttonText: {
//     color: '#FF00FF',
//     fontSize: 18,
//     fontWeight: 'bold',
//     textShadowColor: '#FF00FF',
//     textShadowOffset: { width: 0, height: 0 },
//     textShadowRadius: 10,
//   },
// });

// export default GameZone;