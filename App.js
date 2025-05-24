import { StatusBar } from 'expo-status-bar';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import bg from './assets/3.png';
import Navigator from './routes/homestack';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useState, useEffect } from 'react';

export default function App() {
  // const [user, setUser] = useState(null);
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   // Listen for authentication state changes
  //   const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
  //     setUser(currentUser);
  //     setLoading(false);
  //   });
  // return () => unsubscribe(); // Cleanup listener
  //   }, []);

  // if (loading) {
  //   return (
  //     <View style={styles.loaderContainer}>
  //       <ActivityIndicator size="large" color="#ffffff" />
  //     </View>
  //   );
  // }

  return (
    <ImageBackground source={bg} style={styles.background}>
      <View style={styles.overlay}>
        <Navigator/>
        <StatusBar style="auto" />
        </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  // container: {
  //   flex: 1,
  //   alignItems: 'center',
  //   justifyContent: 'center',
  // },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject, // Fills the entire background
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Black with 50% opacity
  },
});
