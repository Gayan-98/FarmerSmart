import { View, StyleSheet, TouchableOpacity, TextInput, Dimensions, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useState } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;
const normalize = (size) => Math.round(scale * size);

const CommonFields = ({ formData, updateFormData, showPassword, setShowPassword }) => (
  <>
    <View style={styles.inputContainer}>
      <MaterialIcons name="person" size={normalize(20)} color="#666" />
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={formData.username}
        onChangeText={(value) => updateFormData('username', value)}
        placeholderTextColor="#666"
      />
    </View>

    <View style={styles.inputContainer}>
      <MaterialIcons name="email" size={normalize(20)} color="#666" />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={formData.email}
        onChangeText={(value) => updateFormData('email', value)}
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
        value={formData.password}
        onChangeText={(value) => updateFormData('password', value)}
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

    <View style={styles.inputContainer}>
      <MaterialIcons name="lock" size={normalize(20)} color="#666" />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={formData.confirmPassword}
        onChangeText={(value) => updateFormData('confirmPassword', value)}
        secureTextEntry={!showPassword}
        placeholderTextColor="#666"
      />
    </View>

    <View style={styles.inputContainer}>
      <MaterialIcons name="person" size={normalize(20)} color="#666" />
      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={formData.firstName}
        onChangeText={(value) => updateFormData('firstName', value)}
        placeholderTextColor="#666"
      />
    </View>

    <View style={styles.inputContainer}>
      <MaterialIcons name="person" size={normalize(20)} color="#666" />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={formData.lastName}
        onChangeText={(value) => updateFormData('lastName', value)}
        placeholderTextColor="#666"
      />
    </View>

    <View style={styles.inputContainer}>
      <MaterialIcons name="phone" size={normalize(20)} color="#666" />
      <TextInput
        style={styles.input}
        placeholder="Contact Number"
        value={formData.contactNumber}
        onChangeText={(value) => updateFormData('contactNumber', value)}
        keyboardType="phone-pad"
        placeholderTextColor="#666"
      />
    </View>
  </>
);

const FarmerFields = ({ formData, updateFormData }) => (
  <>
    <View style={styles.inputContainer}>
      <MaterialIcons name="landscape" size={normalize(20)} color="#666" />
      <TextInput
        style={styles.input}
        placeholder="Land Size (in acres)"
        value={formData.landSize}
        onChangeText={(value) => updateFormData('landSize', value)}
        keyboardType="numeric"
        placeholderTextColor="#666"
      />
    </View>

    <View style={styles.inputContainer}>
      <MaterialIcons name="location-on" size={normalize(20)} color="#666" />
      <TextInput
        style={styles.input}
        placeholder="Land Location"
        value={formData.landLocation}
        onChangeText={(value) => updateFormData('landLocation', value)}
        placeholderTextColor="#666"
      />
    </View>
  </>
);

