import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { searchRestaurants, getImageUrl } from '../services/api';

const QUICK_SEARCHES = [
  'romantic italian',
  'trendy brunch',
  'cozy date spot',
  'late night eats',
  'authentic ramen',
  'rooftop dining',
];

export default function SearchScreen({ navigation, route }) {
  const [query, setQuery] = useState(route.params?.initialQuery || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Auto-search if there's an initial query
  React.useEffect(() => {
    if (route.params?.initialQuery) {
      handleSearch();
    }
  }, [route.params?.initialQuery]);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const data = await searchRestaurants(query);
      setResults(data.results || []);
    } catch (error) {
      alert('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderRestaurant = ({ item }) => (
    <TouchableOpacity
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
            {item.vibes.slice(0, 3).map((vibe, index) => (
              <View key={index} style={styles.vibeTag}>
                <Text style={styles.vibeText}>
                  {vibe.name} ({vibe.count})
                </Text>
              </View>
            ))}
          </View>
        )}
        {item.similarity != null && (
          <Text style={styles.score}>
            Match: {(item.similarity * 100).toFixed(1)}%
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NYC VibeCheck</Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Search for a vibe (e.g., 'cozy romantic italian')"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.button} onPress={handleSearch}>
          <Text style={styles.buttonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : (
        <FlatList
          data={results}
          renderItem={renderRestaurant}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            !query ? (
              <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionsTitle}>Quick Searches</Text>
                <View style={styles.chipsContainer}>
                  {QUICK_SEARCHES.map((search, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.chip}
                      onPress={() => {
                        setQuery(search);
                        setTimeout(() => handleSearch(), 100);
                      }}
                    >
                      <Text style={styles.chipText}>{search}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : (
              <Text style={styles.emptyText}>No results found</Text>
            )
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'left',
    paddingHorizontal: 20,
    marginBottom: 8,
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#1A1A1A',
    borderWidth: 0,
  },
  button: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  loader: {
    marginTop: 50,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: 220,
    backgroundColor: '#E8E8E8',
  },
  cardContent: {
    padding: 18,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1A1A1A',
    letterSpacing: -0.3,
  },
  vibesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  vibeTag: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginRight: 8,
    marginBottom: 8,
  },
  vibeText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  score: {
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '700',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#999',
  },
  suggestionsContainer: {
    paddingTop: 8,
  },
  suggestionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#666',
    letterSpacing: -0.2,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    backgroundColor: 'white',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: '#F0F0F0',
  },
  chipText: {
    color: '#1A1A1A',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
