import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  Linking,
  TouchableOpacity,
  Share,
  FlatList,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getRestaurantDetails, getImageUrl } from '../services/api';

const { width } = Dimensions.get('window');

export default function DetailsScreen({ route }) {
  const { restaurant } = route.params;
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    loadDetails();
    checkIfSaved();
  }, []);

  const loadDetails = async () => {
    try {
      console.log('Loading details for restaurant:', restaurant);
      const data = await getRestaurantDetails(restaurant.id);
      console.log('Restaurant details loaded:', data);
      setDetails(data);
    } catch (error) {
      console.error('Failed to load details:', error);
      console.error('Error details:', error.message);
      // If loading fails, at least show the restaurant data we have
      setDetails(restaurant);
    } finally {
      setLoading(false);
    }
  };

  const checkIfSaved = async () => {
    try {
      const saved = await AsyncStorage.getItem('savedRestaurants');
      if (saved) {
        const savedList = JSON.parse(saved);
        setIsSaved(savedList.some(r => r.id === restaurant.id));
      }
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  const toggleSave = async () => {
    try {
      const saved = await AsyncStorage.getItem('savedRestaurants');
      let savedList = saved ? JSON.parse(saved) : [];

      if (isSaved) {
        savedList = savedList.filter(r => r.id !== restaurant.id);
        setSaveMessage('Removed from saved');
        setIsSaved(false);
      } else {
        savedList.push({
          id: restaurant.id,
          name: details?.name || restaurant.name,
          rating: details?.rating || restaurant.rating,
        });
        setSaveMessage('Saved!');
        setIsSaved(true);
      }

      await AsyncStorage.setItem('savedRestaurants', JSON.stringify(savedList));

      // Clear message after 2 seconds
      setTimeout(() => setSaveMessage(''), 2000);
    } catch (error) {
      console.error('Error saving restaurant:', error);
    }
  };

  const shareRestaurant = async () => {
    const restaurantData = details || restaurant;
    try {
      await Share.share({
        message: `Check out ${restaurantData.name} on VibeCheck NYC!\nRating: ${restaurantData.rating}⭐\n${restaurantData.address || ''}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const openMaps = () => {
    const address = details?.address || restaurant.address;
    if (address) {
      const url = `https://maps.google.com/?q=${encodeURIComponent(address)}`;
      Linking.openURL(url);
    }
  };

  const openGooglePlace = () => {
    const placeId = details?.place_id || restaurant.place_id;
    if (placeId) {
      // Google Maps link with place_id shows full restaurant info (website, menu, hours, reviews)
      const url = `https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${placeId}`;
      Linking.openURL(url);
    }
  };

  // Always use details if available, otherwise fall back to restaurant prop
  const restaurantData = details || restaurant;

  const renderPhoto = ({ item }) => (
    <Image
      source={{ uri: getImageUrl(item.filename) }}
      style={styles.carouselImage}
      resizeMode="cover"
    />
  );

  return (
    <ScrollView style={styles.container}>
      {loading && (
        <View style={styles.loadingBar}>
          <ActivityIndicator size="small" color="#007AFF" />
        </View>
      )}
      {restaurantData.photos && restaurantData.photos.length > 0 ? (
        <FlatList
          data={restaurantData.photos}
          renderItem={renderPhoto}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.imageCarousel}
        />
      ) : restaurantData.image_filename ? (
        <Image
          source={{ uri: getImageUrl(restaurantData.image_filename) }}
          style={styles.headerImage}
        />
      ) : null}

      <View style={styles.content}>
        <Text style={styles.name}>{restaurantData.name}</Text>

        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={toggleSave} style={styles.heartButton}>
            <Text style={styles.heartIcon}>
              {isSaved ? '❤️' : '🤍'}
            </Text>
            {saveMessage !== '' && (
              <Text style={styles.saveMessage}>{saveMessage}</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton} onPress={shareRestaurant}>
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Vibes</Text>
          {restaurantData.vibes && restaurantData.vibes.length > 0 ? (
            <View style={styles.vibesContainer}>
              {restaurantData.vibes.map((vibe, index) => (
                <View key={index} style={styles.vibeTag}>
                  <Text style={styles.vibeText}>
                    {vibe.name} ({vibe.count})
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.value}>No vibes analyzed yet for this restaurant</Text>
          )}
        </View>

        {restaurantData.place_id && (
          <TouchableOpacity style={styles.button} onPress={openGooglePlace}>
            <Text style={styles.buttonText}>View on Google Maps</Text>
          </TouchableOpacity>
        )}

        {restaurantData.address && (
          <View style={styles.section}>
            <Text style={styles.label}>Address</Text>
            <TouchableOpacity onPress={openMaps}>
              <Text style={[styles.value, styles.link]}>{restaurantData.address}</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>Rating</Text>
          <Text style={styles.value}>{restaurantData.rating} ⭐</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Reviews ({restaurantData.reviews ? restaurantData.reviews.length : 0})</Text>
          {restaurantData.reviews && restaurantData.reviews.map((review, index) => (
            <View key={index} style={styles.reviewContainer}>
              <Text style={styles.reviewText}>{review.text}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingBar: {
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  headerImage: {
    width: '100%',
    height: 320,
    backgroundColor: '#E8E8E8',
  },
  imageCarousel: {
    height: 320,
  },
  carouselImage: {
    width: width,
    height: 320,
    backgroundColor: '#E8E8E8',
  },
  content: {
    padding: 24,
  },
  name: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 16,
    color: '#1A1A1A',
    letterSpacing: -0.4,
  },
  debugText: {
    fontSize: 10,
    color: '#999',
    marginBottom: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  heartButton: {
    alignItems: 'center',
  },
  heartIcon: {
    fontSize: 36,
    padding: 10,
  },
  saveMessage: {
    fontSize: 11,
    color: '#666',
    marginTop: -6,
    fontWeight: '500',
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    letterSpacing: 0.2,
  },
  button: {
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  vibesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  vibeTag: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  vibeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  value: {
    fontSize: 16,
    color: '#1A1A1A',
    lineHeight: 24,
  },
  link: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  reviewText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4A4A4A',
  },
  reviewContainer: {
    backgroundColor: '#FAFAFA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
});
