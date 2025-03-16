import { createContext, useContext, useState, useEffect } from 'react';
import { router } from 'expo-router';
import { auth, provider } from '@/config/firebase';
import { signInWithPopup, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { Alert } from 'react-native';
import { showNotification } from '@/components/CustomAlert';
import * as ImagePicker from 'expo-image-picker';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  const fetchUserProfile = async (userId) => {
    try {
      const response = await fetch(`http://localhost:8083/auth/user/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch user profile');
      const profileData = await response.json();
      setUserProfile(profileData);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const signIn = async (email, password) => {
    try {
      const response = await fetch('http://localhost:8083/auth/login', {
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
        const profileResponse = await fetch(`http://localhost:8083/auth/user/${data.userId}`);
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
      const response = await fetch('http://localhost:8083/auth/signup', {
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
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Google Sign-In Error:', error);
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
          const profileResponse = await fetch(`http://localhost:8083/auth/user/${user.id}`);
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