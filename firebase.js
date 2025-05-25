import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { browserLocalPersistence } from "firebase/auth";
import { getApp } from "firebase/app";
import { getApps } from "firebase/app";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {getReactNativePersistence} from 'firebase/auth';
import { initializeAuth } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyAgmcx349bMdRomHEInADTaAzMMER0JRVU",
  authDomain: "stepsync-34f05.firebaseapp.com",
  projectId: "stepsync-34f05",
  storageBucket: "stepsync-34f05.firebasestorage.app",
  messagingSenderId: "829398616350",
  appId: "1:829398616350:web:8af9986f28e6244022610f",
  measurementId: "G-5S22XN1C8X"
};


const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// const auth = getAuth(app);
// auth.setPersistence(browserLocalPersistence);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export {app, auth}