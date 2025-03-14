import React from "react";
import {
  ImageBackground,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { theme } from "../core/theme";

export default function Background({ children }) {
  return (
    <ImageBackground
      source={require("../../assets/items/dot.png")}
      resizeMode="repeat"
      style={styles.background}
    >
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {children}
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    backgroundColor: theme.colors.surface,
  },
  container: {
    flex: 1,
    width: "100%",
    alignSelf: "center",
  },
});
