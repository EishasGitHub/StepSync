import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const PuzzleMode = ({navigation}) => {
  const buttonScale = useSharedValue(1);
  const progress = useSharedValue(0.6); // 60% progress for example
  const timeBar = useSharedValue(0.8); // 80% of time remaining

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
    backgroundColor: buttonScale.value === 1 ? '#2D1B3D' : '#00FF00',
  }));

  const timeBarStyle = useAnimatedStyle(() => ({
    width: `${timeBar.value * 100}%`,
  }));

  const handlePressIn = () => {
    buttonScale.value = withTiming(0.95, { duration: 100 });
  };

  const handlePressOut = () => {
    buttonScale.value = withTiming(1, { duration: 100 });
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.headerText}>PUZZLE MODE</Text>

      {/* Lives */}
      <View style={styles.livesContainer}>
        {[...Array(3)].map((_, i) => (
          <Ionicons key={i} name="heart" size={32} color="#B44CD1" style={styles.heartIcon} />
        ))}
      </View>

      {/* Game Stats */}
      <View style={styles.statsContainer}>
        <StatCircle label="Heart Rate" value="88" unit="bpm" />
        <StatCircle label="Calories" value="45" unit="kcal" />

        <View style={styles.difficultyRow}>
          <Text style={styles.difficultyLabel}>Difficulty:</Text>
          <Text style={styles.difficultyValue}>EASY</Text>
        </View>

        <Text style={styles.timeLabel}>Time Remaining:</Text>
        <View style={styles.timeBarContainer}>
          <Animated.View style={[styles.timeBarFill, timeBarStyle]} />
        </View>
      </View>

      {/* LET'S GO Button */}
      <Animated.View style={[styles.button, animatedButtonStyle]}>
        <TouchableOpacity
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() => console.log("Game Started")}
        >
          <Text style={styles.buttonText}>STOP</Text>
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
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF00FF',
    marginBottom: 30,
    textShadowColor: '#FF00FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  livesContainer: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  heartIcon: {
    marginHorizontal: 5,
  },
  statsContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  circleStat: {
    alignItems: 'center',
    marginBottom: 25,
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
    marginBottom: 20,
    marginTop: 10
  },
  difficultyLabel: {
    fontSize: 15,
    color: '#00FF00',
  },
  difficultyValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FF00FF',
    marginBottom: 20
  },
  timeLabel: {
    fontSize: 16,
    color: '#00FF00',
    marginBottom: 8,
  },
  timeBarContainer: {
    width: '80%',
    height: 16,
    backgroundColor: '#2D1B3D',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#00FF00',
  },
  timeBarFill: {
    height: '100%',
    backgroundColor: '#FF00FF',
    borderRadius: 10,
  },
  button: {
    paddingVertical: 15,
    width: '100%',
    borderWidth: 1,
    borderColor: '#00FF00',
    paddingHorizontal: 100,
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
});

export default PuzzleMode;
