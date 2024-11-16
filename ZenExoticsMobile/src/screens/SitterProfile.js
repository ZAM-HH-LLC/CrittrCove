import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Platform, useWindowDimensions, SafeAreaView, StatusBar } from 'react-native';
import { TextInput, Button, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../styles/theme';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';

// Mock API function to fetch profile data
const fetchProfileData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        // profilePhoto: 'https://example.com/profile-photo.jpg',
        bio: "Hi! I'm an experienced pet sitter who loves all animals. I have 5 years of experience caring for dogs, cats, and exotic pets.",
        petPhotos: [
          // 'https://example.com/pet-photo-1.jpg',
          // 'https://example.com/pet-photo-2.jpg',
        ],
        services: ['Dog Boarding', 'Dog Walking', 'Drop-In Visits', 'House Sitting'],
        rates: {
          boarding: '35',
          daycare: '25',
          houseSitting: '40',
          dropInVisits: '20',
          dogWalking: '15'
        },
        name: 'John Doe',
        location: 'New York, NY'
      });
    }, 1000);
  });
};

const SitterProfile = ({ route, navigation }) => {
  const { width: windowWidth } = useWindowDimensions();
  const [sitterData, setSitterData] = useState(null);
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    // Check if we can go back and if SearchSittersListing exists in history
    const state = navigation.getState();
    const hasHistory = state.routes.some(route => route.name === 'SearchSittersListing');
    setCanGoBack(navigation.canGoBack() && hasHistory);
  }, [navigation]);

  const handleBack = () => {
    if (Platform.OS === 'web') {
      sessionStorage.removeItem('currentSitter');
      // Always use navigate to ensure consistent behavior
      navigation.navigate('SearchSittersListing');
    } else {
      navigation.goBack();
    }
  };

  // Handle browser back button
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handlePopState = () => {
        handleBack();
      };

      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, []);

  useEffect(() => {
    const loadSitterData = async () => {
      if (route?.params?.sitter) {
        setSitterData(route.params.sitter);
      } else if (Platform.OS === 'web') {
        // Try to get sitter data from sessionStorage on web reload
        const storedSitter = sessionStorage.getItem('currentSitter');
        if (storedSitter) {
          setSitterData(JSON.parse(storedSitter));
        } else {
          // If no data, redirect back to search
          navigation.replace('SearchSittersListing');
        }
      }
    };

    loadSitterData();
  }, [route?.params?.sitter]);

  // Store sitter data in sessionStorage when it's available
  useEffect(() => {
    if (Platform.OS === 'web' && sitterData) {
      sessionStorage.setItem('currentSitter', JSON.stringify(sitterData));
    }
  }, [sitterData]);

  if (!sitterData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const getContentWidth = () => {
    if (Platform.OS === 'web') {
      return Math.min(800, windowWidth - 32); // 32px for padding
    }
    return windowWidth - 32; // 16px padding on each side
  };

  const renderProfilePhoto = () => {
    if (sitterData.profilePicture) {
      return <Image source={{ uri: sitterData.profilePicture }} style={styles.profilePhoto} />;
    }
    return (
      <View style={[styles.profilePhoto, styles.profilePhotoPlaceholder]}>
        <MaterialCommunityIcons name="account" size={80} color={theme.colors.primary} />
      </View>
    );
  };

  const renderRatingStars = () => (
    <View style={styles.ratingContainer}>
      <MaterialCommunityIcons name="star" size={24} color={theme.colors.primary} />
      <Text style={styles.rating}>{sitterData.reviews}</Text>
      <Text style={styles.reviewCount}>({sitterData.reviewCount || 50} reviews)</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Sitter Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={[styles.content, { width: getContentWidth() }]}>
          {/* Profile Header Section */}
          <View style={styles.profileHeader}>
            {renderProfilePhoto()}
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{sitterData.name}</Text>
              <Text style={styles.location}>{sitterData.location}</Text>
              {renderRatingStars()}
              <TouchableOpacity style={styles.contactButton}>
                <Text style={styles.contactButtonText}>Contact {sitterData.name}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="calendar-check" size={24} color={theme.colors.primary} />
              <Text style={styles.statText}>5 years experience</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="home" size={24} color={theme.colors.primary} />
              <Text style={styles.statText}>Has a house</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="shield-check" size={24} color={theme.colors.primary} />
              <Text style={styles.statText}>Background checked</Text>
            </View>
          </View>

          {/* About Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About {sitterData.name}</Text>
            <Text style={styles.bioText}>{sitterData.bio}</Text>
          </View>

          {/* Services & Rates */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Services & Rates</Text>
            {sitterData.serviceTypes.map((service, index) => (
              <View key={index} style={styles.serviceItem}>
                <Text style={styles.serviceText}>{service}</Text>
                <Text style={styles.servicePrice}>${sitterData.price}/night</Text>
              </View>
            ))}
          </View>

          {/* Skills & Experience */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills & Experience</Text>
            <View style={styles.skillsGrid}>
              {sitterData.animalTypes.map((animal, index) => (
                <View key={index} style={styles.skillBadge}>
                  <Text style={styles.skillText}>{animal}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Photo Gallery */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photo Gallery</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.photoGallery}>
                {/* Add sample photos - replace with actual gallery */}
                {[1, 2, 3].map((_, index) => (
                  <Image 
                    key={index}
                    source={{ uri: 'https://via.placeholder.com/150' }}
                    style={styles.galleryPhoto}
                  />
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Price Calculator */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price Calculator</Text>
            <Text style={styles.calculatorText}>
              Coming soon: Calculate your total based on dates and pets
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'web' ? 16 : 80,
  },
  content: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  switchProfileButton: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  profilePhotoPlaceholder: {
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileInfo: {
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  location: {
    fontSize: 16,
    color: theme.colors.secondary,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: theme.colors.primary,
  },
  bioInput: {
    backgroundColor: theme.colors.surface,
  },
  service: {
    fontSize: 16,
    marginBottom: 5,
  },
  rateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  rateLabel: {
    flex: 1,
    fontSize: 16,
  },
  rateInput: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  petPhoto: {
    width: 100,
    height: 100,
    margin: 5,
    borderRadius: 10,
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    margin: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    margin: 20,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  switchProfileButton: {
    backgroundColor: theme.colors.primary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  rating: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  reviewCount: {
    fontSize: 14,
    color: theme.colors.secondary,
  },
  contactButton: {
    backgroundColor: theme.colors.primary,
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.surface,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  statText: {
    fontSize: 16,
    marginLeft: 5,
  },
  bioText: {
    backgroundColor: theme.colors.surface,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  serviceText: {
    fontSize: 16,
  },
  servicePrice: {
    fontSize: 14,
    color: theme.colors.secondary,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillBadge: {
    backgroundColor: theme.colors.surface,
    padding: 10,
    borderRadius: 5,
    margin: 5,
  },
  skillText: {
    fontSize: 16,
  },
  photoGallery: {
    flexDirection: 'row',
  },
  galleryPhoto: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginRight: 10,
  },
  calculatorText: {
    fontSize: 16,
    color: theme.colors.secondary,
  },
});

export default SitterProfile;
