import {
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "@/components/ThemedText";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { useColorScheme } from "@/hooks/useColorScheme";
import { router } from "expo-router";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const scale = SCREEN_WIDTH / 375;

const normalize = (size) => {
  return Math.round(scale * size);
};

const RiceQualityCard = ({ title, description, icon, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.cardContainer}>
    <LinearGradient
      colors={["#FF9800", "#F57C00"]}
      style={styles.qualityCard}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.cardIcon}>
        <MaterialIcons name={icon} size={normalize(32)} color="#FFFFFF" />
      </View>
      <View style={styles.cardContent}>
        <ThemedText style={styles.cardTitle}>{title}</ThemedText>
        <ThemedText style={styles.cardDescription}>{description}</ThemedText>
      </View>
      <MaterialIcons name="arrow-forward" size={normalize(24)} color="#FFFFFF" />
    </LinearGradient>
  </TouchableOpacity>
);

const TipsCard = () => (
  <View style={styles.tipsSection}>
    <View style={styles.sectionHeader}>
      <MaterialIcons name="lightbulb" size={normalize(24)} color="#FF9800" />
      <ThemedText style={styles.sectionTitle}>Tips for Better Analysis</ThemedText>
    </View>
    <View style={styles.tipsContainer}>
      {[
        { icon: "photo", text: "Place rice grains on a plain white background" },
        { icon: "wb-sunny", text: "Ensure good lighting conditions" },
        { icon: "grain", text: "Spread grains evenly without overlapping" },
        { icon: "center-focus-strong", text: "Keep camera steady and focused" },
      ].map((tip, index) => (
        <View key={index} style={styles.tipCard}>
          <MaterialIcons name={tip.icon} size={normalize(24)} color="#FF9800" />
          <ThemedText style={styles.tipText}>{tip.text}</ThemedText>
        </View>
      ))}
    </View>
  </View>
);

const AnalysisResults = ({ prediction }) => (
  <View style={styles.analysisResults}>
    <View style={styles.resultHeader}>
      <MaterialIcons name="analytics" size={normalize(24)} color="#FF9800" />
      <ThemedText style={styles.resultTitle}>Analysis Results</ThemedText>
    </View>
    
    <View style={styles.statsGrid}>
      <View style={styles.statCard}>
        <ThemedText style={styles.statValue}>{prediction.total_grains}</ThemedText>
        <ThemedText style={styles.statLabel}>Total Grains</ThemedText>
      </View>
      
      <View style={styles.qualityStats}>
        <View style={styles.statRow}>
          <MaterialIcons name="star" size={normalize(20)} color="#4CAF50" />
          <ThemedText style={styles.statLabel}>Good: </ThemedText>
          <ThemedText style={[styles.statValue, { color: '#4CAF50' }]}>
            {prediction.good_percent}%
          </ThemedText>
        </View>
        
        <View style={styles.statRow}>
          <MaterialIcons name="star-half" size={normalize(20)} color="#FFC107" />
          <ThemedText style={styles.statLabel}>Medium: </ThemedText>
          <ThemedText style={[styles.statValue, { color: '#FFC107' }]}>
            {prediction.medium_percent}%
          </ThemedText>
        </View>
        
        <View style={styles.statRow}>
          <MaterialIcons name="star-border" size={normalize(20)} color="#FF5722" />
          <ThemedText style={styles.statLabel}>Poor: </ThemedText>
          <ThemedText style={[styles.statValue, { color: '#FF5722' }]}>
            {prediction.poor_percent}%
          </ThemedText>
        </View>
      </View>
    </View>

    <View style={styles.resultCard}>
      <ThemedText style={styles.resultLabel}>Overall Quality:</ThemedText>
      <ThemedText style={styles.qualityValue}>{prediction.predicted_quality}</ThemedText>
      <ThemedText style={styles.resultLabel}>Rice Type:</ThemedText>
      <ThemedText style={styles.typeValue}>{prediction.predicted_rice_type}</ThemedText>
    </View>
  </View>
);

