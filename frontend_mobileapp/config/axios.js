import axios from 'axios';
import { Platform } from 'react-native';

// Configure baseURL based on platform and environment
const getBaseUrl = () => {
  if (Platform.OS === 'android') {
    return __DEV__ ? 'http://10.0.2.2:8083' : 'http://192.168.142.99:8083';
  } else if (Platform.OS === 'ios') {
    return __DEV__ ? 'http://localhost:8083' : 'http://192.168.142.99:8083';
  }
  return 'http://localhost:8083'; // default for web
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

export default api; 