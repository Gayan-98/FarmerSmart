import { ScrollView, StyleSheet, View, TouchableOpacity, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';

const WeedDetectionCard = ({ title, description, icon, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <LinearGradient
      colors={['#2196F3', '#1976D2']}
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

export default function WeedDetectionScreen() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#151718' : '#F5F5F5';

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'image',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0]);
        setPrediction(null);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <LinearGradient
        colors={['#2196F3', '#1976D2']}
        style={styles.header}
      >
        <ThemedText style={styles.headerTitle}>Weed Detection</ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Identify and analyze weed seeds in your crops
        </ThemedText>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.mainActions}>
          <WeedDetectionCard
            title="Quick Scan"
            description="Instant weed seed detection with your camera"
            icon="camera"
            onPress={() => {}}
          />
          <WeedDetectionCard
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
              style={[styles.analyzeButton, { backgroundColor: '#2196F3' }]}
              onPress={() => {}}
            >
              <ThemedText style={styles.analyzeButtonText}>
                Analyze Image
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.tipsSection}>
          <ThemedText style={styles.sectionTitle}>Detection Tips</ThemedText>
          <View style={styles.tipCard}>
            <MaterialIcons name="wb-sunny" size={24} color="#2196F3" />
            <ThemedText style={styles.tipText}>
              Take photos in good lighting conditions
            </ThemedText>
          </View>
          <View style={styles.tipCard}>
            <MaterialIcons name="center-focus-strong" size={24} color="#2196F3" />
            <ThemedText style={styles.tipText}>
              Keep camera steady and close to the seeds
            </ThemedText>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
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
    padding: 20,
  },
  mainActions: {
    gap: 15,
  },
  detectionCard: {
    padding: 20,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
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
  previewSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 15,
  },
  analyzeButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  analyzeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tipsSection: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  tipText: {
    marginLeft: 15,
    flex: 1,
    fontSize: 14,
  },
}); 