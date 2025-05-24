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
    const fetchAllAlerts = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.error('Location permission denied');
          setNotifications([{
            type: 'warning',
            title: 'Location Access Required',
            message: 'Please enable location access to receive local alerts',
            time: new Date().toLocaleString(),
            read: false,
            alertCategory: 'system'
          }]);
          setLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        
        // Log GPS coordinates
        console.log('📍 GPS Coordinates:', {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });
        
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${location.coords.latitude}&lon=${location.coords.longitude}&format=json`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch location data');
        }
        
        const locationData = await response.json();
        
        // Log full location response
        console.log('🗺️ Full Location Data:', locationData);
        console.log('🏠 Address Details:', locationData.address);
        
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
        
        // Log location hierarchy
        console.log('📋 Location Parts (specific to general):', locationParts);

        if (locationParts.length === 0) {
          setNotifications([{
            type: 'warning',
            title: 'Location Error',
            message: 'Unable to determine your location',
            time: new Date().toLocaleString(),
            read: false,
            alertCategory: 'system'
          }]);
          setLoading(false);
          return;
        }

        // Fetch both pest and disease alerts
        await Promise.all([
          fetchAlertsForType('pest-alerts', locationParts),
          fetchAlertsForType('disease-alerts', locationParts)
        ]);

      } catch (error) {
        console.error('Error in fetching alerts:', error);
        setNotifications([{
          type: 'warning',
          title: 'Connection Error',
          message: 'Unable to fetch alerts. Please check your connection.',
          time: new Date().toLocaleString(),
          read: false,
          alertCategory: 'system'
        }]);
      } finally {
        setLoading(false);
      }
    };

    const fetchAlertsForType = async (alertType, locationParts) => {
      let alertData = null;
      let usedLocation = null;
      const category = alertType === 'pest-alerts' ? 'pest' : 'disease';

      // Try each location part from most specific to least specific
      for (const locationPart of locationParts) {
        try {
          console.log(`🔍 Trying to fetch ${category} alerts for: ${locationPart}`);
          
          const alertsResponse = await fetch(
            `${API_BASE_URL}/api/${alertType}/area/${encodeURIComponent(locationPart)}`
          );
          
          console.log(`📡 API Response for ${locationPart}:`, alertsResponse.status);
          
          if (alertsResponse.ok) {
            alertData = await alertsResponse.json();
            usedLocation = locationPart;
            console.log(`✅ Successfully fetched ${category} alerts for: ${locationPart}`);
            console.log(`📊 Alert Data:`, alertData);
            break;
          } else {
            console.log(`❌ No ${category} alerts found for: ${locationPart}`);
          }
        } catch (error) {
          console.error(`❌ Error fetching ${category} alerts for ${locationPart}:`, error);
        }
      }

      if (alertData) {
        updateNotifications(alertData, usedLocation, category);
      } else {
        // Add a "no alerts" notification for this category
        setNotifications(prev => [...prev, {
          type: 'info',
          title: `No ${category.charAt(0).toUpperCase() + category.slice(1)} Alerts`,
          message: `No ${category} alerts found for your area`,
          time: new Date().toLocaleString(),
          read: false,
          alertCategory: category
        }]);
      }
    };

    fetchAllAlerts();
  }, []);

  const updateNotifications = (alertData, locationName, category) => {
    const categoryEmoji = category === 'pest' ? '🐛' : '🦠';
    const categoryColor = category === 'pest' ? '#FF9800' : '#E91E63';
    
    const newNotifications = [
      {
        type: alertData.alertLevel === 'HIGH' ? 'alert' : 'warning',
        title: `${categoryEmoji} ${category.charAt(0).toUpperCase() + category.slice(1)} Alert - ${locationName}`,
        message: `Alert Level: ${alertData.alertLevel}\nAffected Farmers: ${alertData.affectedFarmers}\n\nActive ${category.charAt(0).toUpperCase() + category.slice(1)} Threats:\n${alertData.topThreats
          .map(threat => `• ${threat.pestName ? threat.pestName.toUpperCase() : threat.diseaseName?.toUpperCase()}\n  Severity: ${threat.percentage}% of cases`)
          .join('\n')}`,
        time: new Date(alertData.timestamp).toLocaleString(),
        read: false,
        alertCategory: category,
        categoryColor: categoryColor
      }
    ];

    if (alertData.recentInfestations && alertData.recentInfestations.length > 0) {
      const recentAlerts = alertData.recentInfestations.slice(0, 3).map(infestation => ({
        type: 'warning',
        title: `${categoryEmoji} ${infestation.pestName ? infestation.pestName.toUpperCase() : infestation.diseaseName?.toUpperCase()}`,
        message: `New ${category} detection alert!\n${category === 'pest' ? 'Pest' : 'Disease'} Type: ${infestation.pestName || infestation.diseaseName}`,
        time: new Date(infestation.detectionDateTime).toLocaleString(),
        read: false,
        alertCategory: category,
        categoryColor: categoryColor
      }));
      newNotifications.push(...recentAlerts);
    }

    setNotifications(prev => [...prev, ...newNotifications]);
  };

  // Sort notifications by time (most recent first) and then by category
  const sortedNotifications = notifications.sort((a, b) => {
    const timeA = new Date(a.time);
    const timeB = new Date(b.time);
    return timeB - timeA;
  });

  const totalAlerts = notifications.filter(n => n.alertCategory !== 'system').length;

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
          <ThemedText style={styles.headerTitle}>Farm Alerts</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            {totalAlerts} active alerts in your area
          </ThemedText>
          <View style={styles.categoryIndicators}>
            <View style={styles.categoryIndicator}>
              <ThemedText style={styles.categoryEmoji}>🐛</ThemedText>
              <ThemedText style={styles.categoryLabel}>Pest Alerts</ThemedText>
            </View>
            <View style={styles.categoryIndicator}>
              <ThemedText style={styles.categoryEmoji}>🦠</ThemedText>
              <ThemedText style={styles.categoryLabel}>Disease Alerts</ThemedText>
            </View>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.content}>
        {loading ? (
          <ThemedText style={styles.loadingText}>Loading alerts...</ThemedText>
        ) : sortedNotifications.length > 0 ? (
          sortedNotifications.map((notification, index) => (
            <NotificationCard 
              key={index} 
              {...notification}
              style={notification.categoryColor ? {
                borderLeftColor: notification.categoryColor,
                borderLeftWidth: 4
              } : {}}
            />
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
    marginBottom: normalize(16),
  },
  categoryIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  categoryIndicator: {
    alignItems: 'center',
  },
  categoryEmoji: {
    fontSize: normalize(20),
    marginBottom: normalize(4),
  },
  categoryLabel: {
    fontSize: normalize(12),
    color: '#FFFFFF',
    opacity: 0.9,
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
    marginBottom: normalize(12),
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