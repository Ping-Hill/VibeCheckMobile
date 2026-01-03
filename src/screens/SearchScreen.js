import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { searchRestaurants, getImageUrl } from '../services/api';
import axios from 'axios';

const API_URL = 'https://web-production-c67df.up.railway.app';

// Helper function to calculate distance between two coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const FOOD_CATEGORIES = [
  { id: 'all', name: 'All', query: '' },
  { id: 'italian', name: 'Italian', query: 'italian pasta pizza' },
  { id: 'asian', name: 'Asian', query: 'japanese chinese thai korean ramen sushi' },
  { id: 'mexican', name: 'Mexican', query: 'mexican tacos' },
  { id: 'brunch', name: 'Brunch', query: 'brunch breakfast' },
  { id: 'romantic', name: 'Romantic', query: 'romantic intimate date' },
];

const QUICK_VIBES = [
  { name: 'Romantic', query: 'romantic intimate cozy date' },
  { name: 'Trendy', query: 'trendy hip instagram worthy' },
  { name: 'Casual', query: 'casual relaxed laid back' },
  { name: 'Upscale', query: 'upscale fancy elegant' },
];

export default function SearchScreen({ navigation, route }) {
  const [query, setQuery] = useState(route.params?.initialQuery || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [topRated, setTopRated] = useState([]);
  const [loadingTopRated, setLoadingTopRated] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [vibeSections, setVibeSections] = useState([]);
  const [userLocation, setUserLocation] = useState({ lat: 40.7128, lon: -74.0060 }); // Default to NYC center

  useEffect(() => {
    loadTopRated();
    loadVibeSections();
  }, []);

  const loadTopRated = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/top-rated`, { timeout: 30000 });
      setTopRated(response.data.restaurants || []);
    } catch (error) {
      console.error('Failed to load top rated:', error);
    } finally {
      setLoadingTopRated(false);
    }
  };

  const loadVibeSections = async () => {
    try {
      const sections = await Promise.all(
        QUICK_VIBES.map(async (vibe) => {
          try {
            const data = await searchRestaurants(vibe.query);
            return {
              ...vibe,
              restaurants: (data.results || []).slice(0, 10),
            };
          } catch (error) {
            console.error(`Failed to load ${vibe.name}:`, error);
            return { ...vibe, restaurants: [] };
          }
        })
      );
      setVibeSections(sections);
    } catch (error) {
      console.error('Failed to load vibe sections:', error);
    }
  };

  const handleSearch = async (searchQuery) => {
    const queryToUse = searchQuery || query;
    if (!queryToUse.trim()) return;

    setLoading(true);
    try {
      const data = await searchRestaurants(queryToUse);
      setResults(data.results || []);
    } catch (error) {
      alert('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
  };

  // Auto-search if there's an initial query
  useEffect(() => {
    if (route.params?.initialQuery) {
      setQuery(route.params.initialQuery);
      handleSearch(route.params.initialQuery);
    }
  }, [route.params?.initialQuery]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>VibeCheck</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            placeholder="Search restaurants"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => handleSearch()}
          />
        </View>
        <ActivityIndicator size="large" color="#000000" style={styles.loader} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>VibeCheck</Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Search restaurants"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => handleSearch()}
        />
        {query.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {results.length === 0 && (
        <>
          {/* Food Categories */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
            contentContainerStyle={styles.categoriesContainer}
          >
            {FOOD_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.id && styles.categoryChipActive,
                ]}
                onPress={() => {
                  setSelectedCategory(category.id);
                  if (category.query) {
                    setQuery(category.query);
                    handleSearch(category.query);
                  } else {
                    // "All" selected - reset to home view
                    setQuery('');
                    setResults([]);
                  }
                }}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.categoryTextActive,
                ]}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Highest Rated Section */}
          {!loadingTopRated && topRated.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Highest Rated</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {topRated.slice(0, 10).map((restaurant) => (
                  <TouchableOpacity
                    key={restaurant.id}
                    style={styles.horizontalCard}
                    onPress={() => navigation.navigate('Details', { restaurant })}
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
                      <View style={styles.horizontalCardFooter}>
                        <Text style={styles.horizontalCardRating}>⭐ {restaurant.rating}</Text>
                        {restaurant.latitude && restaurant.longitude && (
                          <Text style={styles.horizontalCardDistance}>
                            {calculateDistance(
                              userLocation.lat,
                              userLocation.lon,
                              restaurant.latitude,
                              restaurant.longitude
                            ).toFixed(1)} mi
                          </Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Vibe Sections */}
          {vibeSections.map((section) => (
            section.restaurants.length > 0 && (
              <View key={section.name} style={styles.section}>
                <Text style={styles.sectionTitle}>{section.name}</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScroll}
                >
                  {section.restaurants.map((restaurant) => (
                    <TouchableOpacity
                      key={restaurant.id}
                      style={styles.horizontalCard}
                      onPress={() => navigation.navigate('Details', { restaurant })}
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
                        <View style={styles.horizontalCardFooter}>
                          <Text style={styles.horizontalCardRating}>⭐ {restaurant.rating}</Text>
                          {restaurant.latitude && restaurant.longitude && (
                            <Text style={styles.horizontalCardDistance}>
                              {calculateDistance(
                                userLocation.lat,
                                userLocation.lon,
                                restaurant.latitude,
                                restaurant.longitude
                              ).toFixed(1)} mi
                            </Text>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )
          ))}
        </>
      )}

      {results.length > 0 && (
        <View style={styles.resultsContainer}>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>{results.length} Results</Text>
          </View>
          {results.map((item, index) => (
            <TouchableOpacity
              key={`${item.id}-${index}`}
              style={styles.card}
              onPress={() => navigation.navigate('Details', { restaurant: item })}
            >
              {item.image_filename && (
                <Image
                  source={{ uri: getImageUrl(item.image_filename) }}
                  style={styles.image}
                />
              )}
              <View style={styles.cardContent}>
                <Text style={styles.name}>{item.name}</Text>
                {item.vibes && item.vibes.length > 0 && (
                  <View style={styles.vibesContainer}>
                    {item.vibes.slice(0, 3).map((vibe, idx) => (
                      <View key={idx} style={styles.vibeTag}>
                        <Text style={styles.vibeText}>{vibe.name}</Text>
                      </View>
                    ))}
                  </View>
                )}
                {item.rating && (
                  <Text style={styles.score}>⭐ {item.rating}</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingTop: 60,
    marginBottom: 16,
    color: '#000000',
    letterSpacing: -0.5,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
    position: 'relative',
  },
  input: {
    backgroundColor: '#EEEEEE',
    borderRadius: 50,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 16,
    color: '#000000',
    borderWidth: 0,
  },
  clearButton: {
    position: 'absolute',
    right: 28,
    top: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#CCCCCC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  categoriesScroll: {
    marginBottom: 20,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
  },
  categoryChip: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryChipActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  categoryText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    paddingHorizontal: 16,
    marginBottom: 16,
    color: '#000000',
    letterSpacing: -0.5,
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
    marginBottom: 6,
  },
  horizontalCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  horizontalCardRating: {
    fontSize: 14,
    color: '#666666',
  },
  horizontalCardDistance: {
    fontSize: 13,
    color: '#999999',
  },
  resultsContainer: {
    paddingTop: 8,
  },
  resultsHeader: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  card: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    marginBottom: 12,
  },
  cardContent: {
    paddingHorizontal: 4,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 6,
    color: '#000000',
  },
  vibesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  vibeTag: {
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  vibeText: {
    fontSize: 11,
    color: '#666666',
    fontWeight: '500',
  },
  score: {
    fontSize: 14,
    color: '#666666',
  },
  loader: {
    marginTop: 100,
  },
});
