import React, { useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,

  StatusBar,
  SafeAreaView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useWeather } from '@/hooks/use-weather';
import { useForecast } from '@/hooks/use-forecast';
import { useCityWeather } from '@/hooks/use-city-weather';
import type { ForecastDay } from '@/types/weather';


const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

// Gradient colors by weather condition
const getGradientColors = (condition: string | undefined) => {
  switch (condition?.toLowerCase()) {
    case 'clear':
      return ['#020708', '#212423'] as const;
    case 'clouds':
      return ['#193f2c', '#00db54'] as const;
    case 'rain':
    case 'drizzle':
      return ['#92aa08', '#88D0B8'] as const;
    case 'thunderstorm':
      return ['#4B79A1', '#283E51'] as const;
    case 'snow':
      return ['#441a1a', '#274046'] as const;
    default:
      return ['#A1C4FD', '#C2E9FB'] as const;
  }
};

// Format timestamp to time string
const formatTime = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const [searchCity, setSearchCity] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Weather data
  const { weather: currentWeather, loading: currentLoading, error: currentError, refetch: refetchCurrent } = useWeather();
  const { forecast, loading: forecastLoading, refetch: refetchForecast } = useForecast();
  const { weather: searchedWeather, loading: searchLoading, error: searchError, search: performCitySearch } = useCityWeather({ city: searchCity || undefined });

  // Use searched weather if available, else current
  const weather = searchedWeather || currentWeather;
  const isLoading = currentLoading || forecastLoading || searchLoading;
  const error = searchError || currentError;

  // Dynamic gradient
  const gradientColors = getGradientColors(weather?.weather[0]?.main);

  const handleSearch = () => {
    if (searchCity.trim()) {
      performCitySearch(searchCity.trim());
      setShowSearch(false);
    }
  };

  const handleLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Accès à la localisation nécessaire pour la météo actuelle.');
      return;
    }
    refetchCurrent();
    refetchForecast();
    setSearchCity(''); // Clear search
  };

  const refreshAll = () => {
    refetchCurrent();
    refetchForecast();
  };

  const renderForecastItem = ({ item }: { item: ForecastDay }) => {
    const dayIndex = new Date(item.dt * 1000).getDay();
    const icon = item.weather[0]?.icon || '01d';
    const tempHigh = Math.round(item.main.temp_max);
    const tempLow = Math.round(item.main.temp_min);

    return (
      <View style={styles.forecastItem}>
        <Text style={styles.forecastDay}>{days[dayIndex]}</Text>
        <Image
          source={{ uri: `https://openweathermap.org/img/wn/${icon}@2x.png` }}
          style={styles.forecastIcon}
        />
        <Text style={styles.forecastTemps}>{tempLow}/{tempHigh}°</Text>
      </View>
    );
  };

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refreshAll}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <LinearGradient colors={gradientColors} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.cityText}>{weather?.name || 'Chargement...'}</Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity style={styles.iconButton} onPress={refreshAll}>
                <IconSymbol name="arrow.clockwise" size={24} color={Colors[colorScheme ?? 'light'].tint} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <IconSymbol name="gear" size={24} color={Colors[colorScheme ?? 'light'].tint} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Main Weather */}
          {weather && (
            <>
              <View style={styles.mainWeather}>
                <Image
                  source={{ uri: `https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png` }}
                  style={styles.weatherIcon}
                />
                <Text style={styles.tempText}>{Math.round(weather.main.temp)}°</Text>
                <Text style={styles.descText}>{weather.weather[0].description}</Text>
              </View>

              {/* Search Section */}
              <View style={styles.searchSection}>
                <TouchableOpacity style={styles.locationButton} onPress={handleLocation}>
                  <IconSymbol name="location.fill" size={20} color="#fff" />
                  <Text style={styles.locationButtonText}>Ma position</Text>
                </TouchableOpacity>
                {showSearch ? (
                  <View style={styles.searchInputContainer}>
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Rechercher une ville..."
                      value={searchCity}
                      onChangeText={setSearchCity}
                      placeholderTextColor="rgba(255,255,255,0.7)"
                    />
                    <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                      <IconSymbol name="magnifyingglass" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.searchToggle} onPress={() => setShowSearch(true)}>
                    <IconSymbol name="magnifyingglass" size={24} color="#fff" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Details Cards */}
              <View style={styles.detailsContainer}>
                <View style={styles.detailCard}>
                  <IconSymbol name="humidity.fill" size={24} color="#666" />
                  <Text style={styles.detailValue}>{weather.main.humidity}%</Text>
                  <Text style={styles.detailLabel}>Humidité</Text>
                </View>
                <View style={styles.detailCard}>
                  <IconSymbol name="wind" size={24} color="#666" />
                  <Text style={styles.detailValue}>{weather.wind.speed.toFixed(1)} m/s</Text>
                  <Text style={styles.detailLabel}>Vent</Text>
                </View>
                <View style={styles.detailCard}>
                  <IconSymbol name="sun.max.fill" size={24} color="#666" />
                  <Text style={styles.detailValue}>{formatTime(weather.sys.sunrise)} - {formatTime(weather.sys.sunset)}</Text>
                  <Text style={styles.detailLabel}>Lever/Coucher</Text>
                </View>
              </View>
            </>
          )}

          {/* 7-Day Forecast */}
          <View style={styles.forecastSection}>
            <Text style={styles.sectionTitle}>Prévisions 7 jours</Text>
            <FlatList
              data={forecast || []}
              renderItem={renderForecastItem}
              keyExtractor={(item) => item.dt.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.forecastList}
            />
          </View>
        </ScrollView>

        {/* Loading Overlay */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cityText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 8,
    marginLeft: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  mainWeather: {
    alignItems: 'center',
    marginBottom: 30,
  },
  weatherIcon: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },
  tempText: {
    fontSize: 72,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  descText: {
    fontSize: 24,
    color: 'rgba(255,255,255,0.9)',
  },
  searchSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 15,
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  searchToggle: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 12,
    borderRadius: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    paddingHorizontal: 5,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
  },
  searchButton: {
    padding: 12,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  detailCard: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    minWidth: 80,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  detailValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginTop: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  forecastSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 15,
  },
  forecastList: {
    paddingHorizontal: 10,
  },
  forecastItem: {
    alignItems: 'center',
    marginRight: 20,
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 16,
    minWidth: 60,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  forecastDay: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 5,
  },
  forecastIcon: {
    width: 32,
    height: 32,
    marginBottom: 5,
  },
  forecastTemps: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

