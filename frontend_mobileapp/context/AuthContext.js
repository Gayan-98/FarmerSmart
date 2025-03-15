import { createContext, useContext, useState } from 'react';
import { router } from 'expo-router';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const signIn = async (email, password) => {
    // Add your sign in logic here
    // For demo, we'll just simulate a successful login
    setUser({ email });
    router.replace('/(tabs)');
  };

  const signUp = async (email, password, name) => {
    // Add your sign up logic here
    // For demo, we'll just simulate a successful registration
    setUser({ email, name });
    router.replace('/(tabs)');
  };

  const signOut = () => {
    setUser(null);
    router.replace('/(auth)/login');
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 