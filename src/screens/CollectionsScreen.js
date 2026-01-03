import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { searchRestaurants } from '../services/api';

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
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      setError(null);
      // Load top 5 restaurants for each collection
      const collectionData = await Promise.all(
        COLLECTIONS.map(async (collection) => {
          try {
            const data = await searchRestaurants(collection.query, 'text');
            return {
              ...collection,
              restaurants: (data.results || []).slice(0, 5),
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
      setError('Unable to connect to server. Check your internet connection.');
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
        <Text style={styles.loadingText}>Loading collections...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loader}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadCollections}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
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
  collectionCard: {
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
  collectionHeader: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  collectionName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.3,
  },
  restaurantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  restaurantRank: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    width: 28,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 2,
  },
  restaurantRating: {
    fontSize: 14,
    color: '#666666',
  },
  viewAllButton: {
    marginTop: 12,
    paddingTop: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  viewAllText: {
    fontSize: 15,
    color: '#000000',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999999',
    fontSize: 15,
    paddingVertical: 20,
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
