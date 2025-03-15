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
import { useState } from "react";
import { useColorScheme } from "@/hooks/useColorScheme";
import { router } from "expo-router";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const DiseaseCard = ({ title, description, icon, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <LinearGradient
      colors={["#9C27B0", "#7B1FA2"]}
      style={styles.diseaseCard}
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

export default function DiseaseDetectionScreen() {
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
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleSubmit = async () => {
    if (!selectedImage) return;

    setLoading(true);
    try {
      const base64Data = selectedImage.base64;
      const imageBlob = await fetch(
        `data:image/jpeg;base64,${base64Data}`
      ).then((r) => r.blob());

      const formData = new FormData();
      formData.append("image", imageBlob, "image.jpg");

      const apiResponse = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (!apiResponse.ok) {
        throw new Error("Server error");
      }

      const data = await apiResponse.json();
      setPrediction(data);
    } catch (error) {
      Alert.alert("Error", "Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <LinearGradient colors={["#9C27B0", "#7B1FA2"]} style={styles.header}>
        <ThemedText style={styles.headerTitle}>Disease Detection</ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Early detection for better crop health
        </ThemedText>
      </LinearGradient>

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
            />
            <TouchableOpacity
              style={[
                styles.submitButton,
                loading && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <ThemedText style={styles.submitButtonText}>
                {loading ? "Analyzing..." : "Analyze Image"}
              </ThemedText>
            </TouchableOpacity>

            {prediction && prediction.success && (
              <View style={styles.predictionResult}>
                <MaterialIcons name="check-circle" size={32} color="#9C27B0" />
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
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: StatusBar.currentHeight || 44,
    padding: 20,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.8,
  },
  content: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    padding: 20,
  },
  mainActions: {
    gap: 15,
  },
  diseaseCard: {
    padding: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    marginLeft: 15,
  },
  cardDescription: {
    color: "#FFFFFF",
    opacity: 0.8,
    fontSize: 14,
    flex: 2,
  },
  previewSection: {
    alignItems: "center",
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 15,
  },
  predictionResult: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  predictionText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
  },
  predictionDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  submitButton: {
    backgroundColor: "#9C27B0",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    marginVertical: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  submitButtonDisabled: {
    backgroundColor: "#CE93D8",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
