import { ScrollView, StyleSheet, View, TouchableOpacity, Dimensions, SafeAreaView, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';
import { showNotification } from '@/components/CustomAlert';

const { width } = Dimensions.get('window');

const DetectionCard = ({ title, description, icon, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <LinearGradient
      colors={['#4CAF50', '#2E7D32']}
      style={styles.detectionCard}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.cardIcon}>
        <MaterialIcons name={icon} size={32} color="#FFFFFF" />
      </View>
      <ThemedText style={styles.cardTitle}>{title}</ThemedText>
      <ThemedText style={styles.cardDescription}>{description}</ThemedText>
      <MaterialIcons name="arrow-forward" size={24} color="#FFFFFF" />
    </LinearGradient>
  </TouchableOpacity>
);

const TipCard = ({ icon, tip }) => (
  <View style={styles.tipCard}>
    <View style={styles.tipIconContainer}>
      <MaterialIcons name={icon} size={24} color="#4CAF50" />
    </View>
    <ThemedText style={styles.tipText}>{tip}</ThemedText>
  </View>
);

export default function PestDetectionScreen() {
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const savePestDetection = async (predictionData) => {
    try {
   
      if (!user?.id) {
        console.log('Current user data:', user); 
        showNotification('error', 'User not properly authenticated');
        return;
      }

    
      const backendData = {
        farmerId: user.id, 
        pestName: predictionData.predicted_class || 'Unknown Pest',
        detectedLocation: user?.landLocation || 'Unknown Location',
        detectionDateTime: new Date().toISOString()
      };

      console.log('Sending data to backend:', backendData); 

      const response = await fetch('http://localhost:8083/api/pest-infestations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save to backend');
      }

      showNotification('success', 'Detection results saved successfully');
    } catch (error) {
      console.error('Error saving detection:', error);
      showNotification('error', 'Failed to save detection results');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'image',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        base64: true,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0]);
        setPrediction(null);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(
        'Error',
        'Failed to pick image. Please try again.'
      );
    }
  };

  const handleSubmit = async () => {
    if (!selectedImage) return;
    
    setLoading(true);
    try {
      const base64Data = selectedImage.base64;
      const imageBlob = await fetch(`data:image/jpeg;base64,${base64Data}`).then(r => r.blob());
      
      const formData = new FormData();
      formData.append('image', imageBlob, 'image.jpg');

      const apiResponse = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        throw new Error(`Server error: ${errorText}`);
      }

      const data = await apiResponse.json();
      setPrediction(data);
      
      await savePestDetection(data);
      
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to process image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView style={styles.container}>
        <LinearGradient
          colors={['#4CAF50', '#2E7D32']}
          style={styles.header}
        >
          <ThemedText style={styles.headerTitle}>Pest Detection</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Smart analysis for crop protection
          </ThemedText>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.mainActions}>
            <DetectionCard
              title="Quick Scan"
              description="Instant pest identification with your camera"
              icon="camera"
              onPress={() => {}}
            />
            <DetectionCard
              title="Upload Image"
              description="Analyze existing photos from your gallery"
              icon="photo-library"
              onPress={pickImage}
            />
          </View>

          {selectedImage && (
            <View style={styles.previewSection}>
              <Image 
                source={{ uri: selectedImage.uri }}
                style={styles.previewImage}
              />
              
              <TouchableOpacity 
                style={[
                  styles.submitButton,
                  loading && styles.submitButtonDisabled
                ]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <ThemedText style={styles.submitButtonText}>
                  {loading ? 'Analyzing...' : 'Analyze Image'}
                </ThemedText>
              </TouchableOpacity>

              {prediction && prediction.success && (
                <View style={styles.predictionResult}>
                  <MaterialIcons name="check-circle" size={32} color="#4CAF50" />
                  <ThemedText style={styles.predictionText}>
                    Class {prediction.predicted_class}
                  </ThemedText>
                  <ThemedText style={styles.predictionDescription}>
                    Analysis completed successfully
                  </ThemedText>
                </View>
              )}
            </View>
          )}

          <View style={styles.statsSection}>
            <View style={styles.statCard}>
              <MaterialIcons name="bug-report" size={24} color="#4CAF50" />
              <ThemedText style={styles.statValue}>127</ThemedText>
              <ThemedText style={styles.statLabel}>Pests Detected</ThemedText>
            </View>
            <View style={styles.statCard}>
              <MaterialIcons name="history" size={24} color="#4CAF50" />
              <ThemedText style={styles.statValue}>45</ThemedText>
              <ThemedText style={styles.statLabel}>Scans This Month</ThemedText>
            </View>
          </View>

          <View style={styles.tipsSection}>
            <ThemedText style={styles.sectionTitle}>Detection Tips</ThemedText>
            <View style={styles.tipsContainer}>
              <TipCard
                icon="wb-sunny"
                tip="Take photos in good lighting conditions"
              />
              <TipCard
                icon="center-focus-strong"
                tip="Keep camera steady and close to affected area"
              />
              <TipCard
                icon="crop-free"
                tip="Include both healthy and affected parts"
              />
            </View>
          </View>

          <View style={styles.recentSection}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>Recent Detections</ThemedText>
              <TouchableOpacity>
                <ThemedText style={styles.seeAllText}>See All</ThemedText>
              </TouchableOpacity>
            </View>
      
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#4CAF50',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: StatusBar.currentHeight || 44,
    padding: 20,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  content: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  mainActions: {
    padding: 20,
    gap: 15,
  },
  detectionCard: {
    padding: 20,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 15,
  },
  cardDescription: {
    color: '#FFFFFF',
    opacity: 0.8,
    fontSize: 14,
    flex: 2,
  },
  statsSection: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
  },
  tipsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  tipsContainer: {
    gap: 10,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  tipIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
  },
  recentSection: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seeAllText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  previewSection: {
    padding: 20,
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 15,
  },
  predictionResult: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  predictionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  predictionDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginVertical: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  submitButtonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 