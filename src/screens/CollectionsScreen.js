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
import { searchRestaurants, getImageUrl } from '../services/api';

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
      // Load top 10 restaurants for each collection
      const collectionData = await Promise.all(
        COLLECTIONS.map(async (collection) => {
          try {
            const data = await searchRestaurants(collection.query, 'text');
            return {
              ...collection,
              restaurants: (data.results || []).slice(0, 10),
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Curated Collections</Text>
      {collections.map((collection) => (
        collection.restaurants.length > 0 && (
          <View key={collection.id} style={styles.section}>
            <TouchableOpacity onPress={() => navigation.navigate('Search', {
              screen: 'SearchHome',
              params: { initialQuery: collection.query }
            })}>
              <Text style={styles.sectionTitle}>{collection.name}</Text>
              <Text style={styles.restaurantCount}>Tap to see all</Text>
            </TouchableOpacity>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {collection.restaurants.map((restaurant) => (
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
                  {restaurant.image_filename && (
                    <Image
                      source={{ uri: getImageUrl(restaurant.image_filename) }}
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
