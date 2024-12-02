import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, ActivityIndicator } from "react-native";
import axios from "axios";
import { theme } from "../core/theme";

export default function PredictionScreen({ route, navigation }) {
  const { image } = route.params; // Get the image URI passed from the previous screen
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to send the image to the backend for prediction
  const getPrediction = async () => {
    try {
      setLoading(true); // Show loading spinner
      setError(null); // Clear any previous errors

      // Create a form data to send the image
      const formData = new FormData();
      formData.append("file", {
        uri: image.uri,
        name: "image.jpg",
        type: "image/jpeg",
      });

      // Send the image to your Flask backend
      const response = await axios.post("http://127.0.0.1:5000/predict", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Set the prediction result
      setPrediction(response.data.prediction);
    } catch (err) {
      setError("An error occurred while making the prediction.");
    } finally {
      setLoading(false); // Hide loading spinner
    }
  };

  // Trigger prediction when the component is mounted
  useEffect(() => {
    getPrediction();
  }, []);

  return (
    <View style={styles.container}>
      {loading && <ActivityIndicator size="large" color={theme.colors.primary} />}
      
      {error && <Text style={styles.errorText}>{error}</Text>}

      {prediction && (
        <View style={styles.resultContainer}>
          <Text style={styles.header}>Prediction Result</Text>
          <Image source={{ uri: image.uri }} style={styles.image} />
          <Text style={styles.predictionText}>Predicted Disease: {prediction}</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Go Back
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: theme.colors.primary,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  resultContainer: {
    alignItems: "center",
  },
  predictionText: {
    fontSize: 18,
    color: theme.colors.secondary,
    marginTop: 10,
  },
  errorText: {
    color: "red",
    marginTop: 10,
    fontSize: 14,
  },
  buttonContainer: {
    marginTop: 20,
  },
});
