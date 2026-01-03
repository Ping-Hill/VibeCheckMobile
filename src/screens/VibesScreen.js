import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { getImageUrl } from '../services/api';

const API_URL = 'https://web-production-c67df.up.railway.app';

export default function VibesScreen({ navigation }) {
  const [vibes, setVibes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTopVibes();
  }, []);

  const loadTopVibes = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/top-vibes`, {
        timeout: 30000, // 30 second timeout
      });
      setVibes(response.data.vibes || []);
    } catch (error) {
      console.error('Failed to load vibes:', error);
      setError('Unable to connect to server. Check your internet connection.');
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading vibes...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loader}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadTopVibes}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Popular Vibes in NYC</Text>
      {vibes.map((vibe) => (
        vibe.restaurants && vibe.restaurants.length > 0 && (
          <View key={vibe.name} style={styles.section}>
            <Text style={styles.sectionTitle}>{vibe.name}</Text>
            <Text style={styles.restaurantCount}>{vibe.count} restaurants</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {vibe.restaurants.map((restaurant) => (
                <TouchableOpacity
                  key={restaurant.id}
                  style={styles.horizontalCard}
                  onPress={() =>
                    navigation.navigate('Search', {
                      screen: 'Details',
                      params: { restaurant },
                    })
                  }
                >
                  {restaurant.photo_filename && (
                    <Image
                      source={{ uri: getImageUrl(restaurant.photo_filename) }}
                      style={styles.horizontalCardImage}
                    />
                  )}
                  <View style={styles.horizontalCardContent}>
                    <Text style={styles.horizontalCardName} numberOfLines={1}>
                      {restaurant.name}
                    </Text>
                    <Text style={styles.horizontalCardRating}>⭐ {restaurant.rating}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
    color: '#000000',
    letterSpacing: -0.5,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    paddingHorizontal: 16,
    marginBottom: 4,
    color: '#000000',
    letterSpacing: -0.5,
  },
  restaurantCount: {
    fontSize: 14,
    color: '#666666',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  horizontalScroll: {
    paddingHorizontal: 16,
  },
  horizontalCard: {
    width: 280,
    marginRight: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  horizontalCardImage: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: '#F0F0F0',
  },
  horizontalCardContent: {
    padding: 12,
  },
  horizontalCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  horizontalCardRating: {
    fontSize: 14,
    color: '#666666',
  },
  loadingText: {
    marginTop: 12,
    color: '#666666',
    fontSize: 15,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  retryButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
