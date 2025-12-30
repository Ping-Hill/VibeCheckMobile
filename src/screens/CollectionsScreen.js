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

const COLLECTIONS = [
  { id: 'romantic', name: 'Best Date Spots', query: 'romantic intimate cozy' },
  { id: 'brunch', name: 'Best Brunch', query: 'brunch breakfast' },
  { id: 'latenight', name: 'Late Night Eats', query: 'late night open late' },
  { id: 'outdoor', name: 'Outdoor Dining', query: 'outdoor patio rooftop garden' },
  { id: 'trendy', name: 'Trendy Spots', query: 'trendy hip instagram' },
  { id: 'authentic', name: 'Hidden Gems', query: 'authentic local favorite hidden gem' },
  { id: 'groups', name: 'Group Dinners', query: 'group friends family large party' },
  { id: 'italian', name: 'Best Italian', query: 'italian authentic pasta' },
  { id: 'asian', name: 'Best Asian', query: 'japanese chinese thai korean ramen sushi' },
  { id: 'mexican', name: 'Best Mexican', query: 'mexican tacos authentic' },
];

export default function CollectionsScreen({ navigation }) {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      // Load top 5 restaurants for each collection
      const collectionData = await Promise.all(
        COLLECTIONS.map(async (collection) => {
          try {
            const response = await axios.post(`${API_URL}/api/search`, {
              query: collection.query,
              k: 5,
            });
            return {
              ...collection,
              restaurants: response.data.results || [],
            };
          } catch (error) {
            console.error(`Failed to load ${collection.name}:`, error);
            return { ...collection, restaurants: [] };
          }
        })
      );
      setCollections(collectionData);
    } catch (error) {
      console.error('Failed to load collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewFullCollection = (collection) => {
    navigation.navigate('Search', {
      screen: 'SearchHome',
      params: { initialQuery: collection.query },
    });
  };

  const renderCollection = ({ item }) => (
    <View style={styles.collectionCard}>
      <View style={styles.collectionHeader}>
        <Text style={styles.collectionName}>{item.name}</Text>
      </View>

      {item.restaurants.length > 0 ? (
        <>
          {item.restaurants.map((restaurant, index) => (
            <TouchableOpacity
              key={restaurant.id}
              style={styles.restaurantItem}
              onPress={() =>
                navigation.navigate('Search', {
                  screen: 'Details',
                  params: { restaurant },
                })
              }
            >
              <Text style={styles.restaurantRank}>{index + 1}</Text>
              <View style={styles.restaurantInfo}>
                <Text style={styles.restaurantName}>{restaurant.name}</Text>
                <Text style={styles.restaurantRating}>⭐ {restaurant.rating}</Text>
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => viewFullCollection(item)}
          >
            <Text style={styles.viewAllText}>View All →</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.emptyText}>Loading...</Text>
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
      <Text style={styles.title}>Curated Collections</Text>
      <FlatList
        data={collections}
        renderItem={renderCollection}
        keyExtractor={(item) => item.id}
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
  collectionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  collectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  collectionEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  collectionName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  restaurantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  restaurantRank: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    width: 30,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  restaurantRating: {
    fontSize: 14,
    color: '#666',
  },
  viewAllButton: {
    marginTop: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  viewAllText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 20,
  },
});
