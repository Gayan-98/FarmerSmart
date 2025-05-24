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

interface DiseaseInfestation {
  id?: string;
  _id?: string;
  pestName: string;
  detectedLocation: string;
  detectionDateTime?: string;
  _class?: string;
  farmer?: any;
  latitude?: number | null;
  longitude?: number | null;
  severity?: 'low' | 'medium' | 'high'; // Added severity level
}

interface LocationCoordinates {
  lat: number;
  lon: number;
}

interface DiseaseInfestationWithCoordinates extends DiseaseInfestation {
  coordinates?: LocationCoordinates;
}

const API_BASE_URL = 'http://localhost:8083';
const NOMINATIM_API = 'https://nominatim.openstreetmap.org';
const screenWidth = Dimensions.get('window').width;

const INITIAL_CENTER = [7.8731, 80.7718];
const ZOOM_LEVEL = 8;

const ALL_DISEASE_DATA: DiseaseInfestation[] = [
  {
    _id: 'jaffna1',
    pestName: 'Fall Armyworm',
    detectedLocation: 'Jaffna, Northern Province',
    detectionDateTime: '2025-04-14T10:39:07.189Z',
    _class: 'PestInfestation',
    severity: 'high'
  },
  {
    _id: 'jaffna2',
    pestName: 'Rice Blast',
    detectedLocation: 'Nallur, Jaffna',
    detectionDateTime: '2025-04-13T10:39:07.189Z',
    _class: 'PestInfestation',
    severity: 'medium'
  },
  {
    _id: 'jaffna3',
    pestName: 'Brown Planthopper',
    detectedLocation: 'Chavakachcheri, Jaffna',
    detectionDateTime: '2025-04-12T10:39:07.189Z',
    _class: 'PestInfestation',
    severity: 'high'
  },
  {
    _id: 'colombo1',
    pestName: 'Leaf Blight',
    detectedLocation: 'Colombo',
    detectionDateTime: '2025-04-11T10:39:07.189Z',
    _class: 'PestInfestation',
    severity: 'low'
  },
  {
    _id: 'kandy1',
    pestName: 'Stem Borer',
    detectedLocation: 'Kandy',
    detectionDateTime: '2025-04-10T10:39:07.189Z',
    _class: 'PestInfestation',
    severity: 'medium'
  }
];

