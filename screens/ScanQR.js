import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Button, TouchableOpacity, Alert } from "react-native";
import { Camera, CameraView } from "expo-camera";
import { AntDesign } from "@expo/vector-icons";

export default function QRScan({navigation}) {
    const [facing, setFacing] = useState("back");
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    const [scannedData, setScannedData] = useState("");
    const [scanEnabled, setScanEnabled] = useState(false);

    useEffect(() => {
        const getCameraPermissions = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === "granted");
        };
        getCameraPermissions();
    }, []);


    const handleBarcodeScanned = ({ type, data }) => {
    if (scanEnabled) {  // Ensures QR scanning only works when enabled
        setScanned(true);
        setScannedData(data);
        
        // Log scanned data to the terminal
        console.log("QR Code Scanned!");
        console.log(`Type: ${type}`);
        console.log(`Data: ${data}`);
        
        // Disable scanning after one scan
        setScanEnabled(false);
        
        // Navigate back immediately after scanning
        navigation.push('gamezone');
    }
    };

    const toggleScan = () => {
        setScanEnabled((prev) => !prev); // Toggle scan state only when button is pressed
    };

    if (hasPermission === null) {
        return <Text>Requesting camera permission...</Text>;
    }
    if (hasPermission === false) {
        return (
        <View style={styles.noPermissionContainer}>
            <Text>No access to camera</Text>
            <Button title="Grant Permission" onPress={() => Camera.requestCameraPermissionsAsync()} />
        </View>
        );
    }

    return (
        <View style={styles.Page}>
        <View style={styles.Header}></View>

        <CameraView
            style={{ flex: 1 }}
            facing={facing}
            onBarcodeScanned={scanEnabled && !scanned ? handleBarcodeScanned : undefined}
            barcodeScannerSettings={{ barcodeTypes: ["qr", "pdf417"] }}
        />

        <View style={styles.bottom}>
            <View style={styles.elipse1}>
            <TouchableOpacity onPress={toggleScan}>
                <AntDesign name="search1" size={40} color={scanEnabled ? "#00FF00" : "#FF00FF"} />
            </TouchableOpacity>
            </View>
        </View>
        </View>
    );
}

const styles = StyleSheet.create({
  Page: {
    height: "100%",
    flex: 1,
    justifyContent: "center",
  },

  Header: {
    width: "100%",
    height: 100,
    backgroundColor: "#2D1B3D",
  },

  settings: {
    marginTop: 40,
    marginLeft: 15,
  },

  bottom: {
    flexDirection: "row",
    backgroundColor: "#2D1B3D",
    height: "20%",
    width: "100%",
    justifyContent: "center", 
  },

  elipse1: {
    backgroundColor: "#2D1B3D",
    width: 100,
    height: 100,
    borderRadius: 100,
    alignSelf: "center", 
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 5,
    borderColor: '#FF00FF'
  },

  noPermissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});