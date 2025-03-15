import {
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "@/components/ThemedText";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";
import { useState, useEffect } from "react";
import { useColorScheme } from "@/hooks/useColorScheme";
import { router } from "expo-router";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const scale = SCREEN_WIDTH / 375; // Base scale on iPhone 8 width

const normalize = (size) => {
  return Math.round(scale * size);
};

const DiseaseCard = ({ title, description, icon, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.cardContainer}>
    <LinearGradient
      colors={["#9C27B0", "#7B1FA2"]}
      style={styles.diseaseCard}
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
      <MaterialIcons
        name="arrow-forward"
        size={normalize(24)}
        color="#FFFFFF"
      />
    </LinearGradient>
  </TouchableOpacity>
);

export default function DiseaseDetectionScreen() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [dimensions, setDimensions] = useState({
    window: Dimensions.get("window"),
  });
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === "dark" ? "#151718" : "#F5F5F5";

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setDimensions({ window });
    });
    return () => subscription?.remove();
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "image",
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons
            name="arrow-back"
            size={normalize(24)}
            color="#FFFFFF"
          />
        </TouchableOpacity>
        <LinearGradient colors={["#9C27B0", "#7B1FA2"]} style={styles.header}>
          <ThemedText style={styles.headerTitle}>Disease Detection</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Early detection for better crop health
          </ThemedText>
        </LinearGradient>
      </View>

      <View style={styles.content}>
        <View style={styles.mainActions}>
          <DiseaseCard
            title="Quick Scan"
            description="Instant disease identification with your camera"
            icon="camera"
            onPress={() => {}}
          />
          <DiseaseCard
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
              resizeMode="contain"
            />
            <TouchableOpacity style={styles.analyzeButton} onPress={() => {}}>
              <ThemedText style={styles.analyzeButtonText}>
                Analyze Disease
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.statsSection}>
          {[
            { icon: "healing", value: "156", label: "Diseases Detected" },
            { icon: "trending-up", value: "95%", label: "Detection Rate" },
          ].map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <MaterialIcons
                name={stat.icon}
                size={normalize(24)}
                color="#9C27B0"
              />
              <ThemedText style={styles.statValue}>{stat.value}</ThemedText>
              <ThemedText style={styles.statLabel}>{stat.label}</ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.tipsSection}>
          <ThemedText style={styles.sectionTitle}>Detection Tips</ThemedText>
          <View style={styles.tipsContainer}>
            {[
              { icon: "wb-sunny", text: "Take photos in good lighting" },
              { icon: "center-focus-strong", text: "Focus on affected areas" },
              { icon: "compare", text: "Include healthy parts for comparison" },
            ].map((tip, index) => (
              <View key={index} style={styles.tipCard}>
                <MaterialIcons
                  name={tip.icon}
                  size={normalize(24)}
                  color="#9C27B0"
                />
                <ThemedText style={styles.tipText}>{tip.text}</ThemedText>
              </View>
            ))}
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
  cardContainer: {
    marginBottom: normalize(16),
  },
  diseaseCard: {
    padding: normalize(20),
    borderRadius: normalize(15),
    flexDirection: "row",
    alignItems: "center",
  },
  cardIcon: {
    width: normalize(60),
    height: normalize(60),
    borderRadius: normalize(30),
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    flex: 1,
    marginLeft: normalize(15),
    marginRight: normalize(10),
  },
  cardTitle: {
    fontSize: normalize(18),
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: normalize(4),
  },
  cardDescription: {
    fontSize: normalize(14),
    color: "#FFFFFF",
    opacity: 0.8,
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
    backgroundColor: "#9C27B0",
    paddingHorizontal: normalize(24),
    paddingVertical: normalize(12),
    borderRadius: normalize(25),
  },
  analyzeButtonText: {
    color: "#FFFFFF",
    fontSize: normalize(16),
    fontWeight: "600",
  },
  statsSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: normalize(30),
    gap: normalize(16),
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: normalize(16),
    borderRadius: normalize(15),
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: normalize(24),
    fontWeight: "bold",
    color: "#9C27B0",
    marginVertical: normalize(5),
  },
  statLabel: {
    fontSize: normalize(14),
    color: "#666666",
    textAlign: "center",
  },
  tipsSection: {
    marginTop: normalize(30),
  },
  sectionTitle: {
    fontSize: normalize(20),
    fontWeight: "bold",
    marginBottom: normalize(15),
  },
  tipsContainer: {
    gap: normalize(12),
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: normalize(16),
    borderRadius: normalize(12),
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tipText: {
    marginLeft: normalize(12),
    fontSize: normalize(14),
    flex: 1,
  },
});