export default function RiceQualityScreen() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === "dark" ? "#151718" : "#F5F5F5";

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "image",
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
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const handleSubmit = async () => {
    if (!selectedImage) return;
    
    setLoading(true);
    try {
      // Create FormData and append the image file
      const formData = new FormData();
      
      // Convert base64 to blob
      const base64Data = selectedImage.base64;
      const imageBlob = await fetch(`data:image/jpeg;base64,${base64Data}`).then(r => r.blob());
      
      // Append the image blob to FormData
      formData.append('image', imageBlob, 'rice_sample.jpg');

      const apiResponse = await fetch('http://127.0.0.1:5001/analyze', {
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
      console.log("Rice Quality Analysis:", data);
      setPrediction(data);

    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "Failed to analyze rice quality");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={normalize(24)} color="#FFFFFF" />
          </TouchableOpacity>
          <LinearGradient colors={["#FF9800", "#F57C00"]} style={styles.header}>
            <ThemedText style={styles.headerTitle}>Rice Quality Analysis</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Advanced grain quality assessment
            </ThemedText>
          </LinearGradient>
        </View>

        <View style={styles.content}>
          <View style={styles.mainActions}>
            <RiceQualityCard
              title="Upload Image"
              description="Analyze rice quality from your gallery"
              icon="photo-library"
              onPress={pickImage}
            />
          </View>

          {selectedImage && (
            <View style={styles.previewSection}>
              <Image
                source={{ uri: selectedImage.uri }}
                style={styles.previewImage}
                resizeMode="contain"
              />
              <TouchableOpacity
                style={[styles.analyzeButton, loading && styles.analyzeButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <ThemedText style={styles.analyzeButtonText}>
                  {loading ? "Analyzing..." : "Analyze Quality"}
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}

          {prediction && (
            <AnalysisResults prediction={prediction} />
          )}

          <TipsCard />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  headerContainer: {
    position: "relative",
  },
  backButton: {
    position: "absolute",
    top: normalize(50),
    left: normalize(20),
    zIndex: 10,
    padding: normalize(8),
    borderRadius: normalize(20),
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  header: {
    padding: normalize(20),
    paddingTop: normalize(60),
    borderBottomLeftRadius: normalize(30),
    borderBottomRightRadius: normalize(30),
  },
  headerTitle: {
    fontSize: normalize(28),
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: normalize(20),
    marginBottom: normalize(8),
  },
  headerSubtitle: {
    fontSize: normalize(16),
    color: "#FFFFFF",
    opacity: 0.8,
  },
  content: {
    padding: normalize(16),
  },
  mainActions: {
    gap: normalize(16),
  },
  previewSection: {
    marginTop: normalize(20),
    alignItems: "center",
  },
  previewImage: {
    width: "100%",
    height: normalize(200),
    borderRadius: normalize(15),
    marginBottom: normalize(16),
  },
  analyzeButton: {
    backgroundColor: "#FF9800",
    paddingHorizontal: normalize(24),
    paddingVertical: normalize(12),
    borderRadius: normalize(25),
  },
  analyzeButtonDisabled: {
    backgroundColor: "#FFB74D",
  },
  analyzeButtonText: {
    color: "#FFFFFF",
    fontSize: normalize(16),
    fontWeight: "600",
  },
  predictionResult: {
    backgroundColor: "#FFFFFF",
    padding: normalize(20),
    borderRadius: normalize(12),
    width: "100%",
    alignItems: "center",
    marginTop: normalize(20),
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  predictionText: {
    fontSize: normalize(24),
    fontWeight: "bold",
    color: "#333",
    marginTop: normalize(10),
  },
  predictionDescription: {
    fontSize: normalize(14),
    color: "#666",
    marginTop: normalize(5),
  },
  tipsCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipText: {
    marginLeft: normalize(12),
    fontSize: normalize(14),
    color: '#333333',
    flex: 1,
  },
  cardContainer: {
    marginBottom: normalize(16),
  },
  qualityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: normalize(16),
    borderRadius: normalize(12),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: normalize(12),
    borderRadius: normalize(12),
    marginRight: normalize(16),
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: normalize(18),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: normalize(4),
  },
  cardDescription: {
    fontSize: normalize(14),
    color: '#FFFFFF',
    opacity: 0.9,
  },
  tipsSection: {
    marginTop: normalize(24),
    marginBottom: normalize(24),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(16),
  },
  sectionTitle: {
    fontSize: normalize(20),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: normalize(8),
  },
  tipsContainer: {
    gap: normalize(12),
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: normalize(16),
    borderRadius: normalize(12),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  analysisResults: {
    marginTop: normalize(24),
    marginBottom: normalize(24),
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(16),
  },
  resultTitle: {
    fontSize: normalize(20),
    fontWeight: 'bold',
    marginLeft: normalize(8),
  },
  statsGrid: {
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(12),
    padding: normalize(16),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statCard: {
    alignItems: 'center',
    marginBottom: normalize(16),
  },
  qualityStats: {
    gap: normalize(12),
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: normalize(8),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  statValue: {
    fontSize: normalize(18),
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: normalize(14),
    color: '#666666',
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(12),
    padding: normalize(16),
    marginTop: normalize(16),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  qualityValue: {
    fontSize: normalize(24),
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: normalize(16),
  },
  typeValue: {
    fontSize: normalize(20),
    fontWeight: '600',
    color: '#666666',
  },
  resultLabel: {
    fontSize: normalize(14),
    color: '#666666',
    marginBottom: normalize(4),
  },
}); 