const DiseaseMap: React.FC = () => {
  const [diseaseInfestations, setDiseaseInfestations] = useState<DiseaseInfestationWithCoordinates[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDisease, setSelectedDisease] = useState<DiseaseInfestationWithCoordinates | null>(null);

  const fetchPestInfestations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/diseases-detection`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching pest infestations:', error);
      // Return sample data if API fails
      return ALL_DISEASE_DATA;
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
      console.log('Fetched disease data:', pestData);

      const pestWithCoordinates: DiseaseInfestationWithCoordinates[] = await Promise.all(
        pestData.map(async (pest: DiseaseInfestation) => {
          // If coordinates are already available, use them
          if (pest.latitude && pest.longitude) {
            return {
              ...pest,
              coordinates: {
                lat: pest.latitude,
                lon: pest.longitude
              }
            };
          }
          
          // Otherwise, geocode the location
          const coordinates = await geocodeLocation(pest.detectedLocation);
          return {
            ...pest,
            coordinates
          };
        })
      );

      setDiseaseInfestations(pestWithCoordinates);
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

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'high': return '#dc2626'; // Red
      case 'medium': return '#f59e0b'; // Orange
      case 'low': return '#16a34a'; // Green
      default: return '#dc2626'; // Default to red for unknown
    }
  };

  const getSeverityRadius = (severity?: string) => {
    switch (severity) {
      case 'high': return 15000; // 15km radius
      case 'medium': return 10000; // 10km radius
      case 'low': return 5000; // 5km radius
      default: return 10000;
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading disease outbreak data...</Text>
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
    // Generate the HTML content for the map with red affected areas
    const mapHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Disease Outbreak Map - Sri Lanka</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
          <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
          <style>
            #map { height: 100vh; width: 100%; }
            .leaflet-popup-content {
              margin: 12px;
              max-width: 250px;
            }
            .disease-title {
              font-weight: bold;
              font-size: 18px;
              margin-bottom: 8px;
              color: #dc2626;
            }
            .disease-info {
              font-size: 14px;
              color: #374151;
              margin-bottom: 4px;
            }
            .severity-badge {
              display: inline-block;
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: bold;
              color: white;
              margin-top: 4px;
            }
            .severity-high { background-color: #dc2626; }
            .severity-medium { background-color: #f59e0b; }
            .severity-low { background-color: #16a34a; }
            .outbreak-warning {
              background-color: #fef2f2;
              border-left: 4px solid #dc2626;
              padding: 8px;
              margin-top: 8px;
              border-radius: 4px;
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

            // Get the disease data
            const diseases = ${JSON.stringify(diseaseInfestations.filter(disease => disease.coordinates))};
            
            // Function to get severity color
            function getSeverityColor(severity) {
              switch (severity) {
                case 'high': return '#dc2626';
                case 'medium': return '#f59e0b';
                case 'low': return '#16a34a';
                default: return '#dc2626';
              }
            }
            
            // Function to get affected area radius
            function getSeverityRadius(severity) {
              switch (severity) {
                case 'high': return 15000; // 15km
                case 'medium': return 10000; // 10km
                case 'low': return 5000; // 5km
                default: return 10000;
              }
            }

            // Create affected areas (circles) and markers for each disease
            const markers = [];
            const circles = [];
            
            diseases.forEach(disease => {
              if (disease.coordinates) {
                const color = getSeverityColor(disease.severity);
                const radius = getSeverityRadius(disease.severity);
                
                // Create affected area circle
                const circle = L.circle([disease.coordinates.lat, disease.coordinates.lon], {
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.2,
                  radius: radius,
                  weight: 2
                }).addTo(map);
                
                circles.push(circle);
                
                // Create warning icon for disease marker
                const warningIcon = L.divIcon({
                  html: '<div style="background-color: ' + color + '; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                  iconSize: [20, 20],
                  className: 'disease-marker'
                });
                
                // Create marker with custom popup
                const marker = L.marker([disease.coordinates.lat, disease.coordinates.lon], {
                  icon: warningIcon
                })
                .addTo(map)
                .bindPopup(\`
                  <div class="disease-title">⚠️ \${disease.pestName}</div>
                  <div class="disease-info">📍 <strong>Location:</strong> \${disease.detectedLocation}</div>
                  <div class="disease-info">🕒 <strong>Detected:</strong> \${disease.detectionDateTime ? new Date(disease.detectionDateTime).toLocaleDateString() : 'Date not available'}</div>
                  <div class="disease-info">🎯 <strong>Affected Radius:</strong> \${(radius/1000).toFixed(1)} km</div>
                  <span class="severity-badge severity-\${disease.severity || 'high'}">\${(disease.severity || 'Unknown').toUpperCase()} RISK</span>
                  <div class="outbreak-warning">
                    <strong>⚠️ Disease Outbreak Alert</strong><br>
                    Immediate agricultural intervention recommended in this area.
                  </div>
                \`);
                
                markers.push(marker);
              }
            });

            // If we have markers, fit the map to show all affected areas
            if (circles.length > 0) {
              const group = L.featureGroup([...markers, ...circles]);
              map.fitBounds(group.getBounds().pad(0.1));
            }
            
            // Add legend
            const legend = L.control({position: 'bottomleft'});
            legend.onAdd = function (map) {
              const div = L.DomUtil.create('div', 'info legend');
              div.innerHTML = \`
                <div style="background: white; padding: 10px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                  <h4 style="margin: 0 0 8px 0; color: #dc2626;">Disease Outbreak Severity</h4>
                  <div><span style="background: #dc2626; width: 12px; height: 12px; display: inline-block; border-radius: 50%; margin-right: 5px;"></span> High Risk (15km radius)</div>
                  <div><span style="background: #f59e0b; width: 12px; height: 12px; display: inline-block; border-radius: 50%; margin-right: 5px;"></span> Medium Risk (10km radius)</div>
                  <div><span style="background: #16a34a; width: 12px; height: 12px; display: inline-block; border-radius: 50%; margin-right: 5px;"></span> Low Risk (5km radius)</div>
                </div>
              \`;
              return div;
            };
            legend.addTo(map);
            
            // Add outbreak statistics
            const stats = L.control({position: 'topright'});
            stats.onAdd = function (map) {
              const div = L.DomUtil.create('div', 'info stats');
              const highRisk = diseases.filter(d => d.severity === 'high').length;
              const mediumRisk = diseases.filter(d => d.severity === 'medium').length;
              const lowRisk = diseases.filter(d => d.severity === 'low').length;
              
              div.innerHTML = \`
                <div style="background: white; padding: 12px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.3); min-width: 180px;">
                  <h4 style="margin: 0 0 8px 0; color: #dc2626; text-align: center;">🚨 Outbreak Status</h4>
                  <div style="margin-bottom: 4px;"><strong>Total Outbreaks:</strong> \${diseases.length}</div>
                  <div style="margin-bottom: 4px; color: #dc2626;"><strong>High Risk:</strong> \${highRisk}</div>
                  <div style="margin-bottom: 4px; color: #f59e0b;"><strong>Medium Risk:</strong> \${mediumRisk}</div>
                  <div style="color: #16a34a;"><strong>Low Risk:</strong> \${lowRisk}</div>
                </div>
              \`;
              return div;
            };
            stats.addTo(map);
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
          title="Disease Outbreak Map"
        />
        <View style={styles.legendContainer}>
          <Text style={styles.legendTitle}>🚨 Active Outbreaks</Text>
          <ScrollView style={styles.legendScroll}>
            {diseaseInfestations.map((disease) => (
              <TouchableOpacity
                key={disease.id || disease._id}
                style={[
                  styles.legendItem,
                  { borderLeftColor: getSeverityColor(disease.severity), borderLeftWidth: 4 }
                ]}
                onPress={() => setSelectedDisease(disease)}
              >
                <Text style={styles.legendPestName}>{disease.pestName}</Text>
                <Text style={styles.legendLocation}>{disease.detectedLocation}</Text>
                <View style={[
                  styles.severityBadge,
                  { backgroundColor: getSeverityColor(disease.severity) }
                ]}>
                  <Text style={styles.severityText}>
                    {(disease.severity || 'unknown').toUpperCase()} RISK
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        {selectedDisease && (
          <Modal
            visible={!!selectedDisease}
            transparent={true}
            onRequestClose={() => setSelectedDisease(null)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>⚠️ {selectedDisease.pestName}</Text>
                <Text style={styles.modalText}>
                  <Text style={styles.modalLabel}>Location:</Text> {selectedDisease.detectedLocation}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.modalLabel}>Detected:</Text> {formatDate(selectedDisease.detectionDateTime)}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.modalLabel}>Affected Radius:</Text> {getSeverityRadius(selectedDisease.severity) / 1000} km
                </Text>
                <View style={[
                  styles.severityBadge,
                  { backgroundColor: getSeverityColor(selectedDisease.severity), alignSelf: 'flex-start' }
                ]}>
                  <Text style={styles.severityText}>
                    {(selectedDisease.severity || 'unknown').toUpperCase()} RISK
                  </Text>
                </View>
                <View style={styles.warningBox}>
                  <Text style={styles.warningText}>
                    🚨 Disease outbreak detected in this area. Immediate agricultural intervention recommended.
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setSelectedDisease(null)}
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

  // Mobile view with enhanced disease information
  return (
    <View style={styles.container}>
      <View style={styles.mobileHeader}>
        <Text style={styles.mobileTitle}>🚨 Disease Outbreaks</Text>
        <Text style={styles.mobileSubtitle}>Active agricultural threats across Sri Lanka</Text>
      </View>
      <ScrollView style={styles.mobileList}>
        {diseaseInfestations.map((disease) => (
          <TouchableOpacity
            key={disease.id || disease._id}
            style={[
              styles.mobileListItem,
              { borderLeftColor: getSeverityColor(disease.severity), borderLeftWidth: 6 }
            ]}
            onPress={() => setSelectedDisease(disease)}
          >
            <Text style={styles.mobilePestName}>⚠️ {disease.pestName}</Text>
            <Text style={styles.mobileLocation}>📍 {disease.detectedLocation}</Text>
            <Text style={styles.mobileDate}>🕒 {formatDate(disease.detectionDateTime)}</Text>
            <View style={[
              styles.severityBadge,
              { backgroundColor: getSeverityColor(disease.severity) }
            ]}>
              <Text style={styles.severityText}>
                {(disease.severity || 'high').toUpperCase()} RISK
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {selectedDisease && (
        <Modal
          visible={!!selectedDisease}
          transparent={true}
          onRequestClose={() => setSelectedDisease(null)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>⚠️ {selectedDisease.pestName}</Text>
              <Text style={styles.modalText}>
                <Text style={styles.modalLabel}>Location:</Text> {selectedDisease.detectedLocation}
              </Text>
              <Text style={styles.modalText}>
                <Text style={styles.modalLabel}>Detected:</Text> {formatDate(selectedDisease.detectionDateTime)}
              </Text>
              <Text style={styles.modalText}>
                <Text style={styles.modalLabel}>Affected Radius:</Text> {getSeverityRadius(selectedDisease.severity) / 1000} km
              </Text>
              <View style={[
                styles.severityBadge,
                { backgroundColor: getSeverityColor(selectedDisease.severity), alignSelf: 'flex-start' }
              ]}>
                <Text style={styles.severityText}>
                  {(selectedDisease.severity || 'high').toUpperCase()} RISK
                </Text>
              </View>
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>
                  🚨 Disease outbreak detected in this area. Immediate agricultural intervention recommended.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedDisease(null)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  legendContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    maxHeight: '60%',
    width: 280,
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#dc2626',
  },
  legendScroll: {
    maxHeight: '90%',
  },
  legendItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fafafa',
    marginBottom: 4,
    borderRadius: 4,
  },
  legendPestName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  legendLocation: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  severityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#dc2626',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#374151',
  },
  modalLabel: {
    fontWeight: 'bold',
    color: '#111827',
  },
  warningBox: {
    backgroundColor: '#fef2f2',
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
    padding: 12,
    marginTop: 12,
    borderRadius: 4,
  },
  warningText: {
    color: '#991b1b',
    fontSize: 14,
    fontWeight: '500',
  },
  closeButton: {
    backgroundColor: '#dc2626',
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
  // Mobile-specific styles
  mobileHeader: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  mobileTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#dc2626',
  },
  mobileSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginTop: 4,
  },
  mobileList: {
    flex: 1,
    padding: 16,
  },
  mobileListItem: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  mobilePestName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#dc2626',
  },
  mobileLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  mobileDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
});

export default DiseaseMap;