const ExpertFields = ({ formData, updateFormData }) => (
  <>
    <View style={styles.inputContainer}>
      <MaterialIcons name="location-city" size={normalize(20)} color="#666" />
      <TextInput
        style={styles.input}
        placeholder="Assigned Area"
        value={formData.assignedArea}
        onChangeText={(value) => updateFormData('assignedArea', value)}
        placeholderTextColor="#666"
      />
    </View>

    <View style={styles.inputContainer}>
      <MaterialIcons name="work" size={normalize(20)} color="#666" />
      <TextInput
        style={styles.input}
        placeholder="Designation"
        value={formData.designation}
        onChangeText={(value) => updateFormData('designation', value)}
        placeholderTextColor="#666"
      />
    </View>
  </>
);

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    contactNumber: '',
    // Farmer specific fields
    landSize: '',
    landLocation: '',
    // Expert specific fields
    assignedArea: '',
    designation: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!selectedRole) {
      Alert.alert('Error', 'Please select a role');
      return;
    }

    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const registrationData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: selectedRole,
        firstName: formData.firstName,
        lastName: formData.lastName,
        contactNumber: formData.contactNumber,
        registrationDate: new Date().toISOString().split('T')[0],
        ...(selectedRole === 'FARMER' ? {
          landSize: formData.landSize,
          landLocation: formData.landLocation,
        } : {
          assignedArea: formData.assignedArea,
          designation: formData.designation,
        }),
      };

      await signUp(registrationData);
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView>
        <LinearGradient colors={['#4CAF50', '#2E7D32']} style={styles.background}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={normalize(24)} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.content}>
            <View style={styles.header}>
              <ThemedText style={styles.title}>Create Account</ThemedText>
              <ThemedText style={styles.subtitle}>Select your role to get started</ThemedText>
            </View>

            <View style={styles.roleSelection}>
              <TouchableOpacity 
                style={[styles.roleButton, selectedRole === 'FARMER' && styles.roleButtonSelected]}
                onPress={() => setSelectedRole('FARMER')}
              >
                <MaterialIcons name="agriculture" size={normalize(24)} color={selectedRole === 'FARMER' ? '#FFFFFF' : '#4CAF50'} />
                <ThemedText style={[styles.roleButtonText, selectedRole === 'FARMER' && styles.roleButtonTextSelected]}>Farmer</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.roleButton, selectedRole === 'EXPERT' && styles.roleButtonSelected]}
                onPress={() => setSelectedRole('EXPERT')}
              >
                <MaterialIcons name="psychology" size={normalize(24)} color={selectedRole === 'EXPERT' ? '#FFFFFF' : '#4CAF50'} />
                <ThemedText style={[styles.roleButtonText, selectedRole === 'EXPERT' && styles.roleButtonTextSelected]}>Expert</ThemedText>
              </TouchableOpacity>
            </View>

            {selectedRole && (
              <View style={styles.form}>
                {/* Common Fields */}
                <CommonFields 
                  formData={formData} 
                  updateFormData={updateFormData}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                />

                {/* Role Specific Fields */}
                {selectedRole === 'FARMER' ? (
                  <FarmerFields formData={formData} updateFormData={updateFormData} />
                ) : (
                  <ExpertFields formData={formData} updateFormData={updateFormData} />
                )}

                <TouchableOpacity 
                  style={[styles.registerButton, loading && styles.registerButtonDisabled]}
                  onPress={handleRegister}
                  disabled={loading}
                >
                  <ThemedText style={styles.registerButtonText}>
                    {loading ? 'Creating Account...' : 'Sign Up'}
                  </ThemedText>
                </TouchableOpacity>

                {/* Add divider */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <ThemedText style={styles.dividerText}>OR</ThemedText>
                  <View style={styles.dividerLine} />
                </View>

                {/* Add sign in button */}
                <TouchableOpacity 
                  style={styles.signInButton}
                  onPress={() => router.push('/(auth)/login')}
                >
                  <ThemedText style={styles.signInButtonText}>
                    Already have an account? Sign In
                  </ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </LinearGradient>
      </ScrollView>
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
  backButton: {
    position: 'absolute',
    top: normalize(50),
    left: normalize(20),
    zIndex: 1,
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
  },
  subtitle: {
    fontSize: normalize(16),
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: normalize(8),
  },
  roleSelection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: normalize(20),
  },
  roleButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(10),
    padding: normalize(10),
    alignItems: 'center',
  },
  roleButtonSelected: {
    backgroundColor: '#4CAF50',
  },
  roleButtonText: {
    color: '#666',
    fontSize: normalize(14),
  },
  roleButtonTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
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
  registerButton: {
    backgroundColor: '#4CAF50',
    borderRadius: normalize(10),
    padding: normalize(15),
    alignItems: 'center',
    marginTop: normalize(10),
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: normalize(16),
    fontWeight: 'bold',
  },
  registerButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.7,
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
  signInButton: {
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: normalize(10),
    padding: normalize(15),
    alignItems: 'center',
    marginTop: normalize(10),
  },
  signInButtonText: {
    color: '#4CAF50',
    fontSize: normalize(16),
    fontWeight: '500',
  },
}); 