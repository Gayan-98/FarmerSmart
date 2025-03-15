import { createContext, useContext, useState, useEffect } from 'react';
import { router } from 'expo-router';
import { auth, provider } from '@/config/firebase';
import { signInWithPopup, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { Alert } from 'react-native';

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
        Alert.alert(
          'Login Failed',
          data.message || 'Invalid credentials. Please try again.',
          [{ text: 'OK' }]
        );
        return;
      }

      setUser(data);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Login Error:', error);
      Alert.alert(
        'Connection Error',
        'Unable to connect to server. Please check your internet connection.',
        [{ text: 'OK' }]
      );
    }
  };

  const signUp = async (email, password, name) => {
    try {
      const response = await fetch('http://localhost:8083/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        credentials: 'include',
        body: JSON.stringify({
          username: name,
          email: email,
          password: password,
          role: 'FARMER'
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      console.log('Registration response:', data);
      
      setUser({
        id: data.id,
        username: data.username,
        email: data.email,
        role: data.role
      });
      
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