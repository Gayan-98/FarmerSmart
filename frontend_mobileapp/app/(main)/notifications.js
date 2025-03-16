import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router } from 'expo-router';
import * as Location from 'expo-location';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;

const normalize = (size) => Math.round(scale * size);

const NotificationCard = ({ type, title, message, time, read }) => {
  const getNotificationColor = () => {
    switch (type) {
      case 'alert': return '#FF5252';
      case 'warning': return '#FFC107';
      case 'success': return '#4CAF50';
      default: return '#2196F3';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'alert': return 'warning';
      case 'warning': return 'info';
      case 'success': return 'check-circle';
      default: return 'notifications';
    }
  };

  return (
    <TouchableOpacity 
      style={[
        styles.notificationCard,
        !read && styles.unreadCard
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: getNotificationColor() }]}>
        <MaterialIcons name={getIcon()} size={normalize(24)} color="#FFFFFF" />
      </View>
      <View style={styles.notificationContent}>
        <ThemedText style={styles.notificationTitle}>{title}</ThemedText>
        <ThemedText style={styles.notificationMessage}>{message}</ThemedText>
        <ThemedText style={styles.notificationTime}>{time}</ThemedText>
      </View>
    </TouchableOpacity>
  );
};

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#151718' : '#F5F5F5';
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchPestAlerts = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.error('Location permission denied');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${location.coords.latitude}&lon=${location.coords.longitude}&format=json`
        );
        const locationData = await response.json();
        const city = locationData.address?.city;

        if (city) {
          const alertsResponse = await fetch(
            `http://localhost:8083/api/pest-alerts/area/${city}`
          );
          
          if (!alertsResponse.ok) throw new Error('Failed to fetch alerts');
          
          const alertData = await alertsResponse.json();
          const newNotifications = [
            {
              type: alertData.alertLevel === 'HIGH' ? 'alert' : 'warning',
              title: `Pest Alert - ${alertData.location}`,
              message: `Alert Level: ${alertData.alertLevel}\nAffected Farmers: ${alertData.affectedFarmers}\n\nActive Pest Threats:\n${alertData.topThreats
                .map(threat => `• ${threat.pestName.toUpperCase()}\n  Severity: ${threat.percentage}% of cases`)
                .join('\n')}`,
              time: new Date(alertData.timestamp).toLocaleString(),
              read: false
            },
            ...alertData.recentInfestations.slice(0, 3).map(infestation => ({
              type: 'warning',
              title: `⚠️ ${infestation.pestName.toUpperCase()}`,
              message: `New pest detection alert!\nPest Type: ${infestation.pestName}`,
              time: new Date(infestation.detectionDateTime).toLocaleString(),
              read: false
            }))
          ];

          setNotifications(newNotifications);
        }
      } catch (error) {
        console.error('Error fetching pest alerts:', error);
        setNotifications([{
          type: 'warning',
          title: 'Connection Error',
          message: 'Unable to fetch pest alerts',
          time: new Date().toLocaleString(),
          read: false
        }]);
      }
    };

    fetchPestAlerts();
  }, []);

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
        {notifications.map((notification, index) => (
          <NotificationCard key={index} {...notification} />
        ))}
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
    top: normalize(50),
    left: normalize(20),
    zIndex: 10,
    padding: normalize(8),
    borderRadius: normalize(20),
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  header: {
    padding: normalize(20),
    paddingTop: normalize(60),
    borderBottomLeftRadius: normalize(30),
    borderBottomRightRadius: normalize(30),
  },
  headerTitle: {
    fontSize: normalize(28),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: normalize(20),
    marginBottom: normalize(8),
  },
  headerSubtitle: {
    fontSize: normalize(16),
    color: '#FFFFFF',
    opacity: 0.8,
  },
  content: {
    padding: normalize(16),
    gap: normalize(12),
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