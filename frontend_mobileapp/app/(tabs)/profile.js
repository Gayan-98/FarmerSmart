import { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Image, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/context/AuthContext';
import { showNotification } from '@/components/CustomAlert';

const { width } = Dimensions.get('window');

const ProfileCard = ({ icon, title, value }) => {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#2A2A2A' : '#FFFFFF';
  
  return (
    <View style={[styles.profileCard, { backgroundColor }]}>
      <MaterialIcons name={icon} size={24} color="#4CAF50" />
      <View>
        <ThemedText style={styles.cardTitle}>{title}</ThemedText>
        <ThemedText style={styles.cardValue}>{value}</ThemedText>
      </View>
    </View>
  );
};

const ActionButton = ({ icon, title, onPress }) => {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#2A2A2A' : '#FFFFFF';
  
  return (
    <TouchableOpacity 
      style={[styles.actionButton, { backgroundColor }]}
      onPress={onPress}
    >
      <MaterialIcons name={icon} size={24} color="#4CAF50" />
      <ThemedText style={styles.actionTitle}>{title}</ThemedText>
      <MaterialIcons name="chevron-right" size={24} color="#4CAF50" />
    </TouchableOpacity>
  );
};

export default function ProfileScreen() {
  const { userProfile, signOut } = useAuth();
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#151718' : '#F5F5F5';

  const handleLogout = async () => {
    try {
      showNotification('success', 'Logging out...');
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
      showNotification('error', 'Failed to logout');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <View style={styles.headerContainer}>
        <LinearGradient colors={['#4CAF50', '#2E7D32']} style={styles.header}>
          <View style={styles.headerTop}>
            <ThemedText style={styles.headerTitle}>Profile</ThemedText>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <MaterialIcons name="logout" size={24} color="#FFFFFF" />
              <ThemedText style={styles.logoutText}>Logout</ThemedText>
            </TouchableOpacity>
          </View>
          
          <View style={styles.headerContent}>
            <Image source={require('@/assets/images/download.jpeg')} style={styles.profileImage} />
            <View style={styles.profileInfo}>
              <ThemedText style={styles.name}>
                {userProfile?.farmerDetails ? 
                  `${userProfile.farmerDetails.firstName} ${userProfile.farmerDetails.lastName}` 
                  : 'Loading...'}
              </ThemedText>
              <View style={styles.locationContainer}>
                <MaterialIcons name="location-on" size={16} color="#FFFFFF" />
                <ThemedText style={styles.location}>
                  {userProfile?.farmerDetails?.landLocation || 'Loading location...'}
                </ThemedText>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Farm Information</ThemedText>
        <View style={styles.cardsGrid}>
          <ProfileCard 
            icon="email" 
            title="Email" 
            value={userProfile?.email || 'Loading...'} 
          />
          <ProfileCard 
            icon="phone" 
            title="Contact" 
            value={userProfile?.farmerDetails?.contactNumber || 'Loading...'} 
          />
          <ProfileCard 
            icon="landscape" 
            title="Land Size" 
            value={`${userProfile?.farmerDetails?.landSize || '0'} acres`} 
          />
          <ProfileCard 
            icon="event" 
            title="Joined" 
            value={userProfile?.farmerDetails?.registrationDate ? 
              new Date(userProfile.farmerDetails.registrationDate).toLocaleDateString() 
              : 'Loading...'} 
          />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Quick Actions</ThemedText>
        <View style={styles.actionsList}>
          <ActionButton icon="settings" title="Settings" onPress={() => {}} />
          <ActionButton icon="notifications" title="Notifications" onPress={() => {}} />
          <ActionButton icon="description" title="Reports" onPress={() => {}} />
          <ActionButton icon="security" title="Privacy & Security" onPress={() => {}} />
          <ActionButton icon="help" title="Help & Support" onPress={() => {}} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    width: '100%',
  },
  header: {
    padding: 20,
    paddingTop: 50,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 20,
  },
  logoutText: {
    color: '#FFFFFF',
    marginLeft: 5,
    fontSize: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  location: {
    color: '#FFFFFF',
    marginLeft: 5,
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: -30,
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  profileCard: {
    width: (width - 50) / 2,
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  cardTitle: {
    fontSize: 12,
    color: '#666666',
  },
  cardValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionsList: {
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  actionTitle: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
  },
}); 