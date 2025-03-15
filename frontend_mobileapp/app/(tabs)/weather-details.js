import { ScrollView, StyleSheet, View, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { WEATHER_API_KEY, WEATHER_BASE_URL } from '@/constants/Config';

const { width } = Dimensions.get('window');

const getWeatherIcon = (iconCode) => {
  const iconMapping = {
    '01d': 'wb-sunny',
    '01n': 'nights-stay',
    '02d': 'partly-cloudy-day',
    '02n': 'nights-stay',
    '03d': 'cloud',
    '03n': 'cloud',
    '04d': 'cloud',
    '04n': 'cloud',
    '09d': 'grain',
    '09n': 'grain',
    '10d': 'water',
    '10n': 'water',
    '11d': 'flash-on',
    '11n': 'flash-on',
    '13d': 'ac-unit',
    '13n': 'ac-unit',
    '50d': 'blur-on',
    '50n': 'blur-on'
  };
  return iconMapping[iconCode] || 'wb-sunny';
};

const WeatherDetailCard = ({ icon, title, value, unit }) => {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#2A2A2A' : '#FFFFFF';
  
  return (
    <View style={[styles.detailCard, { backgroundColor }]}>
      <MaterialIcons name={icon} size={24} color="#4CAF50" />
      <View style={styles.detailContent}>
        <ThemedText style={styles.detailTitle}>{title}</ThemedText>
        <View style={styles.detailValue}>
          <ThemedText style={styles.value}>{value}</ThemedText>
          <ThemedText style={styles.unit}>{unit}</ThemedText>
        </View>
      </View>
    </View>
  );
};

const ForecastItem = ({ date, temp, icon, description }) => {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#2A2A2A' : '#FFFFFF';
  
  return (
    <View style={[styles.forecastItem, { backgroundColor }]}>
      <ThemedText style={styles.forecastDate}>
        {new Date(date * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </ThemedText>
      <MaterialIcons name={getWeatherIcon(icon)} size={24} color="#4CAF50" />
      <ThemedText style={styles.forecastTemp}>{Math.round(temp)}°C</ThemedText>
      <ThemedText style={styles.forecastDesc}>{description}</ThemedText>
    </View>
  );
};

export default function WeatherDetailsScreen() {
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#151718' : '#F5F5F5';

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const fetchForecastData = async (lat, lon) => {
    try {
      const response = await fetch(
        `${WEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
      );

      if (!response.ok) throw new Error('Forecast API request failed');

      const data = await response.json();
      const dailyForecasts = data.list.filter((item, index) => index % 8 === 0);
      setForecastData(dailyForecasts);
    } catch (err) {
      console.error('Forecast fetch error:', err);
    }
  };

  const fetchWeatherData = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const [weatherResponse] = await Promise.all([
        fetch(
          `${WEATHER_BASE_URL}/weather?lat=${location.coords.latitude}&lon=${location.coords.longitude}&appid=${WEATHER_API_KEY}&units=metric`
        ),
        fetchForecastData(location.coords.latitude, location.coords.longitude)
      ]);

      if (!weatherResponse.ok) throw new Error('Weather API request failed');

      const data = await weatherResponse.json();
      setWeatherData(data);
    } catch (err) {
      setError('Failed to fetch weather data');
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <ThemedText>Loading weather data...</ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <ThemedText>{error}</ThemedText>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <LinearGradient
        colors={['#4361EE', '#3F37C9']}
        style={styles.header}
      >
        <View style={styles.mainWeather}>
          <MaterialIcons name="wb-sunny" size={64} color="#FFD60A" />
          <ThemedText style={styles.temperature}>
            {Math.round(weatherData?.main?.temp)}°C
          </ThemedText>
          <ThemedText style={styles.weatherDescription}>
            {weatherData?.weather[0]?.description}
          </ThemedText>
          <View style={styles.locationInfo}>
            <MaterialIcons name="location-on" size={20} color="#FFFFFF" />
            <ThemedText style={styles.locationText}>
              {weatherData?.name}, {weatherData?.sys?.country}
            </ThemedText>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.detailsContainer}>
        <ThemedText style={styles.sectionTitle}>Weather Details</ThemedText>
        <View style={styles.detailsGrid}>
          <WeatherDetailCard
            icon="opacity"
            title="Humidity"
            value={weatherData?.main?.humidity}
            unit="%"
          />
          <WeatherDetailCard
            icon="air"
            title="Wind Speed"
            value={Math.round(weatherData?.wind?.speed * 3.6)}
            unit="km/h"
          />
          <WeatherDetailCard
            icon="compress"
            title="Pressure"
            value={weatherData?.main?.pressure}
            unit="hPa"
          />
          <WeatherDetailCard
            icon="visibility"
            title="Visibility"
            value={Math.round(weatherData?.visibility / 1000)}
            unit="km"
          />
          <WeatherDetailCard
            icon="thermostat"
            title="Feels Like"
            value={Math.round(weatherData?.main?.feels_like)}
            unit="°C"
          />
          <WeatherDetailCard
            icon="water-drop"
            title="Dew Point"
            value={Math.round(weatherData?.main?.temp - (100 - weatherData?.main?.humidity) / 5)}
            unit="°C"
          />
        </View>
      </View>

      {forecastData && (
        <View style={styles.forecastContainer}>
          <ThemedText style={styles.sectionTitle}>5-Day Forecast</ThemedText>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.forecastScroll}
          >
            {forecastData.map((day, index) => (
              <ForecastItem
                key={index}
                date={day.dt}
                temp={day.main.temp}
                icon={day.weather[0].icon}
                description={day.weather[0].description}
              />
            ))}
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  mainWeather: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  temperature: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginVertical: 10,
  },
  weatherDescription: {
    fontSize: 24,
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  locationText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginLeft: 5,
  },
  detailsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  detailCard: {
    width: (width - 55) / 2,
    padding: 15,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  detailContent: {
    marginLeft: 10,
  },
  detailTitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  detailValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  unit: {
    fontSize: 14,
    marginLeft: 5,
    opacity: 0.7,
  },
  forecastContainer: {
    padding: 20,
  },
  forecastScroll: {
    marginTop: 10,
  },
  forecastItem: {
    padding: 15,
    borderRadius: 15,
    marginRight: 12,
    alignItems: 'center',
    width: 100,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  forecastDate: {
    fontSize: 14,
    marginBottom: 8,
  },
  forecastTemp: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  forecastDesc: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.7,
  },
}); 