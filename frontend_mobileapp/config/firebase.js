import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyD5GdW3VPCnfaE0H5TWJ-Je-QSNHosHtPA",
  authDomain: "farmer-smart.firebaseapp.com",
  projectId: "farmer-smart",
  storageBucket: "farmer-smart.appspot.com",
  messagingSenderId: "800988493793",
  appId: "1:800988493793:web:87b26fd82762158e55c4a0",
  measurementId: "G-FE1845T20G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Set up auth (platform agnostic)
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, provider, db, storage }; 