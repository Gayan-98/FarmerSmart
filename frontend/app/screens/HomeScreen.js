import React from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { Text, Card, IconButton, Surface } from "react-native-paper";
import Background from "../components/Background";
import Logo from "../components/Logo";
import Header from "../components/Header";
import { theme } from "../core/theme";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function HomeScreen({ navigation }) {
  const features = [
    {
      title: "Pest Detection",
      icon: "bug-outline",
      description: "Scan and identify rice plant pests in real-time",
      screen: "PestDetection",
      color: "#FF6B6B"
    },
    {
      title: "Disease Detection",
      icon: "virus-outline",
      description: "Diagnose plant diseases instantly",
      screen: "DiseaseDetection",
      color: "#4ECDC4"
    },
    {
      title: "Rice Quality Check",
      icon: "check-circle-outline",
      description: "Assess harvested rice quality",
      screen: "QualityCheck",
      color: "#FFE66D"
    },
    {
      title: "Weed Detection",
      icon: "sprout",
      description: "Identify and analyze weed seeds",
      screen: "WeedDetection",
      color: "#96CEB4"
    },
    {
      title: "Reports & Analytics",
      icon: "chart-box-outline",
      description: "View comprehensive farming data",
      screen: "Reports",
      color: "#6C5CE7"
    },
    {
      title: "Community Alerts",
      icon: "bell-outline",
      description: "Stay updated with local farming alerts",
      screen: "Alerts",
      color: "#FF7979"
    }
  ];

  return (
    <Background>
      <ScrollView style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Logo />
            <IconButton
              icon="account-circle"
              size={30}
              onPress={() => navigation.navigate('Profile')}
            />
          </View>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Header>FarmerSmart 🌾</Header>
          <Text style={styles.subtitle}>AI-Powered Rice Farming Assistant</Text>
        </View>

        {/* Quick Scan Button */}
        <TouchableOpacity 
          style={styles.quickScanButton}
          onPress={() => navigation.navigate('QuickScan')}
        >
          <View style={styles.quickScanContent}>
            <Icon name="camera" size={24} color="#fff" />
            <Text style={styles.quickScanText}>Quick Scan</Text>
          </View>
          <Text style={styles.quickScanSubtext}>Instantly analyze your crops</Text>
        </TouchableOpacity>

        {/* Features Grid */}
        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <TouchableOpacity 
              key={index}
              style={[styles.featureCard, { backgroundColor: feature.color + '15' }]}
              onPress={() => navigation.navigate(feature.screen)}
            >
              <Icon name={feature.icon} size={32} color={feature.color} />
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Community Section */}
        <Surface style={styles.communitySection}>
          <Text style={styles.sectionTitle}>Community Insights</Text>
          <Text style={styles.communityText}>
            Connect with agricultural advisors and nearby farmers
          </Text>
          <TouchableOpacity 
            style={styles.communityButton}
            onPress={() => navigation.navigate('Community')}
          >
            <Text style={styles.communityButtonText}>View Community</Text>
          </TouchableOpacity>
        </Surface>
      </ScrollView>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  header: {
    padding: 15,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  headerTop: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: theme.colors.secondary,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.secondary,
    marginTop: 5,
  },
  quickScanButton: {
    backgroundColor: theme.colors.primary,
    margin: 15,
    padding: 15,
    borderRadius: 12,
    elevation: 3,
  },
  quickScanContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  quickScanText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  quickScanSubtext: {
    color: "#fff",
    fontSize: 12,
    textAlign: "center",
    marginTop: 5,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 15,
  },
  featureCard: {
    width: '47%',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: theme.colors.secondary,
    marginTop: 10,
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 12,
    color: theme.colors.secondary,
    opacity: 0.7,
  },
  communitySection: {
    margin: 15,
    padding: 15,
    borderRadius: 12,
    elevation: 4,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: 10,
  },
  communityText: {
    fontSize: 14,
    color: theme.colors.secondary,
    marginBottom: 15,
  },
  communityButton: {
    backgroundColor: theme.colors.primary + '15',
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  communityButtonText: {
    color: theme.colors.primary,
    fontWeight: "bold",
  },
});