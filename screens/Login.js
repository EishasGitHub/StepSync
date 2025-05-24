import React from 'react';
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
// import { signInWithEmailAndPassword } from 'firebase/auth';
// import { getAuth } from 'firebase/auth';
// import { app } from '../firebase';

const Login = ({navigation}) => {
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
    // navigation.push('home');
  };

  const fp = () => {
    navigation.push('forgotpassword');
  }

  const register = () => {
    navigation.push('register');
  }
  
  const [passwordState, setPasswordState] = useState(true);
  const [user, setUser] = useState({Email: ''});
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // const handleLogin = async () => {
  //   user.Email = email;
  //   const auth = getAuth(app);
  //   await signInWithEmailAndPassword(auth, email, password)

  //   .then(() => {
  //     navigation.navigate('home',user);
  //   })

  //   .catch(error => {
  //     Alert.alert('Error', 'Incorrect email or password',
  //       [
  //         {
  //           text: 'Try Again'
  //         }
  //       ]
  //     );
  //   });
  // }

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.headerText}>Step Sync</Text>
      </View>
      
      <Text style={styles.title}>LOGIN</Text>
      <Text style={styles.subtitle}>Join the fitness revolution!</Text>
      
      <Text style={styles.label}>Email:</Text>
      <TextInput style={styles.input} placeholder="Enter your email address" placeholderTextColor="#ddd" onChangeText={text => setEmail(text)} value={email}/>
      
      <Text style={styles.label}>PASSWORD:</Text>
      <TextInput style={styles.input} placeholder="Enter your password" placeholderTextColor="#ddd" secureTextEntry onChangeText={text => setPassword(text)} value={password}/>
    
      <View style={styles.fpcontainer}>  
        <TouchableOpacity onPress={fp}><Text style={styles.fp}>Forgot Password?</Text></TouchableOpacity>

        <Text style={styles.fp}>Don't have an account? 
        <TouchableOpacity onPress={register}><Text style={styles.link}>Register</Text></TouchableOpacity>
        </Text>
        
      </View>  
      
      <Animated.View style={[styles.button, animatedButtonStyle]}>
        <TouchableOpacity 
          onPressIn={handlePressIn} 
          onPressOut={handlePressOut}
          // onPress={handleLogin}
          // onPress={() => console.log("Button Pressed")}
        >
          <Text style={styles.buttonText} title='Login'>LET'S GO</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: 'transparent', // Dark background for neon effect
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    width: '100%',
    backgroundColor: 'transparent'
  },
  headerBar: {
    width: '120%',
    height: 100,
    backgroundColor: '#2D1B3D',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    position: 'absolute',
    top: -1,
    borderWidth: 1,
    borderColor: '#00FF00', // Neon green border
    shadowColor: '#00FF00',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  headerText: {
    color: '#00FF00', // Neon green text
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: '#00FF00',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    paddingTop: '10%'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FF00FF', // Neon pink color for title
    textShadowColor: '#FF00FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    marginTop: '20%'
  },
  subtitle: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    marginBottom: 50,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginBottom: 10,
    color: '#00FF00', // Neon green for labels
  },
  input: {
    width: '100%',
    height: 50,
    borderRadius: 10,
    backgroundColor: '#2D1B3D',
    paddingHorizontal: 15,
    color: 'white',
    marginBottom: 30,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#00FF00', // Neon green border for inputs
  },
    button: {
        paddingVertical: 15,
        width: '50%',
        borderWidth: 1,
        borderColor: '#00FF00', // Neon green border for inputs
        paddingHorizontal: 15,
        backgroundColor: '#2D1B3D',
        height: 'auto',
        borderRadius: 10,
        marginTop: '10%'
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
    fp: {
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        color: 'grey'
      },
    link: {
        textDecorationLine: 'underline',
        color: '#00FF00'
      },
    fpcontainer: {
        marginTop: 40,
      }
})

export default Login;