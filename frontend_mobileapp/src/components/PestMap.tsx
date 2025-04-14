import React, { useState, useEffect } from 'react';
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
  ScrollView,
} from 'react-native';

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
const screenWidth = Dimensions.get('window').width;


const INITIAL_CENTER = [7.8731, 80.7718];
const ZOOM_LEVEL = 8;


const ALL_PEST_DATA: PestInfestation[] = [


  {
    _id: 'jaffna1',
    pestName: 'Fall Armyworm',
    detectedLocation: 'Jaffna, Northern Province',
    detectionDateTime: '2025-04-14T10:39:07.189Z',
    _class: 'PestInfestation'
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

const PestMap: React.FC = () => {
  const [pestInfestations, setPestInfestations] = useState<PestInfestationWithCoordinates[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPest, setSelectedPest] = useState<PestInfestationWithCoordinates | null>(null);

  const fetchPestInfestations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pest-infestations`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching pest infestations:', error);
      throw error;
    }
  };

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
      
      const pestData = await fetchPestInfestations();
      console.log('Fetched pest data:', pestData);

   
      const pestWithCoordinates: PestInfestationWithCoordinates[] = await Promise.all(
        pestData.map(async (pest: PestInfestation) => {
         
          if (pest.latitude && pest.longitude) {
            return {
              ...pest,
              coordinates: {
                lat: pest.latitude,
                lon: pest.longitude
              }
            };
          }
        
          const coordinates = await geocodeLocation(pest.detectedLocation);
          return {
            ...pest,
            coordinates
          };
        })
      );

      setPestInfestations(pestWithCoordinates);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Failed to process pest infestations: ${errorMessage}`);
      console.error('Error processing pest infestations:', err);
    } finally {
      setLoading(false);
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

  if (Platform.OS === 'web') {
    // Generate the HTML content for the map
    const mapHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Pest Infestations Map</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
          <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
          <style>
            #map { height: 100vh; width: 100%; }
            .leaflet-popup-content {
              margin: 10px;
              max-width: 200px;
            }
            .pest-title {
              font-weight: bold;
              font-size: 16px;
              margin-bottom: 5px;
            }
            .pest-info {
              font-size: 14px;
              color: #666;
              margin-bottom: 3px;
            }
          </style>
        </head>
        <body style="margin:0;padding:0;">
          <div id="map"></div>
          <script>
            // Initialize the map centered on Sri Lanka
            const map = L.map('map').setView([7.8731, 80.7718], 8);
            
            // Add the OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 19,
              attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            // Get the pest data
            const pests = ${JSON.stringify(pestInfestations.filter(pest => pest.coordinates))};
            
            // Create markers for each pest
            const markers = [];
            pests.forEach(pest => {
              if (pest.coordinates) {
                const marker = L.marker([pest.coordinates.lat, pest.coordinates.lon])
                  .addTo(map)
                  .bindPopup(\`
                    <div class="pest-title">\${pest.pestName}</div>
                    <div class="pest-info">📍 \${pest.detectedLocation}</div>
                    <div class="pest-info">🕒 \${pest.detectionDateTime ? new Date(pest.detectionDateTime).toLocaleDateString() : 'Date not available'}</div>
                  \`);
                markers.push(marker);
              }
            });

            // If we have markers, fit the map to show all of them
            if (markers.length > 0) {
              const group = L.featureGroup(markers);
              map.fitBounds(group.getBounds().pad(0.1));
            }
          </script>
        </body>
      </html>
    `;

    return (
      <View style={styles.container}>
        <iframe
          srcDoc={mapHtml}
          style={{
            width: '100%',
            height: '100%',
            border: 'none'
          }}
          title="Pest Infestations Map"
        />
        <View style={styles.legendContainer}>
          <Text style={styles.legendTitle}>Pest Infestations</Text>
          <ScrollView style={styles.legendScroll}>
            {pestInfestations.map((pest) => (
              <TouchableOpacity
                key={pest.id || pest._id}
                style={styles.legendItem}
                onPress={() => setSelectedPest(pest)}
              >
                <Text style={styles.legendPestName}>{pest.pestName}</Text>
                <Text style={styles.legendLocation}>{pest.detectedLocation}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        {selectedPest && (
          <Modal
            visible={!!selectedPest}
            transparent={true}
            onRequestClose={() => setSelectedPest(null)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{selectedPest.pestName}</Text>
                <Text style={styles.modalText}>Location: {selectedPest.detectedLocation}</Text>
                <Text style={styles.modalText}>
                  Detected: {formatDate(selectedPest.detectionDateTime)}
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setSelectedPest(null)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
      </View>
    );
  }


  return <View style={styles.container} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  legendContainer: {
    position: 'absolute',
    top: 10,
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
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  legendScroll: {
    maxHeight: '90%',
  },
  legendItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  legendPestName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  legendLocation: {
    fontSize: 12,
    color: '#666',
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
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 8,
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