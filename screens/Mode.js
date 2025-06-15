import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, onValue, off, update } from 'firebase/database';

const { width } = Dimensions.get('window');

const PuzzleMode = ({navigation, route}) => {
  const [gameMode, setGameMode] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [gameStatus, setGameStatus] = useState('pending');
  const [sessionId, setSessionId] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(600);
  const [totalTime, setTotalTime] = useState(600);
  const [heartRate, setHeartRate] = useState(88);
  const [calories, setCalories] = useState(0);
  const [lives, setLives] = useState(3);
  
  const buttonScale = useSharedValue(1);
  const timeBar = useSharedValue(1.0);
  const timerRef = useRef(null);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
    backgroundColor: buttonScale.value === 1 ? '#2D1B3D' : '#00FF00',
  }));

  const timeBarStyle = useAnimatedStyle(() => ({
    width: `${timeBar.value * 100}%`,
  }));

  // Game mode display names
  const gameModeNames = {
    'btc': 'Beat The Clock',
    'memory': 'Memory Game',
    'mirror': 'Mirror Game'
  };

  // Time limits based on game mode and difficulty (in seconds)
  const getTimeLimit = (mode, diff) => {
    const timeLimits = {
      'btc': {
        'easy': 900,   // 15 minutes
        'medium': 600, // 10 minutes
        'hard': 300    // 5 minutes
      },
      'memory': {
        'easy': 1200,  // 20 minutes
        'medium': 900, // 15 minutes
        'hard': 600    // 10 minutes
      },
      'mirror': {
        'easy': 1800,  // 30 minutes
        'medium': 1200, // 20 minutes
        'hard': 900     // 15 minutes
      }
    };
    return timeLimits[mode]?.[diff] || 600;
  };

  // Calorie burn rate per minute based on game mode and difficulty
  const getCalorieRate = (mode, diff) => {
    const calorieRates = {
      'btc': {
        'easy': 4,   // Fast-paced clicking
        'medium': 7,
        'hard': 12
      },
      'memory': {
        'easy': 3,   // Mental activity (lighter)
        'medium': 5,
        'hard': 8
      },
      'mirror': {
        'easy': 6,   // Physical movement (highest)
        'medium': 10,
        'hard': 15
      }
    };
    return calorieRates[mode]?.[diff] || 5;
  };

  // Calculate calories based on time elapsed, game mode, and difficulty
  const calculateCalories = (timeElapsed, mode, difficulty) => {
    const minutesElapsed = timeElapsed / 60;
    const calorieRate = getCalorieRate(mode, difficulty);
    return Math.floor(minutesElapsed * calorieRate);
  };

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const db = getDatabase();
      const pendingSessionsRef = ref(db, 'pendingSessions');

      const unsubscribe = onValue(pendingSessionsRef, (snapshot) => {
        if (snapshot.exists()) {
          const sessions = snapshot.val();
          console.log('All pending sessions:', sessions);
          
          // Find the user's most recent session that's not completed
          const userSession = Object.entries(sessions).find(([id, session]) => {
            console.log(`Checking session ${id}:`, session);
            return session.userId === user.uid && 
                   (session.status === 'pending' || session.status === 'in_progress');
          });

          if (userSession) {
            const [id, session] = userSession;
            console.log('Found user session:', { id, session });
            
            setSessionId(id);
            setGameMode(session.gameMode);
            setDifficulty(session.difficulty);
            setGameStatus(session.status);
            
            console.log('Current game status:', session.status);
            
            const timeLimit = getTimeLimit(session.gameMode, session.difficulty);
            setTotalTime(timeLimit);
            
            // Reset everything when session is pending
            if (session.status === 'pending') {
              console.log('Session is pending - waiting for PC');
              setTimeRemaining(timeLimit);
              setCalories(0);
              timeBar.value = 1.0;
            }
            // Start timer when session becomes in_progress
            else if (session.status === 'in_progress') {
              console.log('Session is in progress - game should start');
              if (timeRemaining === timeLimit) {
                // First time starting, reset everything
                setTimeRemaining(timeLimit);
                setCalories(0);
                timeBar.value = 1.0;
              }
            }
          } else {
            console.log('No active session found for user:', user.uid);
            // No session found, go back
            Alert.alert('No Active Session', 'No game session found. Please start a new game.', [
              { text: 'OK', onPress: () => navigation.goBack() }
            ]);
          }
        } else {
          console.log('No pending sessions found');
        }
      });

      return () => {
        off(pendingSessionsRef);
      };
    }
  }, []);

  // Start game timer ONLY when status changes to 'in_progress'
  useEffect(() => {
    console.log('Game status effect triggered. Status:', gameStatus);
    
    if (gameStatus === 'in_progress' && !timerRef.current) {
      console.log('Status is in_progress and no timer running - STARTING TIMER');
      startGameTimer();
    } else if (gameStatus === 'pending' && timerRef.current) {
      console.log('Status is pending and timer running - STOPPING TIMER');
      clearInterval(timerRef.current);
      timerRef.current = null;
    } else if (gameStatus !== 'in_progress' && timerRef.current) {
      console.log('Status is not in_progress - STOPPING TIMER');
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gameStatus]); // Only depend on gameStatus

  const startGameTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeRemaining((prevTime) => {
        const newTime = prevTime - 1;
        
        // Update time bar animation
        timeBar.value = withTiming(newTime / totalTime, { duration: 1000 });
        
        // Update calories based on time elapsed (local calculation)
        const timeElapsed = totalTime - newTime;
        const currentCalories = calculateCalories(timeElapsed, gameMode, difficulty);
        setCalories(currentCalories);
        
        // Game over when time runs out
        if (newTime <= 0) {
          gameOver('time_up');
          return 0;
        }
        
        return newTime;
      });
    }, 1000);
  };

  const gameOver = async (reason) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Calculate final score based on time, game mode, and difficulty
    const timeUsed = totalTime - timeRemaining;
    
    // Different point systems for different game modes
    const getPointsPerSecond = (mode) => {
      switch(mode) {
        case 'btc': return 10;     // Beat the Clock: fast-paced
        case 'memory': return 8;   // Memory Game: moderate points
        case 'mirror': return 12;  // Mirror Game: highest points (physical)
        default: return 10;
      }
    };
    
    const baseScore = Math.floor(timeUsed * getPointsPerSecond(gameMode));
    const difficultyMultiplier = difficulty === 'hard' ? 3 : difficulty === 'medium' ? 2 : 1;
    const finalScore = baseScore * difficultyMultiplier;

    // Only save to Firebase if time ran out (natural game completion)
    // Let Unity handle the session when user stops manually
    if (reason === 'time_up' && sessionId) {
      const db = getDatabase();
      const sessionRef = ref(db, `pendingSessions/${sessionId}`);
      await update(sessionRef, {
        status: 'completed',
        score: finalScore,
        calories: calories,
        duration: (totalTime - timeRemaining) / 60 // duration in minutes
      });

      // Also save to user's sessions
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const userSessionRef = ref(db, `users/${user.uid}/sessions/${sessionId}`);
        await update(userSessionRef, {
          score: finalScore,
          gameMode: gameMode,
          difficulty: difficulty,
          timestamp: Math.floor(Date.now() / 1000),
          calories: calories,
          duration: (totalTime - timeRemaining) / 60
        });
      }
    }

    const message = reason === 'time_up' 
      ? `Time's up! Final Score: ${finalScore}` 
      : `Game stopped! Unity will handle the session.`;

    Alert.alert('Game Over', message, [
      {
        text: 'OK',
        onPress: () => navigation.goBack()
      }
    ]);
  };

  const handlePressIn = () => {
    buttonScale.value = withTiming(0.95, { duration: 100 });
  };

  const handlePressOut = () => {
    buttonScale.value = withTiming(1, { duration: 100 });
    
    if (gameStatus === 'in_progress') {
      // Stop the game
      gameOver('stopped');
    } else {
      // Go back if game hasn't started
      navigation.goBack();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getButtonText = () => {
    switch(gameStatus) {
      case 'pending':
        return 'WAITING FOR PC...';
      case 'in_progress':
        return 'STOP GAME';
      default:
        return 'BACK';
    }
  };

  const getStatusMessage = () => {
    const gameDisplayName = gameModeNames[gameMode] || 'Game';
    switch(gameStatus) {
      case 'pending':
        return `Waiting for ${gameDisplayName.toLowerCase()} to start on PC...`;
      case 'in_progress':
        return `${gameDisplayName} in progress!`;
      default:
        return `Ready to play ${gameDisplayName.toLowerCase()}!`;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.headerText}>
        {gameModeNames[gameMode] || 'Game Mode'}
      </Text>

      {/* Status Message */}
      <Text style={styles.statusText}>{getStatusMessage()}</Text>

      {/* Lives */}
      <View style={styles.livesContainer}>
        {[...Array(lives)].map((_, i) => (
          <Ionicons key={i} name="heart" size={32} color="#B44CD1" style={styles.heartIcon} />
        ))}
      </View>

      {/* Game Stats */}
      <View style={styles.statsContainer}>
        <StatCircle label="Heart Rate" value={heartRate.toString()} unit="bpm" />
        <StatCircle label="Calories" value={calories.toString()} unit="kcal" />

        <View style={styles.difficultyRow}>
          <Text style={styles.difficultyLabel}>Difficulty:</Text>
          <Text style={styles.difficultyValue}>{difficulty.toUpperCase()}</Text>
        </View>

        <Text style={styles.timeLabel}>Time Remaining:</Text>
        <Text style={styles.timeDisplay}>{formatTime(timeRemaining)}</Text>
        <View style={styles.timeBarContainer}>
          <Animated.View style={[styles.timeBarFill, timeBarStyle]} />
        </View>
      </View>

      {/* Action Button */}
      <Animated.View style={[styles.button, animatedButtonStyle]}>
        <TouchableOpacity
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={gameStatus === 'pending'}
        >
          <Text style={[
            styles.buttonText,
            gameStatus === 'pending' && styles.disabledButtonText
          ]}>
            {getButtonText()}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const StatCircle = ({ label, value, unit }) => {
  return (
    <View style={styles.circleStat}>
      <View style={styles.circle}>
        <Text style={styles.circleValue}>{value}</Text>
        <Text style={styles.circleUnit}>{unit}</Text>
      </View>
      <Text style={styles.circleLabel}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF00FF',
    marginBottom: 10,
    textShadowColor: '#FF00FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  statusText: {
    fontSize: 16,
    color: '#00FF00',
    marginBottom: 20,
    textAlign: 'center',
  },
  livesContainer: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  heartIcon: {
    marginHorizontal: 5,
  },
  statsContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  circleStat: {
    alignItems: 'center',
    marginBottom: 20,
  },
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#00FF00',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    backgroundColor: '#2D1B3D',
  },
  circleValue: {
    color: '#00FF00',
    fontSize: 24,
    fontWeight: 'bold',
  },
  circleUnit: {
    color: '#00FF00',
    fontSize: 12,
  },
  circleLabel: {
    color: '#FF00FF',
    fontSize: 14,
  },
  difficultyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 15,
  },
  difficultyLabel: {
    fontSize: 15,
    color: '#00FF00',
  },
  difficultyValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FF00FF',
  },
  timeLabel: {
    fontSize: 16,
    color: '#00FF00',
    marginBottom: 5,
  },
  timeDisplay: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF00FF',
    marginBottom: 10,
  },
  timeBarContainer: {
    width: '80%',
    height: 16,
    backgroundColor: '#2D1B3D',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#00FF00',
    marginBottom: 20,
  },
  timeBarFill: {
    height: '100%',
    backgroundColor: '#FF00FF',
    borderRadius: 10,
  },
  button: {
    paddingVertical: 15,
    width: '80%',
    borderWidth: 1,
    borderColor: '#00FF00',
    backgroundColor: '#2D1B3D',
    borderRadius: 10,
  },
  buttonText: {
    color: '#FF00FF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: '#FF00FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  disabledButtonText: {
    color: '#666',
  },
});

export default PuzzleMode;