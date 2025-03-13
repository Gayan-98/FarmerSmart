import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Text } from "react-native-paper";
// import * as ImagePicker from "expo-image-picker"; // Import expo-image-picker
import Button from "../components/Button"; // Assume this is your custom button component
import { theme } from "../core/theme";

export default function DiseaseScreen({ navigation }) {
  const [image, setImage] = useState(null); // To store the selected image
  const [error, setError] = useState(""); // To show error messages if necessary

  // Function to handle image selection
  const selectImage = async () => {
    // Request permission for image picker
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      setError("Permission to access media library is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Only images
      allowsEditing: true,
      quality: 0.5,
    });

    if (result.cancelled) {
      setError("User cancelled image picker");
    } else {
      setImage({ uri: result.uri }); // Set the selected image URI
      setError(""); // Clear any previous errors
    }
  };

  // Function to handle the submit action
  const onSubmitPressed = () => {
    if (!image) {
      setError("Please upload an image first.");
      return;
    }

    // TODO: Handle the submit logic here, e.g., send the image to a backend API
    console.log("Image submitted:", image);
    navigation.navigate("PredictionScreen"); // Navigate to another screen (e.g., result page)
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Upload Disease Image</Text>

      <Button mode="contained" onPress={selectImage}>
        Upload Image
      </Button>

      {image && (
        <View style={styles.imageContainer}>
          <Image source={image} style={styles.image} />
          <Text style={styles.imageText}>Image Selected</Text>
        </View>
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Button mode="contained" onPress={onSubmitPressed} style={styles.submitButton}>
        Submit
      </Button>
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
  imageContainer: {
    marginTop: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  imageText: {
    fontSize: 16,
    color: theme.colors.primary,
  },
  errorText: {
    color: "red",
    marginTop: 10,
    fontSize: 14,
  },
  submitButton: {
    marginTop: 20,
  },
});
