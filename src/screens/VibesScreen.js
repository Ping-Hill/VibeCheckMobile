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

  useEffect(() => {
    loadTopVibes();
  }, []);

  const loadTopVibes = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/top-vibes`);
      setVibes(response.data.vibes || []);
    } catch (error) {
      console.error('Failed to load vibes:', error);
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
    backgroundColor: '#f5f5f5',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    color: '#333',
  },
  list: {
    paddingHorizontal: 15,
  },
  vibeCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  vibeName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  restaurantCount: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 12,
  },
  restaurantList: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  restaurantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  restaurantName: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  restaurantRating: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
});
