import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Dimensions } from 'react-native';
import PestMap from './PestMap';

interface PestInfestation {
  id: number;
  pestName: string;
  description: string;
  severity: string;
  latitude: number;
  longitude: number;
  farmerId: number;
}

const PestInfestationList: React.FC = () => {
  const [pestInfestations, setPestInfestations] = useState<PestInfestation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPestInfestations();
  }, []);

  const fetchPestInfestations = async () => {
    try {
      const response = await fetch('http://localhost:8083/api/pest-infestations');
      if (!response.ok) {
        throw new Error('Failed to fetch pest infestations');
      }
      const data = await response.json();
      setPestInfestations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8083/api/pest-infestations/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete pest infestation');
      }
      setPestInfestations(pestInfestations.filter(pest => pest.id !== id));
      Alert.alert('Success', 'Pest infestation deleted successfully');
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to delete pest infestation');
    }
  };

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error}</Text>;

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <PestMap />
      </View>
      <FlatList
        data={pestInfestations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.title}>{item.pestName}</Text>
            <Text style={styles.description}>{item.description}</Text>
            <Text style={styles.severity}>Severity: {item.severity}</Text>
            <Text style={styles.location}>
              Location: {item.latitude}, {item.longitude}
            </Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item.id)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  mapContainer: {
    height: Dimensions.get('window').height * 0.4,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  item: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    marginTop: 8,
  },
  severity: {
    fontSize: 14,
    marginTop: 8,
    color: '#666',
  },
  location: {
    fontSize: 14,
    marginTop: 8,
    color: '#666',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default PestInfestationList; 