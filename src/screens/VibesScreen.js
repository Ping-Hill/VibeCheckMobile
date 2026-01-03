import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';

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

  const handleVibePress = (vibeName) => {
    // Navigate back to search screen with this vibe as query
    navigation.navigate('Search', {
      screen: 'SearchHome',
      params: { initialQuery: vibeName }
    });
  };

  const renderVibe = ({ item }) => (
    <View style={styles.vibeCard}>
      <TouchableOpacity onPress={() => handleVibePress(item.name)}>
        <Text style={styles.vibeName}>{item.name}</Text>
        <Text style={styles.restaurantCount}>
          {item.count} restaurants
        </Text>
      </TouchableOpacity>

      {item.restaurants && item.restaurants.length > 0 && (
        <View style={styles.restaurantList}>
          {item.restaurants.map((restaurant, index) => (
            <TouchableOpacity
              key={restaurant.id}
              style={styles.restaurantItem}
              onPress={() => navigation.navigate('Search', {
                screen: 'Details',
                params: { restaurant: { id: restaurant.id, name: restaurant.name, rating: restaurant.rating } }
              })}
            >
              <Text style={styles.restaurantName}>
                {index + 1}. {restaurant.name}
              </Text>
              <Text style={styles.restaurantRating}>
                ⭐ {restaurant.rating}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

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
    <View style={styles.container}>
      <Text style={styles.title}>Popular Vibes in NYC</Text>
      <FlatList
        data={vibes}
        renderItem={renderVibe}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.list}
      />
    </View>
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
    fontSize: 32,
    fontWeight: '700',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    color: '#000000',
    letterSpacing: -0.8,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  vibeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  vibeName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
    color: '#000000',
    letterSpacing: -0.3,
  },
  restaurantCount: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  restaurantList: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  restaurantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  restaurantName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000000',
    flex: 1,
  },
  restaurantRating: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 12,
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
