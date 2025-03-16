import { ScrollView, StyleSheet, View, Image, TouchableOpacity, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';

const WeatherCard = () => (
  <LinearGradient colors={['#4361EE', '#3F37C9']} style={styles.weatherCard}>
    <View style={styles.weatherHeader}>
      <View style={styles.weatherInfo}>
        <MaterialIcons name="wb-sunny" size={32} color="#FFD60A" />
        <View style={styles.weatherDetails}>
          <ThemedText style={styles.temperature}>28°C</ThemedText>
          <ThemedText style={styles.weatherText}>Sunny</ThemedText>
        </View>
      </View>
      <MaterialIcons name="location-on" size={20} color="#FFFFFF" />
    </View>
    <View style={styles.weatherStats}>
      <View style={styles.weatherStat}>
        <MaterialIcons name="opacity" size={20} color="#FFFFFF" />
        <ThemedText style={styles.statText}>65%</ThemedText>
        <ThemedText style={styles.statLabel}>Humidity</ThemedText>
      </View>
      <View style={styles.weatherStat}>
        <MaterialIcons name="air" size={20} color="#FFFFFF" />
        <ThemedText style={styles.statText}>12km/h</ThemedText>
        <ThemedText style={styles.statLabel}>Wind</ThemedText>
      </View>
      <View style={styles.weatherStat}>
        <MaterialIcons name="water-drop" size={20} color="#FFFFFF" />
        <ThemedText style={styles.statText}>30%</ThemedText>
        <ThemedText style={styles.statLabel}>Rain</ThemedText>
      </View>
    </View>
  </LinearGradient>
);

const QuickActionButton = ({ icon, label, color, onPress }) => {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#2A2A2A' : '#FFFFFF';
  
  return (
    <TouchableOpacity 
      style={[styles.quickActionButton, { backgroundColor }]} 
      onPress={onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <MaterialIcons name={icon} size={24} color="#FFFFFF" />
      </View>
      <ThemedText>{label}</ThemedText>
    </TouchableOpacity>
  );
};

const CropHealthCard = ({ title, value, trend, color }) => {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#2A2A2A' : '#FFFFFF';
  
  return (
    <View style={[styles.cropHealthCard, { backgroundColor }]}>
      <View style={[styles.healthIndicator, { backgroundColor: color }]} />
      <View style={styles.healthContent}>
        <ThemedText style={styles.healthTitle}>{title}</ThemedText>
        <View style={styles.healthStats}>
          <ThemedText style={styles.healthValue}>{value}</ThemedText>
          <ThemedText style={[styles.healthTrend, { color }]}>{trend}</ThemedText>
        </View>
      </View>
    </View>
  );
};

const SmartCard = ({ title, value, unit, icon, trend }) => (
  <View style={styles.smartCard}>
    {icon}
    <View style={styles.cardContent}>
      <ThemedText style={styles.cardTitle}>{title}</ThemedText>
      <View style={styles.valueContainer}>
        <ThemedText style={styles.value}>{value}</ThemedText>
        <ThemedText style={styles.unit}>{unit}</ThemedText>
      </View>
      <View style={[styles.trendBadge, { backgroundColor: trend.color }]}>
        <ThemedText style={styles.trendText}>{trend.value}</ThemedText>
      </View>
    </View>
  </View>
);

const FeatureButton = ({ title, icon, color, onPress }) => (
  <Pressable onPress={onPress} style={styles.featureButton}>
    <LinearGradient colors={color} style={styles.featureGradient}>
      <View style={styles.featureIcon}>{icon}</View>
      <ThemedText style={styles.featureText}>{title}</ThemedText>
    </LinearGradient>
  </Pressable>
);

const TaskCard = () => {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#2A2A2A' : '#FFFFFF';
  
  return (
    <View style={[styles.taskCard, { backgroundColor }]}>
      <View style={styles.taskHeader}>
        <ThemedText style={styles.taskTitle}>Today's Tasks</ThemedText>
        <MaterialIcons name="list" size={24} color="#4CAF50" />
      </View>
      <View style={styles.taskList}>
        <View style={styles.taskItem}>
          <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
          <ThemedText style={styles.taskText}>Water tomato field</ThemedText>
        </View>
        <View style={styles.taskItem}>
          <MaterialIcons name="circle" size={20} color="#FF9800" />
          <ThemedText style={styles.taskText}>Check pest traps</ThemedText>
        </View>
        <View style={styles.taskItem}>
          <MaterialIcons name="circle" size={20} color="#FF9800" />
          <ThemedText style={styles.taskText}>Apply fertilizer</ThemedText>
        </View>
      </View>
    </View>
  );
};

export default function HomeScreen() {
  const { userProfile } = useAuth();
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? Colors.dark.background : Colors.light.background;

  const handlePestDetection = () => {
    router.push('/(tabs)/pest-detection');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <View>
          <ThemedText style={styles.greeting}>Good Morning 👋</ThemedText>
          <ThemedText style={styles.farmerName}>
            {userProfile?.farmerDetails ? 
              `${userProfile.farmerDetails.firstName}'s Farm` 
              : 'Loading...'}
          </ThemedText>
        </View>
        <TouchableOpacity onPress={() => router.push('/profile')}>
          <Image
            source={require('@/assets/images/download.jpeg')}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>

      <WeatherCard />

      <View style={styles.quickActions}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <MaterialIcons name="bolt" size={24} color="#4CAF50" />
            <ThemedText style={styles.sectionTitle}>Quick Actions</ThemedText>
          </View>
          <TouchableOpacity style={styles.seeAllButton}>
            <ThemedText style={styles.seeAllText}>See All</ThemedText>
            <MaterialIcons name="chevron-right" size={20} color="#4CAF50" />
          </TouchableOpacity>
        </View>
        <View style={styles.actionGrid}>
          <QuickActionButton
            icon="camera"
            label="Plant Scan"
            color="#4CAF50"
            onPress={() => router.push('/(tabs)/pest-detection')}
          />
          <QuickActionButton
            icon="water-drop"
            label="Irrigation"
            color="#2196F3"
            onPress={() => router.push('/(tabs)/rice-quality')}
          />
          <QuickActionButton
            icon="analytics"
            label="Analytics"
            color="#9C27B0"
            onPress={() => {}}
          />
          <QuickActionButton
            icon="notifications"
            label="Alerts"
            color="#FF9800"
            onPress={() => router.push('/(main)/notifications')}
          />
          <QuickActionButton
            icon="eco"
            label="Weed Seeds"
            color="#00BFA5"
            onPress={() => router.push('/(tabs)/weed-detection')}
          />
          <QuickActionButton
            icon="wb-cloudy"
            label="Weather"
            color="#F44336"
            onPress={() => router.push('/(main)/weather-details')}
          />
          <QuickActionButton
            icon="local-hospital"
            label="Disease Check"
            color="#9C27B0"
            onPress={() => router.push('/(tabs)/disease-detection')}
          />
        </View>
      </View>

      <TaskCard />

      <View style={styles.cropHealth}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Crop Health</ThemedText>
          <MaterialIcons name="arrow-forward" size={24} color="#4CAF50" />
        </View>
        <CropHealthCard
          title="Tomatoes"
          value="Excellent"
          trend="+12%"
          color="#4CAF50"
        />
        <CropHealthCard
          title="Corn"
          value="Good"
          trend="+5%"
          color="#2196F3"
        />
        <CropHealthCard
          title="Wheat"
          value="Needs Attention"
          trend="-3%"
          color="#FF9800"
        />
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Farm Overview</ThemedText>
        <View style={styles.smartCardsContainer}>
          <SmartCard
            title="Soil Moisture"
            value="65"
            unit="%"
            icon={<MaterialIcons name="opacity" size={24} color="#4CAF50" />}
            trend={{ value: "+2%", color: "#E8F5E9" }}
          />
          <SmartCard
            title="Temperature"
            value="24"
            unit="°C"
            icon={<MaterialIcons name="thermostat" size={24} color="#FF9800" />}
            trend={{ value: "Normal", color: "#FFF3E0" }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Smart Features</ThemedText>
        <View style={styles.featureGrid}>
          <FeatureButton
            title="Crop Health"
            icon={<MaterialIcons name="eco" size={32} color="#FFFFFF" />}
            color={['#FF9800', '#F57C00']}
            onPress={() => {}}
          />
          <FeatureButton
            title="Weather"
            icon={<MaterialIcons name="wb-cloudy" size={32} color="#FFFFFF" />}
            color={['#2196F3', '#1976D2']}
            onPress={() => {}}
          />
          <FeatureButton
            title="Analytics"
            icon={<MaterialIcons name="analytics" size={32} color="#FFFFFF" />}
            color={['#9C27B0', '#7B1FA2']}
            onPress={() => {}}
          />
        </View>
      </View>

      <View style={styles.alertSection}>
        <ThemedText style={styles.sectionTitle}>Recent Alerts</ThemedText>
        <View style={styles.alertCard}>
          <View style={styles.alertIcon}>
            <MaterialIcons name="warning" size={24} color="#F57C00" />
          </View>
          <View style={styles.alertContent}>
            <ThemedText style={styles.alertTitle}>Possible Pest Detection</ThemedText>
            <ThemedText style={styles.alertDescription}>
              Unusual activity detected in Field B. Tap to investigate.
            </ThemedText>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  greeting: {
    fontSize: 16,
  },
  farmerName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  weatherCard: {
    margin: 20,
    padding: 20,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherDetails: {
    marginLeft: 10,
  },
  temperature: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  weatherText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 10,
  },
  weatherStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  weatherStat: {
    alignItems: 'center',
  },
  statText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 5,
  },
  statLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.8,
  },
  quickActions: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: '31%',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cropHealth: {
    padding: 20,
  },
  cropHealthCard: {
    flexDirection: 'row',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  healthIndicator: {
    width: 4,
    borderRadius: 2,
    marginRight: 15,
  },
  healthContent: {
    flex: 1,
  },
  healthTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  healthStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  healthValue: {
    fontSize: 14,
    opacity: 0.8,
  },
  healthTrend: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 10,
  },
  smartCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 10,
    marginBottom: 10,
  },
  cardContent: {
    flex: 1,
    marginLeft: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  unit: {
    fontSize: 14,
    marginLeft: 5,
  },
  trendBadge: {
    padding: 5,
    borderRadius: 5,
    marginTop: 5,
  },
  trendText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  featureButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  featureGradient: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  featureGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  alertSection: {
    padding: 20,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 10,
  },
  alertIcon: {
    marginRight: 10,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  alertDescription: {
    fontSize: 14,
    opacity: 0.8,
  },
  taskCard: {
    margin: 20,
    padding: 20,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  taskList: {
    gap: 12,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  taskText: {
    fontSize: 16,
  },
}); 