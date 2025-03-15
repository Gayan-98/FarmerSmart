import { View, StyleSheet, TouchableOpacity, TextInput, Dimensions, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useState } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;

const normalize = (size) => Math.round(scale * size);

export default function LoginScreen() {
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    signIn(email, password);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={['#4CAF50', '#2E7D32']}
        style={styles.background}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <MaterialIcons name="eco" size={normalize(60)} color="#FFFFFF" />
            <ThemedText style={styles.title}>Welcome Back</ThemedText>
            <ThemedText style={styles.subtitle}>Login to your account</ThemedText>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <MaterialIcons name="email" size={normalize(20)} color="#666" />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons name="lock" size={normalize(20)} color="#666" />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor="#666"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <MaterialIcons 
                  name={showPassword ? "visibility" : "visibility-off"} 
                  size={normalize(20)} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <ThemedText style={styles.forgotPasswordText}>Forgot Password?</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <ThemedText style={styles.loginButtonText}>Login</ThemedText>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <ThemedText style={styles.dividerText}>OR</ThemedText>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity 
              style={styles.googleButton}
              onPress={signInWithGoogle}
            >
              <Image 
                source={require('@/assets/images/google-logo.png')} 
                style={styles.googleIcon}
              />
              <ThemedText style={styles.googleButtonText}>
                Sign in with Google
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.registerButton}
              onPress={() => router.push('/(auth)/register')}
            >
              <ThemedText style={styles.registerButtonText}>Create New Account</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: normalize(20),
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: normalize(40),
  },
  title: {
    fontSize: normalize(32),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: normalize(20),
  },
  subtitle: {
    fontSize: normalize(16),
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: normalize(8),
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(20),
    padding: normalize(20),
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: normalize(10),
    marginBottom: normalize(15),
    padding: normalize(12),
  },
  input: {
    flex: 1,
    marginLeft: normalize(10),
    fontSize: normalize(16),
    color: '#333',
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginBottom: normalize(20),
  },
  forgotPasswordText: {
    color: '#4CAF50',
    fontSize: normalize(14),
  },
  loginButton: {
    backgroundColor: '#4CAF50',
    borderRadius: normalize(10),
    padding: normalize(15),
    alignItems: 'center',
    marginBottom: normalize(20),
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: normalize(16),
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: normalize(20),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: normalize(10),
    color: '#666',
  },
  registerButton: {
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: normalize(10),
    padding: normalize(15),
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#4CAF50',
    fontSize: normalize(16),
    fontWeight: '500',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(10),
    padding: normalize(15),
    marginBottom: normalize(15),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  googleIcon: {
    width: normalize(24),
    height: normalize(24),
    marginRight: normalize(10),
  },
  googleButtonText: {
    color: '#333333',
    fontSize: normalize(16),
    fontWeight: '500',
  },
}); 