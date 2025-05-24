// Import the functions you need from the SDKs you need
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { initializeAuth} from "firebase/auth";
import { getReactNativePersistence } from 'firebase/auth';
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAgmcx349bMdRomHEInADTaAzMMER0JRVU",
  authDomain: "stepsync-34f05.firebaseapp.com",
  projectId: "stepsync-34f05",
  storageBucket: "stepsync-34f05.firebasestorage.app",
  messagingSenderId: "829398616350",
  appId: "1:829398616350:web:8af9986f28e6244022610f",
  measurementId: "G-5S22XN1C8X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
// const analytics = getAnalytics(app);

export {auth, app}