import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

const EditProfile = ({navigation}) => {
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
        navigation.goBack()
      };

      const back = () => {
        navigation.goBack();
      }

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={back}><Ionicons name="arrow-back" size={24} color="white" style={styles.backIcon} /></TouchableOpacity>
        <Text style={styles.headerText}>Edit Profile</Text>
      </View>
      
      <View style={styles.profileSection}>
        <View style={styles.profileImageContainer}>
          <Image source={{ uri: 'https://via.placeholder.com/100' }} style={styles.profileImage} />
          <Ionicons name="create-outline" size={24} color="black" style={styles.editIcon} />
        </View>
      </View>

        <Text style={styles.label}>Username</Text>
        <TextInput style={styles.input} value="Username_911" editable={false} />

      
      <View style={styles.row}>
        <View style={styles.column}>
          <Text style={styles.label}>Age:</Text>
          <TextInput style={styles.smallInput} value="21" editable={false} />
        </View>
        <View style={styles.columnGap}></View>
        <View style={styles.column}>
          <Text style={styles.label}>Gender:</Text>
          <TextInput style={styles.smallInput} value="Female" editable={false} />
        </View>
      </View>
      
      <View style={styles.row}>
        <View style={styles.column}>
          <Text style={styles.label}>Weight:</Text>
          <TextInput style={styles.smallInput} value="85 kg" editable={false} />
        </View>
        <View style={styles.columnGap}></View>
        <View style={styles.column}>
          <Text style={styles.label}>Height:</Text>
          <View style={styles.heightRow}>
            <TextInput style={styles.heightInput} value="4 ft" editable={false} />
            <TextInput style={styles.heightInput} value="9 in" editable={false} />
          </View>
        </View>
      </View>

      <Animated.View style={[styles.button, animatedButtonStyle]}>
        <TouchableOpacity 
          onPressIn={handlePressIn} 
          onPressOut={handlePressOut} 
          // onPress={() => console.log("Button Pressed")}
        >
          <Text style={styles.buttonText}>LET'S GO</Text>
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
        color: '#FF00FF', 
        fontSize: 24,
        fontWeight: 'bold',
        textShadowRadius: 10,
        paddingTop: '10%',
        textShadowColor: '#FF00FF',
        textShadowOffset: { width: 0, height: 0 },
      },
backIcon: {
position: 'absolute',
left: '-40%',
top: 40,
color: '#00FF00'
},
profileSection: {
alignItems: 'center',
marginBottom: 50,

},
profileImageContainer: {
position: 'relative',

},
profileImage: {
width: 100,
height: 100,
borderRadius: 50,
backgroundColor: '#2D1B3D',
borderWidth: 2,
borderColor: '#00FF00', // Neon green border for inputs
marginTop: '20%'
},
editIcon: {
position: 'absolute',
bottom: 5,
right: 5,
backgroundColor: 'white',
borderRadius: 12,
},
label: {
fontSize: 16,
fontWeight: 'bold',
marginTop: 15,
textAlign: 'left',
alignSelf: 'stretch',
color: '#FF00FF',
paddingBottom: 5
},
input: {
width: '100%',
height: 50,
borderRadius: 10,
backgroundColor: '#2D1B3D',
paddingHorizontal: 15,
color: 'white',
fontSize: 16,
borderWidth: 1,
borderColor: '#00FF00',
},
row: {
flexDirection: 'row',
alignItems: 'center',
marginTop: 15,
},
column: {
width: '45%',
},
columnGap: {
width: '10%',
},
smallInput: {
height: 40,
borderRadius: 10,
backgroundColor: '#2D1B3D',
textAlign: 'center',
color: 'white',
fontSize: 16,
borderWidth: 1,
borderColor: '#00FF00',
},
heightRow: {
flexDirection: 'row',
justifyContent: 'space-between',

},
heightInput: {
width: '48%',
height: 40,
borderRadius: 10,
backgroundColor: '#2D1B3D',
textAlign: 'center',
color: 'white',
fontSize: 16,
borderWidth: 1,
borderColor: '#00FF00',
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
    marginTop: '20%'
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

export default EditProfile;
