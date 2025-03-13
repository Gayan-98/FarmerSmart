import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

const IntroCard = ({ title, description, icon }) => (
  <ThemedView style={styles.introCard}>
    <View style={styles.iconContainer}>
      <IconSymbol name={icon} size={32} color="#4CAF50" />
    </View>
    <ThemedText style={styles.introTitle}>{title}</ThemedText>
    <ThemedText style={styles.introDescription}>{description}</ThemedText>
  </ThemedView>
);

export default function PestDetectionScreen() {
  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={['#4CAF50', '#2E7D32']} style={styles.header}>
        <ThemedText style={styles.headerTitle}>Pest Detection</ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Identify and manage crop pests effectively
        </ThemedText>
      </LinearGradient>

      <View style={styles.introSection}>
        <IntroCard
          title="Quick Scan"
          description="Take or upload a photo of affected plants for instant pest identification"
          icon="camera.fill"
        />
        <IntroCard
          title="Expert Analysis"
          description="Get detailed analysis and treatment recommendations"
          icon="magnifyingglass"
        />
        <IntroCard
          title="History Tracking"
          description="Keep track of past detections and treatments"
          icon="clock.fill"
        />
      </View>

      <View style={styles.actionSection}>
        <TouchableOpacity style={styles.actionButton}>
          <IconSymbol name="camera.fill" size={24} color="#FFFFFF" />
          <ThemedText style={styles.buttonText}>Take Photo</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, styles.uploadButton]}>
          <IconSymbol name="photo.fill" size={24} color="#FFFFFF" />
          <ThemedText style={styles.buttonText}>Upload Image</ThemedText>
        </TouchableOpacity>
      </View>

      <ThemedView style={styles.tipsContainer}>
        <ThemedText style={styles.tipsTitle}>Tips for Better Detection</ThemedText>
        <View style={styles.tipItem}>
          <IconSymbol name="lightbulb.fill" size={20} color="#FFC107" />
          <ThemedText style={styles.tipText}>Ensure good lighting conditions</ThemedText>
        </View>
        <View style={styles.tipItem}>
          <IconSymbol name="camera.viewfinder" size={20} color="#FFC107" />
          <ThemedText style={styles.tipText}>Keep the camera steady and close to the affected area</ThemedText>
        </View>
        <View style={styles.tipItem}>
          <IconSymbol name="leaf.fill" size={20} color="#FFC107" />
          <ThemedText style={styles.tipText}>Include both healthy and affected parts in the image</ThemedText>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // ... (styles remain the same)
}); 