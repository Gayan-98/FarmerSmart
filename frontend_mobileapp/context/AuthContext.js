import { createContext, useContext, useState, useEffect } from 'react';
import { router } from 'expo-router';
import { auth, provider } from '@/config/firebase';
import { signInWithPopup, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { Alert } from 'react-native';
import { showNotification } from '@/components/CustomAlert';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const signIn = async (email, password) => {
    try {
      const response = await fetch('http://localhost:8083/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        }),
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (!response.ok) {
        showNotification('error', data.message || 'Invalid credentials');
        return;
      }

      // Store complete user data with the correct ID field
      const userData = {
        ...data,
        id: data.id,  // Changed from _id to id
        username: data.username,
        email: data.email,
        role: data.role,
        firstName: data.firstName,
        lastName: data.lastName,
        landLocation: data.landLocation
      };

      showNotification('success', 'Welcome back! Login successful.');
      setTimeout(() => {
        setUser(userData);
        router.replace('/(tabs)');
      }, 1500);

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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/login');
      }
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 