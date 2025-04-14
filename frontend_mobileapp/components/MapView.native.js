import React from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function MapView({ 
  region, 
  onRegionChange, 
  markers, 
  showsUserLocation,
  showsMyLocationButton 
}) {
  return (
    <MapView
      style={styles.map}
      region={region}
      onRegionChangeComplete={onRegionChange}
      showsUserLocation={showsUserLocation}
      showsMyLocationButton={showsMyLocationButton}
    >
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          coordinate={{
            latitude: marker.latitude,
            longitude: marker.longitude,
          }}
          title={marker.title}
          description={marker.description}
          pinColor={marker.color}
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
}); 