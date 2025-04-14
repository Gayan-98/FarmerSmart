import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';


if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  });
}

interface PestInfestation {
  _id: string;
  pestName: string;
  detectedLocation: string;
  detectionDateTime: string;
  _class: string;
}

interface Coordinates {
  lat: number;
  lng: number;
}

interface MapComponentProps {
  pestInfestations: PestInfestation[];
  onSelectPest: (pest: PestInfestation) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({ pestInfestations, onSelectPest }) => {
  const [markers, setMarkers] = useState<Array<{ pest: PestInfestation; coords: Coordinates }>>([]);
  const center: [number, number] = [7.8731, 80.7718];

  useEffect(() => {
    const geocodeLocations = async () => {
      const geocodedMarkers = await Promise.all(
        pestInfestations.map(async (pest) => {
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(pest.detectedLocation)}`
            );
            const data = await response.json();
            if (data && data.length > 0) {
              return {
                pest,
                coords: {
                  lat: parseFloat(data[0].lat),
                  lng: parseFloat(data[0].lon)
                }
              };
            }
            return {
              pest,
              coords: { lat: 7.8731, lng: 80.7718 }
            };
          } catch (error) {
            console.error('Geocoding error:', error);
            return {
              pest,
              coords: { lat: 7.8731, lng: 80.7718 }
            };
          }
        })
      );
      setMarkers(geocodedMarkers);
    };

    if (typeof window !== 'undefined') {
      geocodeLocations();
    }
  }, [pestInfestations]);

  if (typeof window === 'undefined') {
    return null;
  }

  return (
    <div style={{ height: '40vh', width: '100%' }}>
      <MapContainer
        center={center}
        zoom={8}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {markers.map(({ pest, coords }) => (
          <Marker
            key={pest._id}
            position={[coords.lat, coords.lng]}
            eventHandlers={{
              click: () => onSelectPest(pest),
            }}
          >
            <Popup>
              <div>
                <h3>{pest.pestName}</h3>
                <p>{pest.detectedLocation}</p>
                <p>Detected: {new Date(pest.detectionDateTime).toLocaleDateString()}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent; 