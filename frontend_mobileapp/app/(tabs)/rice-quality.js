import { ScrollView, StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';

const QualityCard = ({ title, description, icon, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <LinearGradient
      colors={['#FF6B6B', '#EE5253']}
      style={styles.qualityCard}
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

export default function RiceQualityScreen() {
  const [selectedImage, setSelectedImage] = useState(null);
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
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <LinearGradient
        colors={['#FF6B6B', '#EE5253']}
        style={styles.header}
      >
        <ThemedText style={styles.headerTitle}>Rice Quality Check</ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Advanced analysis for rice quality assessment
        </ThemedText>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.mainActions}>
          <QualityCard
            title="Quick Scan"
            description="Instant rice quality analysis with your camera"
            icon="camera"
            onPress={() => {}}
          />
          <QualityCard
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
              style={styles.analyzeButton}
              onPress={() => {}}
            >
              <ThemedText style={styles.analyzeButtonText}>
                Analyze Quality
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <MaterialIcons name="check-circle" size={24} color="#FF6B6B" />
            <ThemedText style={styles.statValue}>98%</ThemedText>
            <ThemedText style={styles.statLabel}>Accuracy</ThemedText>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="speed" size={24} color="#FF6B6B" />
            <ThemedText style={styles.statValue}>2s</ThemedText>
            <ThemedText style={styles.statLabel}>Scan Time</ThemedText>
          </View>
        </View>

        <View style={styles.featuresSection}>
          <ThemedText style={styles.sectionTitle}>Key Features</ThemedText>
          <View style={styles.featureGrid}>
            <View style={styles.featureCard}>
              <MaterialIcons name="grain" size={24} color="#FF6B6B" />
              <ThemedText style={styles.featureTitle}>Grain Size</ThemedText>
            </View>
            <View style={styles.featureCard}>
              <MaterialIcons name="colorize" size={24} color="#FF6B6B" />
              <ThemedText style={styles.featureTitle}>Color Analysis</ThemedText>
            </View>
            <View style={styles.featureCard}>
              <MaterialIcons name="science" size={24} color="#FF6B6B" />
              <ThemedText style={styles.featureTitle}>Moisture Level</ThemedText>
            </View>
            <View style={styles.featureCard}>
              <MaterialIcons name="auto-fix-high" size={24} color="#FF6B6B" />
              <ThemedText style={styles.featureTitle}>Quality Score</ThemedText>
            </View>
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
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 28,
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
  qualityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
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
    marginLeft: 15,
  },
  cardDescription: {
    color: '#FFFFFF',
    opacity: 0.8,
    fontSize: 14,
    marginLeft: 15,
    flex: 1,
  },
  previewSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    marginBottom: 15,
  },
  analyzeButton: {
    backgroundColor: '#FF6B6B',
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
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
  },
  featuresSection: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  featureCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 10,
    textAlign: 'center',
  },
}); 