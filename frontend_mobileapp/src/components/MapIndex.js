// Platform-specific map imports
import { Platform } from 'react-native';

// Export the appropriate map component based on platform
export const getPlatformMapComponent = () => {
  if (Platform.OS === 'web') {
    // Use the web-specific implementation (Leaflet)
    return require('./MapComponent').default;
  } else {
    // Use the native implementation (react-native-maps)
    return require('./PestMap.native').default;
  }
};

export default getPlatformMapComponent(); 