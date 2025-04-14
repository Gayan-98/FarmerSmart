import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Platform,
  Linking,
  ScrollView,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from 'react-native-maps';

interface PestInfestation {
  id?: string;
  _id?: string;
  pestName: string;
  detectedLocation: string;
  detectionDateTime?: string;
  _class?: string;
  farmer?: any;
  latitude?: number | null;
  longitude?: number | null;
}

interface LocationCoordinates {
  lat: number;
  lon: number;
}

interface PestInfestationWithCoordinates extends PestInfestation {
  coordinates?: LocationCoordinates;
}

const API_BASE_URL = 'http://localhost:8083';
const NOMINATIM_API = 'https://nominatim.openstreetmap.org';

const ALL_PEST_DATA: PestInfestation[] = [
  {
    id: '67fcd2c5c1245904793c1147',
    pestName: 'rice water weevil',
    detectedLocation: 'Rajagiriya, Kolonnawa, Colombo District, Western Province',
    farmer: null,
    latitude: null,
    longitude: null
  },
 
  {
    _id: 'jaffna2',
    pestName: 'Rice Blast',
    detectedLocation: 'Nallur, Jaffna',
    detectionDateTime: '2025-04-13T10:39:07.189Z',
    _class: 'PestInfestation'
  },
  {
    _id: 'jaffna3',
    pestName: 'Brown Planthopper',
    detectedLocation: 'Chavakachcheri, Jaffna',
    detectionDateTime: '2025-04-12T10:39:07.189Z',
    _class: 'PestInfestation'
  }
];


const INITIAL_REGION = {
  latitude: 7.8731,
  longitude: 80.7718,
  latitudeDelta: 5,  
  longitudeDelta: 5,
};

const PestMap: React.FC = () => {
  const [pestInfestations, setPestInfestations] = useState<PestInfestationWithCoordinates[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPest, setSelectedPest] = useState<PestInfestationWithCoordinates | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [showList, setShowList] = useState(false);
  const mapRef = useRef<MapView>(null);

  const geocodeLocation = async (location: string): Promise<LocationCoordinates | undefined> => {
    try {
      const response = await fetch(
        `${NOMINATIM_API}/search?format=json&q=${encodeURIComponent(location + ', Sri Lanka')}`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon)
        };
      }
      return undefined;
    } catch (err) {
      console.error('Geocoding error:', err);
      return undefined;
    }
  };

  const processAllPestData = async () => {
    try {
      setLoading(true);
      const pestWithCoordinates: PestInfestationWithCoordinates[] = await Promise.all(
        ALL_PEST_DATA.map(async (pest) => ({
          ...pest,
          coordinates: await geocodeLocation(pest.detectedLocation)
        }))
      );

      setPestInfestations(pestWithCoordinates);

      // Fit map to show all markers
      if (mapRef.current && pestWithCoordinates.length > 0) {
        const validCoordinates = pestWithCoordinates
          .filter(pest => pest.coordinates)
          .map(pest => ({
            latitude: pest.coordinates!.lat,
            longitude: pest.coordinates!.lon,
          }));

        if (validCoordinates.length > 0) {
          mapRef.current.fitToCoordinates(validCoordinates, {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true,
          });
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Failed to process pest infestations: ${errorMessage}`);
      console.error('Error processing pest infestations:', err);
    } finally {
      setLoading(false);
    }
  };

  const openInMaps = async (coordinates: LocationCoordinates) => {
    const url = Platform.select({
      ios: `maps:${coordinates.lat},${coordinates.lon}`,
      android: `geo:${coordinates.lat},${coordinates.lon}?q=${coordinates.lat},${coordinates.lon}(Pest Location)`,
      default: `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lon}`,
    });

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        console.error('Cannot open URL:', url);
      }
    } catch (error) {
      console.error('Error opening maps:', error);
    }
  };

  useEffect(() => {
    processAllPestData();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date not available';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            processAllPestData();
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={INITIAL_REGION}
        onMapReady={() => setMapReady(true)}
      >
        {mapReady && pestInfestations.map((pest) => 
          pest.coordinates ? (
            <Marker
              key={pest.id || pest._id}
              coordinate={{
                latitude: pest.coordinates.lat,
                longitude: pest.coordinates.lon
              }}
              pinColor="red"
              title={pest.pestName}
              description={pest.detectedLocation}
            >
              <Callout onPress={() => setSelectedPest(pest)}>
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle}>{pest.pestName}</Text>
                  <Text style={styles.calloutText}>📍 {pest.detectedLocation}</Text>
                  <Text style={styles.calloutText}>🕒 {formatDate(pest.detectionDateTime)}</Text>
                  <Text style={styles.calloutLink}>Tap for more details</Text>
                </View>
              </Callout>
            </Marker>
          ) : null
        )}
      </MapView>

      <TouchableOpacity
        style={styles.listButton}
        onPress={() => setShowList(!showList)}
      >
        <Text style={styles.listButtonText}>{showList ? 'Hide List' : 'Show List'}</Text>
      </TouchableOpacity>

      {showList && (
        <View style={styles.listContainer}>
          <ScrollView style={styles.listScroll}>
            {pestInfestations.map((pest) => (
              <TouchableOpacity
                key={pest.id || pest._id}
                style={styles.listItem}
                onPress={() => {
                  setSelectedPest(pest);
                  setShowList(false);
                }}
              >
                <Text style={styles.listPestName}>{pest.pestName}</Text>
                <Text style={styles.listLocation}>{pest.detectedLocation}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <Modal
        visible={!!selectedPest}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedPest(null)}
      >
        {selectedPest && (
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{selectedPest.pestName}</Text>
              <Text style={styles.modalText}>Location: {selectedPest.detectedLocation}</Text>
              <Text style={styles.modalText}>Detected: {formatDate(selectedPest.detectionDateTime)}</Text>
              {selectedPest.coordinates && (
                <TouchableOpacity
                  style={styles.viewOnMapButton}
                  onPress={() => {
                    setSelectedPest(null);
                    openInMaps(selectedPest.coordinates!);
                  }}
                >
                  <Text style={styles.viewOnMapText}>Open in Maps</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.closeButton, { marginTop: 12 }]}
                onPress={() => setSelectedPest(null)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  listButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  listButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  listContainer: {
    position: 'absolute',
    top: 60,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    maxHeight: '50%',
    width: 250,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  listScroll: {
    maxHeight: '100%',
  },
  listItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  listPestName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  listLocation: {
    fontSize: 12,
    color: '#666',
  },
  calloutContainer: {
    padding: 10,
    maxWidth: 200,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  calloutText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  calloutLink: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 4,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#666',
  },
  viewOnMapButton: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  viewOnMapText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  closeButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
    marginHorizontal: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default PestMap; 