import { createContext, useContext, useState, useEffect } from 'react';
import { router } from 'expo-router';
import { auth, provider } from '@/config/firebase';
import { 
  signInWithPopup, 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  signInWithCredential,
  GoogleAuthProvider 
} from 'firebase/auth';
import { Alert, Platform } from 'react-native';
import { showNotification } from '@/components/CustomAlert';
import * as ImagePicker from 'expo-image-picker';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

// Use 10.0.2.2 for Android emulator, localhost for web, and computer's IP for physical device
const API_BASE_URL = Platform.select({
  android: __DEV__ ? 'http://10.0.2.2:8083' : 'http://192.168.142.99:8083',
  ios: __DEV__ ? 'http://localhost:8083' : 'http://192.168.142.99:8083',
  web: 'http://localhost:8083'
});

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  // Configure Google Auth Request
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: 'REPLACE_WITH_YOUR_EXPO_CLIENT_ID',
    androidClientId: '800988493793-4mmgqqrcddg6lp7h3v8i2gmhgtl36mam.apps.googleusercontent.com',
    webClientId: '800988493793-4mmgqqrcddg6lp7h3v8i2gmhgtl36mam.apps.googleusercontent.com',
  });

  const fetchUserProfile = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/user/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch user profile');
      const profileData = await response.json();
      setUserProfile(profileData);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const signIn = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        showNotification('error', data.message || 'Invalid credentials');
        return;
      }

      // Store the user ID from login response
      const userData = {
        id: data.userId,
        username: data.username,
        role: data.role
      };
      setUser(userData);

      // Fetch user profile using the ID from login response
      if (data.id) {
        const profileResponse = await fetch(`${API_BASE_URL}/auth/user/${data.userId}`);
        if (!profileResponse.ok) {
          throw new Error('Failed to fetch user profile');
        }
        const profileData = await profileResponse.json();
        setUserProfile(profileData);
      }

      showNotification('success', 'Welcome back! Login successful.');
      router.replace('/(tabs)');

    } catch (error) {
      console.error('Login Error:', error);
      showNotification('error', 'Unable to connect to server');
    }
  };

  const signUp = async (registrationData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      console.log('Registration response:', data);
      setUser(data);
      Alert.alert('Success', 'Registration successful!');
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Registration Error:', error);
      Alert.alert('Registration Failed', error.message || 'Please try again');
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      if (Platform.OS === 'web') {
        // Web implementation
        const result = await signInWithPopup(auth, provider);
        setUser(result.user);
        router.replace('/(tabs)');
      } else {
        // Mobile implementation
        const result = await promptAsync();
        
        if (result.type === 'success') {
          const { id_token } = result.params;
          const credential = GoogleAuthProvider.credential(id_token);
          const userCredential = await signInWithCredential(auth, credential);
          setUser(userCredential.user);
          router.replace('/(tabs)');
        }
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      showNotification('error', 'Google Sign-In failed');
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Sign Out Error:', error);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        if (user?.id) {
          const profileResponse = await fetch(`${API_BASE_URL}/auth/user/${user.id}`);
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            setUserProfile(profileData);
            router.replace('/(tabs)');
          } else {
            setUser(null);
            setUserProfile(null);
            router.replace('/(auth)/login');
          }
        } else {
          router.replace('/(auth)/login');
        }
      } catch (error) {
        console.error('Session check error:', error);
        router.replace('/(auth)/login');
      }
    };

    checkUser();
  }, [user?.id]);

  return (
    <AuthContext.Provider value={{ user, userProfile, signIn, signUp, signOut, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 