import { ScrollView, StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';

const StatCard = ({ title, value }) => (
  <View style={styles.statCard}>
    <ThemedText style={styles.statValue}>{value}</ThemedText>
    <ThemedText style={styles.statTitle}>{title}</ThemedText>
  </View>
);

export default function ProfileScreen() {
  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={['#4CAF50', '#2E7D32']} style={styles.header}>
        <View style={styles.profileHeader}>
          <Image
            source={require('@/assets/images/download.jpeg')}
            style={styles.profileImage}
          />
          <ThemedText style={styles.name}>John's Farm</ThemedText>
          <ThemedText style={styles.location}>California, USA</ThemedText>
        </View>
      </LinearGradient>

      <View style={styles.statsContainer}>
        <StatCard title="Total Fields" value="5" />
        <StatCard title="Crops" value="3" />
        <StatCard title="Years Active" value="8" />
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Farm Details</ThemedText>
        <View style={styles.detailCard}>
          <View style={styles.detailRow}>
            <IconSymbol name="envelope.fill" size={20} color="#4CAF50" />
            <ThemedText style={styles.detailText}>john@farmassist.com</ThemedText>
          </View>
          <View style={styles.detailRow}>
            <IconSymbol name="leaf.fill" size={20} color="#4CAF50" />
            <ThemedText style={styles.detailText}>Organic Farming</ThemedText>
          </View>
          <View style={styles.detailRow}>
            <IconSymbol name="chart.bar.fill" size={20} color="#4CAF50" />
            <ThemedText style={styles.detailText}>150 acres</ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Quick Actions</ThemedText>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionButton}>
            <IconSymbol name="gear" size={24} color="#4CAF50" />
            <ThemedText style={styles.actionText}>Settings</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <IconSymbol name="bell.fill" size={24} color="#4CAF50" />
            <ThemedText style={styles.actionText}>Notifications</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <IconSymbol name="doc.fill" size={24} color="#4CAF50" />
            <ThemedText style={styles.actionText}>Reports</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <IconSymbol name="lock.fill" size={24} color="#4CAF50" />
            <ThemedText style={styles.actionText}>Privacy</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // ... (keep all the existing styles)
}); 