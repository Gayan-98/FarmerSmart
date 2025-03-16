import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';

export default function NotificationCard({ type, title, message, time, read }) {
  const getTypeColor = () => {
    switch (type) {
      case 'alert':
        return '#F44336';
      case 'warning':
        return '#FF9800';
      case 'success':
        return '#4CAF50';
      default:
        return '#2196F3';
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'alert':
        return 'warning';
      case 'warning':
        return 'info';
      case 'success':
        return 'check-circle';
      default:
        return 'notifications';
    }
  };

  return (
    <TouchableOpacity style={[styles.card, !read && styles.unread]}>
      <View style={[styles.iconContainer, { backgroundColor: getTypeColor() }]}>
        <MaterialIcons name={getTypeIcon()} size={24} color="#FFFFFF" />
      </View>
      <View style={styles.content}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        <ThemedText style={styles.message}>{message}</ThemedText>
        <ThemedText style={styles.time}>{time}</ThemedText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  unread: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  time: {
    fontSize: 12,
    color: '#999999',
  },
}); 