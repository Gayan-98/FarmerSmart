import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { normalize } from '../utils/responsive';
import NotificationCard from '@/components/NotificationCard';

const API_BASE_URL = 'http://localhost:8083';

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#151718' : '#F5F5F5';
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPestAlerts = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.error('Location permission denied');
          setNotifications([{
            type: 'warning',
            title: 'Location Access Required',
            message: 'Please enable location access to receive local pest alerts',
            time: new Date().toLocaleString(),
            read: false
          }]);
          setLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${location.coords.latitude}&lon=${location.coords.longitude}&format=json`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch location data');
        }
        
        const locationData = await response.json();
        
        // Build location string from most specific to least specific
        const locationParts = [];
        if (locationData.address) {
          const { suburb, city_district, city, state_district, state } = locationData.address;
          if (suburb) locationParts.push(suburb);
          if (city_district) locationParts.push(city_district);
          if (city) locationParts.push(city);
          if (state_district) locationParts.push(state_district);
          if (state) locationParts.push(state);
        }

        if (locationParts.length === 0) {
          setNotifications([{
            type: 'warning',
            title: 'Location Error',
            message: 'Unable to determine your location',
            time: new Date().toLocaleString(),
            read: false
          }]);
          setLoading(false);
          return;
        }

        // Try each location part from most specific to least specific
        let alertData = null;
        let usedLocation = null;

        for (const locationPart of locationParts) {
          try {
            const alertsResponse = await fetch(
              `${API_BASE_URL}/api/pest-alerts/area/${encodeURIComponent(locationPart)}`
            );
            
            if (alertsResponse.ok) {
              alertData = await alertsResponse.json();
              usedLocation = locationPart;
              break;
            }
          } catch (error) {
            console.error(`Error fetching alerts for ${locationPart}:`, error);
          }
        }

        if (alertData) {
          updateNotifications(alertData, usedLocation);
        } else {
          setNotifications([{
            type: 'info',
            title: 'No Alerts',
            message: 'No pest alerts found for your area',
            time: new Date().toLocaleString(),
            read: false
          }]);
        }
      } catch (error) {
        console.error('Error in pest alerts:', error);
        setNotifications([{
          type: 'warning',
          title: 'Connection Error',
          message: 'Unable to fetch pest alerts. Please check your connection.',
          time: new Date().toLocaleString(),
          read: false
        }]);
      } finally {
        setLoading(false);
      }
    };

    fetchPestAlerts();
  }, []);

  const updateNotifications = (alertData, locationName) => {
    const newNotifications = [
      {
        type: alertData.alertLevel === 'HIGH' ? 'alert' : 'warning',
        title: `Pest Alert - ${locationName}`,
        message: `Alert Level: ${alertData.alertLevel}\nAffected Farmers: ${alertData.affectedFarmers}\n\nActive Pest Threats:\n${alertData.topThreats
          .map(threat => `• ${threat.pestName.toUpperCase()}\n  Severity: ${threat.percentage}% of cases`)
          .join('\n')}`,
        time: new Date(alertData.timestamp).toLocaleString(),
        read: false
      }
    ];

    if (alertData.recentInfestations && alertData.recentInfestations.length > 0) {
      const recentAlerts = alertData.recentInfestations.slice(0, 3).map(infestation => ({
        type: 'warning',
        title: `⚠️ ${infestation.pestName.toUpperCase()}`,
        message: `New pest detection alert!\nPest Type: ${infestation.pestName}`,
        time: new Date(infestation.detectionDateTime).toLocaleString(),
        read: false
      }));
      newNotifications.push(...recentAlerts);
    }

    setNotifications(newNotifications);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={normalize(24)} color="#FFFFFF" />
        </TouchableOpacity>
        <LinearGradient
          colors={['#FF9800', '#F57C00']}
          style={styles.header}
        >
          <ThemedText style={styles.headerTitle}>Pest Alerts</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            {notifications.length} active alerts in your area
          </ThemedText>
        </LinearGradient>
      </View>

      <View style={styles.content}>
        {loading ? (
          <ThemedText style={styles.loadingText}>Loading alerts...</ThemedText>
        ) : notifications.length > 0 ? (
          notifications.map((notification, index) => (
            <NotificationCard key={index} {...notification} />
          ))
        ) : (
          <ThemedText style={styles.noAlertsText}>No active alerts in your area</ThemedText>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: normalize(20),
    left: normalize(20),
    zIndex: 1,
    padding: normalize(8),
    borderRadius: normalize(20),
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  header: {
    padding: normalize(20),
    paddingTop: normalize(60),
    borderBottomLeftRadius: normalize(20),
    borderBottomRightRadius: normalize(20),
  },
  headerTitle: {
    fontSize: normalize(24),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: normalize(8),
  },
  headerSubtitle: {
    fontSize: normalize(16),
    color: '#FFFFFF',
    opacity: 0.8,
  },
  content: {
    padding: normalize(16),
  },
  loadingText: {
    textAlign: 'center',
    marginTop: normalize(20),
    fontSize: normalize(16),
    color: '#666',
  },
  noAlertsText: {
    textAlign: 'center',
    marginTop: normalize(20),
    fontSize: normalize(16),
    color: '#666',
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(15),
    padding: normalize(16),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  iconContainer: {
    width: normalize(50),
    height: normalize(50),
    borderRadius: normalize(25),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: normalize(16),
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: normalize(16),
    fontWeight: 'bold',
    marginBottom: normalize(4),
  },
  notificationMessage: {
    fontSize: normalize(14),
    color: '#666666',
    marginBottom: normalize(8),
  },
  notificationTime: {
    fontSize: normalize(12),
    color: '#999999',
  },
}); 