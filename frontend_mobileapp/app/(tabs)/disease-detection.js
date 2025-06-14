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
import { useState, useEffect } from "react";
import { useColorScheme } from "@/hooks/useColorScheme";
import { router } from "expo-router";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import * as Location from "expo-location";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const scale = SCREEN_WIDTH / 375;

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

const TipsSection = () => (
  <View style={styles.tipsSection}>
    <View style={styles.sectionHeader}>
      <MaterialIcons name="lightbulb" size={normalize(24)} color="#9C27B0" />
      <ThemedText style={styles.sectionTitle}>Detection Tips</ThemedText>
    </View>
    <View style={styles.tipsContainer}>
      {[
        { icon: "wb-sunny", text: "Take photos in good lighting" },
        { icon: "center-focus-strong", text: "Focus on affected areas" },
        { icon: "compare", text: "Include healthy parts for comparison" },
      ].map((tip, index) => (
        <View key={index} style={styles.tipCard}>
          <MaterialIcons name={tip.icon} size={normalize(24)} color="#9C27B0" />
          <ThemedText style={styles.tipText}>{tip.text}</ThemedText>
        </View>
      ))}
    </View>
  </View>
);

export default function DiseaseDetectionScreen() {
  const { user, userProfile } = useAuth();
  const [selectedImage, setSelectedImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState(null);
  const [locationData, setLocationData] = useState(null);
  const [diseaseSolution, setDiseaseSolution] = useState(null);
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === "dark" ? "#151718" : "#F5F5F5";

  useEffect(() => {
    const getLocation = async () => {
      try {
        console.log("Requesting location permissions...");
        let { status } = await Location.requestForegroundPermissionsAsync();
        console.log("Location permission status:", status);

        if (status !== "granted") {
          Alert.alert("Permission to access location was denied");
          return;
        }

        console.log("Getting current position...");
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        console.log("Location obtained:", currentLocation);
        setLocation(currentLocation);

        // Get location name
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${currentLocation.coords.latitude}&lon=${currentLocation.coords.longitude}&format=json`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch location name");
        }

        const data = await response.json();
        setLocationData(data);

        const addressComponents = [];
        if (data.address) {
          const { quarter, suburb, city, state_district, state } = data.address;
          if (quarter) addressComponents.push(quarter);
          if (suburb) addressComponents.push(suburb);
          if (city) addressComponents.push(city);
          if (state_district) addressComponents.push(state_district);
          if (state) addressComponents.push(state);
        }

        const fullAddress =
          addressComponents.length > 0
            ? addressComponents.join(", ")
            : data.display_name;

        setLocationName(fullAddress);
        console.log("Location name set:", fullAddress);
      } catch (error) {
        console.error("Location error:", error);
        // If we have location coords but failed to get name, still set the fallback
        if (location?.coords) {
          setLocationName(
            `${location.coords.latitude.toFixed(
              4
            )}, ${location.coords.longitude.toFixed(4)}`
          );
        }
      }
    };

    getLocation();
  }, []);

  const saveDiseaseDetection = async (predictionData) => {
    try {
      // Check authentication - handle both cases
      let farmerId = null;
      let landLocation = "Unknown Location";

      if (userProfile?.farmerDetails?.id) {
        farmerId = userProfile.farmerDetails.id;
        landLocation =
          userProfile.farmerDetails.landLocation || "Unknown Location";
      } else if (user?.uid) {
        // Fallback to user ID if farmer details not available
        farmerId = user.uid;
        console.log("Using user.uid as fallback farmer ID:", user.uid);
      } else {
        console.log("Current user data:", userProfile);
        console.log("Current user auth:", user);
        Alert.alert(
          "Warning",
          "User not authenticated. Skipping database save, but showing results."
        );
        return; // Don't save but continue with showing results
      }

      // Debug location data
      console.log("Current location state:", location);
      console.log("Location coords:", location?.coords);
      console.log("Latitude:", location?.coords?.latitude);
      console.log("Longitude:", location?.coords?.longitude);

      // Check if location is available, if not try to get it again
      let currentLocation = location;
      if (
        !currentLocation?.coords?.latitude ||
        !currentLocation?.coords?.longitude
      ) {
        console.log(
          "Location not available, trying to get current location..."
        );
        try {
          const freshLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          currentLocation = freshLocation;
          console.log("Fresh location obtained:", freshLocation);
        } catch (locationError) {
          console.error("Failed to get fresh location:", locationError);
        }
      }

      const backendData = {
        farmerId: farmerId,
        diseaseName: predictionData.prediction.toLowerCase(),
        detectedLocation: locationName || landLocation,
        detectionDateTime: new Date().toISOString(),
        // Add longitude and latitude coordinates
        longitude: currentLocation?.coords?.longitude || null,
        latitude: currentLocation?.coords?.latitude || null,
      };

      console.log("Sending disease detection data:", backendData);

      // Save disease detection
      const response = await fetch("http://localhost:8083/diseases-detection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(backendData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log("Failed to save disease detection:", errorData);
        throw new Error(errorData.message || "Failed to save to backend");
      }

      const savedData = await response.json();
      console.log("Successfully saved disease detection:", savedData);

      Alert.alert("Success", "Detection results saved successfully");
    } catch (error) {
      console.error("Error saving detection:", error);
      Alert.alert("Error", error.message || "Failed to save detection results");
    }
  };

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
      // Convert the image to base64
      const base64Data = selectedImage.base64;

      // Send the base64 image to the Flask API
      const apiResponse = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Ensure this header is set
        },
        body: JSON.stringify({ image: base64Data }), // Ensure the body is JSON
      });

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        throw new Error(`Server error: ${errorText}`);
      }

      // Parse the response
      const data = await apiResponse.json();
      console.log("Backend Response:", data);
      setPrediction(data);

      // Fetch disease solution first
      const diseaseName = data.prediction.toLowerCase();
      console.log("Disease name:", diseaseName);

      try {
        const solutionResponse = await fetch(
          `http://localhost:8083/disease-solutions/disease/${encodeURIComponent(
            diseaseName
          )}`
        );

        console.log("Solution response:", solutionResponse);

        if (solutionResponse.ok) {
          const solutionData = await solutionResponse.json();
          setDiseaseSolution(solutionData[0]); // Get the first solution
          console.log("Disease solution:", solutionData[0]);
        }
      } catch (solutionError) {
        console.error("Error fetching solution:", solutionError);
        // Continue even if solution fetch fails
      }

      // Save the detection results (this will handle auth issues gracefully)
      await saveDiseaseDetection(data);
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "Failed to process image");
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
            <MaterialIcons
              name="arrow-back"
              size={normalize(24)}
              color="#FFFFFF"
            />
          </TouchableOpacity>
          <LinearGradient colors={["#9C27B0", "#7B1FA2"]} style={styles.header}>
            <ThemedText style={styles.headerTitle}>
              Disease Detection
            </ThemedText>
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
              <TouchableOpacity
                style={[
                  styles.analyzeButton,
                  loading && styles.analyzeButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <ThemedText style={styles.analyzeButtonText}>
                  {loading ? "Analyzing..." : "Analyze Disease"}
                </ThemedText>
              </TouchableOpacity>

              {prediction && prediction.success && (
                <View style={styles.predictionResult}>
                  <MaterialIcons
                    name="check-circle"
                    size={normalize(32)}
                    color="#9C27B0"
                  />
                  <ThemedText style={styles.predictionText}>
                    Class {prediction.prediction}
                  </ThemedText>
                  <ThemedText style={styles.predictionDescription}>
                    Analysis completed successfully
                  </ThemedText>

                  {diseaseSolution && (
                    <View style={styles.solutionContainer}>
                      <ThemedText style={styles.solutionTitle}>
                        Recommended Solution
                      </ThemedText>
                      <ThemedText style={styles.solutionDescription}>
                        {diseaseSolution.solutionDescription}
                      </ThemedText>
                      <View style={styles.expertInfo}>
                        <MaterialIcons
                          name="person"
                          size={normalize(20)}
                          color="#9C27B0"
                        />
                        <ThemedText style={styles.expertName}>
                          Expert: {diseaseSolution.expert.firstName}{" "}
                          {diseaseSolution.expert.lastName}
                        </ThemedText>
                        <ThemedText style={styles.expertDesignation}>
                          {diseaseSolution.expert.designation}
                        </ThemedText>
                        <TouchableOpacity style={styles.contactButton}>
                          <MaterialIcons
                            name="phone"
                            size={normalize(16)}
                            color="#FFFFFF"
                          />
                          <ThemedText style={styles.contactButtonText}>
                            {diseaseSolution.expert.contactNumber}
                          </ThemedText>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              )}
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

          <TipsSection />
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
  analyzeButtonDisabled: {
    backgroundColor: "#B39DDB",
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
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: normalize(16),
  },
  sectionTitle: {
    fontSize: normalize(20),
    fontWeight: "bold",
    color: "#333333",
    marginLeft: normalize(8),
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
    color: "#333333",
    flex: 1,
  },
  predictionResult: {
    backgroundColor: "#FFFFFF",
    padding: normalize(20),
    borderRadius: normalize(12),
    width: "100%",
    alignItems: "center",
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
  solutionContainer: {
    marginTop: normalize(20),
    backgroundColor: "#FFFFFF",
    borderRadius: normalize(12),
    padding: normalize(15),
    width: "100%",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  solutionTitle: {
    fontSize: normalize(18),
    fontWeight: "bold",
    color: "#9C27B0",
    marginBottom: normalize(10),
  },
  solutionDescription: {
    fontSize: normalize(14),
    color: "#333333",
    lineHeight: normalize(20),
  },
  expertInfo: {
    marginTop: normalize(15),
    padding: normalize(10),
    backgroundColor: "#F5F5F5",
    borderRadius: normalize(8),
    flexDirection: "column",
    alignItems: "flex-start",
  },
  expertName: {
    fontSize: normalize(16),
    fontWeight: "600",
    color: "#333333",
    marginLeft: normalize(5),
  },
  expertDesignation: {
    fontSize: normalize(14),
    color: "#666666",
    marginLeft: normalize(25),
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#9C27B0",
    padding: normalize(8),
    borderRadius: normalize(20),
    marginTop: normalize(10),
  },
  contactButtonText: {
    color: "#FFFFFF",
    marginLeft: normalize(5),
    fontSize: normalize(14),
  },
});
