import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Platform, useWindowDimensions, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import BackHeader from '../components/BackHeader';
import CrossPlatformView from '../components/CrossPlatformView';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { Calendar } from 'react-native-calendars';
import { MapContainer, TileLayer, Circle as LeafletCircle } from 'react-leaflet';
import { mockPets } from '../data/mockData';

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

const mockReviews = [
  {
    id: 1,
    name: 'Noah M.',
    service: 'Dog Boarding',
    date: 'Dec 02, 2024',
    text: 'Dina was fantastic with our dog! Sent lots of photos and clearly made sure she was comfortable. Will definitely use again!',
    photo: 'https://via.placeholder.com/50'
  },
  {
    id: 2,
    name: 'Kaily J.',
    service: 'Doggy Day Care',
    date: 'Nov 26, 2024',
    text: 'Dina always takes such good care of Elijah. He was having tummy problems today and she kept me updated all day on how he was doing.',
    photo: 'https://via.placeholder.com/50'
  },
  {
    id: 3,
    name: 'Nadia U.',
    service: 'Dog Boarding',
    date: 'Nov 19, 2024',
    text: 'She took such great care of our puppy! Sent pictures and videos the whole time, her backyard was super nice and clean ❤️ my puppy was definitely in great hands! Bonus her dogs were so sweet with our puppy.',
    photo: 'https://via.placeholder.com/50'
  },
  {
    id: 4,
    name: 'Vanessa G.',
    service: 'Dog Boarding',
    date: 'Nov 19, 2024',
    text: 'Dina was great! She communicated through the whole stay and sent plenty of videos and photos. 10/10',
    photo: 'https://via.placeholder.com/50'
  }
];

const useResponsiveLayout = () => {
  const { width } = useWindowDimensions();
  const [isWideScreen, setIsWideScreen] = useState(true);

  useEffect(() => {
    setIsWideScreen(Platform.OS === 'web' && width >= 900);
  }, [width]);

  return isWideScreen;
};

const SitterProfile = ({ route, navigation }) => {
  const { width: windowWidth } = useWindowDimensions();
  const [sitterData, setSitterData] = useState(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [bioModalVisible, setBioModalVisible] = useState(false);
  const [reviewsModalVisible, setReviewsModalVisible] = useState(false);
  const [specialistModalVisible, setSpecialistModalVisible] = useState(false);
  const isWideScreen = useResponsiveLayout();

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

  const getContentWidth = () => {
    if (Platform.OS === 'web') {
      return Math.min(1000, windowWidth - 32); // 32px for padding
    }
    return windowWidth - 32; // 16px padding on each side
  };

  if (!sitterData) {
    return (
      <CrossPlatformView fullWidthHeader={true}>
        <BackHeader 
          title="Professional Profile" 
          onBackPress={handleBack}
        />
        <View style={styles.centered}>
          <Text>Loading...</Text>
        </View>
      </CrossPlatformView>
    );
  }

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
      <Text style={[styles.reviewCount, { marginLeft: 12 }]}>({sitterData.reviewCount || 50} reviews)</Text>
    </View>
  );

  // Add new component for truncated text with Read More
  const TruncatedText = ({ text, maxLines = 3 }) => (
    <View>
      <Text 
        numberOfLines={maxLines} 
        style={styles.specialistText}
      >
        {text}
      </Text>
      <TouchableOpacity 
        style={styles.readMoreButton}
        onPress={() => setSpecialistModalVisible(true)}
      >
        <Text style={styles.readMoreText}>Read more</Text>
      </TouchableOpacity>
    </View>
  );

  const renderMap = () => {
    if (Platform.OS !== 'web') return null; // Only render on web

    const position = [
      sitterData.coordinates?.latitude || 38.8339, // Default to Colorado Springs coordinates
      sitterData.coordinates?.longitude || -104.8214
    ];

    return (
      <View style={styles.mapContainer}>
        <MapContainer 
          center={position} 
          zoom={12} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <LeafletCircle
            center={position}
            radius={482.8} // 0.3 miles in meters
            pathOptions={{
              color: theme.colors.primary,
              fillColor: theme.colors.primary,
              fillOpacity: 0.2
            }}
          />
        </MapContainer>
      </View>
    );
  };

  const renderPets = () => {
    if (!mockPets || mockPets.length === 0) return null;
    
    return (
      <View style={styles.petsSection}>
        <Text style={styles.sectionTitle}>Pets</Text>
        {mockPets.map((pet, index) => (
          <View key={pet.id} style={styles.petItem}>
            <View style={styles.petPhoto}>
              <MaterialCommunityIcons 
                name={pet.animal_type.toLowerCase() === 'dog' ? 'dog' : 
                      pet.animal_type.toLowerCase() === 'cat' ? 'cat' : 'lizard'} 
                size={30} 
                color={theme.colors.primary} 
              />
            </View>
            <View style={styles.petInfo}>
              <Text style={styles.petName}>{pet.name}</Text>
              <Text style={styles.petBreed}>{pet.breed}</Text>
              <Text style={styles.petDetails}>
                {`${pet.weight} lbs, ${pet.age.years} years${pet.age.months ? ` ${pet.age.months} months` : ''}`}
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const styles2 = StyleSheet.create({
    modalContent: {
      backgroundColor: theme.colors.background,
      padding: 24,
      borderRadius: 12,
      width: Platform.OS === 'web' ? 
        (windowWidth <= 650 ? '90%' : '60%') : 
        '90%',
      maxWidth: 800,
      maxHeight: '90%',
    },
  });

  // Create services array from sitterData
  const services = [
    { name: 'Boarding', price: "25" },
    { name: 'Doggy Day Care', price: "30" },
    { name: 'House Sitting', price: "40" },
    { name: 'Drop-In Visits', price: "35" },
    { name: 'Dog Walking', price: "45" }
  ];

  const HomeFeature = ({ text }) => (
    <View style={styles.featureBubble}>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );

  const renderReview = (review) => (
    <View key={review.id} style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <Image source={{ uri: review.photo }} style={styles.reviewerPhoto} />
        <View style={styles.reviewerInfo}>
          <Text style={styles.reviewerName}>{review.name}</Text>
          <View style={styles.serviceInfo}>
            <MaterialCommunityIcons name="home" size={16} color={theme.colors.secondary} />
            <Text style={styles.serviceText}>{review.service} • {review.date}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.reviewText}>{review.text}</Text>
    </View>
  );

  return (
    <CrossPlatformView fullWidthHeader={true} contentWidth="1200px">
      <BackHeader 
        title="Professional Profile" 
        onBackPress={handleBack}
      />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={[styles.content, { width: getContentWidth() }]}>
          <View style={[styles.twoColumnLayout, !isWideScreen && styles.singleColumnLayout]}>
            {/* Left Column */}
            <View style={[
              styles.leftColumn, 
              !isWideScreen && styles.leftColumnMobile
            ]}>
              {/* Profile Info */}
              <View style={[
                styles.profileSection,
                !isWideScreen && styles.profileSectionMobile
              ]}>
                {renderProfilePhoto()}
                <Text style={styles.name}>{sitterData.name}</Text>
                <Text style={styles.location}>{sitterData.location}</Text>
                {renderRatingStars()}
                <TouchableOpacity style={styles.contactButton}>
                  <Text style={styles.contactButtonText}>Contact {sitterData.name}</Text>
                </TouchableOpacity>
              </View>

              {/* Services Box */}
              <View style={styles.servicesBox}>
                <Text style={styles.sectionTitle}>Services</Text>
                <View style={styles.servicesList}>
                  {services.map((service, index) => (
                    <View key={index} style={styles.serviceItem}>
                      <Text style={styles.serviceText}>{service.name}</Text>
                      <Text style={styles.servicePrice}>${service.price}</Text>
                    </View>
                  ))}
                </View>
                
                <TouchableOpacity style={styles.additionalRatesButton}>
                  <Text style={styles.additionalRatesText}>See Additional Rates</Text>
                </TouchableOpacity>

                {/* Calendar inside services box */}
                <View style={styles.calendarSection}>
                  <Text style={styles.sectionTitle}>Availability</Text>
                  <Calendar
                    style={styles.calendar}
                    theme={{
                      calendarBackground: theme.colors.surface,
                      selectedDayBackgroundColor: theme.colors.primary,
                      selectedDayTextColor: '#ffffff',
                      todayTextColor: theme.colors.primary,
                    }}
                  />
                </View>
              </View>

              {/* Map */}
              {renderMap()}

              {/* Pets Section */}
              {mockPets && mockPets.length > 0 && renderPets()}
            </View>

            {/* Right Column */}
            <View style={styles.rightColumn}>
              {/* Gallery */}
              <View style={styles.gallerySection}>
                <Text style={styles.sectionTitle}>53 Photos</Text>
                <View style={styles.photoGrid}>
                  {[1, 2, 3, 4].map((_, index) => (
                    <Image 
                      key={index}
                      source={{ uri: 'https://via.placeholder.com/150' }}
                      style={styles.galleryPhoto}
                    />
                  ))}
                </View>
              </View>

              {/* Specialist Experience */}
              <View style={styles.specialistSection}>
                <Text style={styles.sectionTitle}>Specialist Experience</Text>
                <TruncatedText text={sitterData?.bio || ''} />
              </View>

              {/* Reviews */}
              <View style={styles.reviewsSection}>
                <Text style={styles.sectionTitle}>Reviews</Text>
                <View style={styles.reviewsGrid}>
                  {mockReviews.slice(0, 4).map(renderReview)}
                </View>
                <TouchableOpacity 
                  style={styles.readMoreButton}
                  onPress={() => setReviewsModalVisible(true)}
                >
                  <Text style={styles.readMoreText}>Read more reviews</Text>
                </TouchableOpacity>
              </View>

              {/* About Section */}
              <View style={styles.aboutSection}>
                <Text style={styles.sectionTitle}>About {sitterData.name}</Text>
                <View style={styles.aboutSubsections}>
                  <View style={styles.communicationSection}>
                    <Text style={styles.subsectionTitle}>Communication</Text>
                    <Text>22 repeat pet parents</Text>
                    <Text>100% response rate</Text>
                    <Text>Usually responds in a few minutes</Text>
                    <Text>90% bookings with photo updates</Text>
                  </View>
                  <View style={styles.skillsSection}>
                    <Text style={styles.subsectionTitle}>Skills</Text>
                    <Text>3 years of experience</Text>
                  </View>
                </View>
              </View>

              {/* Home Section */}
              <View style={styles.homeSection}>
                <Text style={styles.sectionTitle}>Home</Text>
                <View style={styles.homeFeaturesGrid}>
                  <HomeFeature text="No children present" />
                  <HomeFeature text="Has security system" />
                  <HomeFeature text="Non-smoking household" />
                  <HomeFeature text="Has 2 dogs" />
                  <HomeFeature text="Dogs allowed on bed" />
                  <HomeFeature text="Dogs allowed on furniture" />
                  <HomeFeature text="Potty breaks every 0-2 hours" />
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bio Modal */}
      <Modal
        visible={bioModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setBioModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles2.modalContent}>
            <Text style={styles.bioText}>{sitterData.bio}</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setBioModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Reviews Modal */}
      <Modal
        visible={reviewsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setReviewsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles2.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>All Reviews</Text>
              <TouchableOpacity 
                style={styles.modalCloseIcon}
                onPress={() => setReviewsModalVisible(false)}
              >
                <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView 
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
            >
              {mockReviews.map((review) => (
                <View key={review.id} style={styles.modalReviewItem}>
                  {renderReview(review)}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Specialist Experience Modal */}
      <Modal
        visible={specialistModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSpecialistModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles2.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Specialist Experience</Text>
              <TouchableOpacity 
                style={styles.modalCloseIcon}
                onPress={() => setSpecialistModalVisible(false)}
              >
                <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView 
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
            >
              <Text style={styles.bioText}>{sitterData?.bio}</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </CrossPlatformView>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'web' ? 16 : 80,
  },
  content: {
    alignSelf: 'center',
    padding: 24,
  },
  topSection: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 24,
    marginBottom: 24,
  },
  profileSection: {
    flex: Platform.OS === 'web' ? 1 : undefined,
  },
  gallerySection: {
    maxHeight: 400,
    overflow: 'hidden',
    marginBottom: 24,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    maxHeight: 320,
    overflow: 'auto',
  },
  bottomSection: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 24,
  },
  servicesSection: {
    flex: Platform.OS === 'web' ? 1 : undefined,
    backgroundColor: theme.colors.background,
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  aboutSection: {
    maxHeight: 300,
    overflow: 'auto',
    marginBottom: 24,
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
  },
  profileHeader: {
    alignItems: Platform.OS === 'web' ? 'flex-start' : 'center',
  },
  profileInfo: {
    alignItems: Platform.OS === 'web' ? 'flex-start' : 'center',
  },
  hostingSection: {
    marginTop: 24,
  },
  hostTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  weightRanges: {
    gap: 8,
  },
  weightRange: {
    fontSize: 16,
    color: theme.colors.text,
  },
  galleryPhoto: {
    width: Platform.OS === 'web' ? 100 : 50,
    height: Platform.OS === 'web' ? 100 : 50,
    borderRadius: 8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginLeft: 12,
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
    fontSize: 18,
    lineHeight: 28,
    color: theme.colors.text,
    overflow: 'hidden',
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  serviceText: {
    fontSize: 8,
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
  calculatorText: {
    fontSize: 16,
    color: theme.colors.secondary,
  },
  additionalRatesButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  additionalRatesText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  calendarSection: {
    marginTop: 24,
  },
  readMoreButton: {
    marginTop: 8,
  },
  readMoreText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  reviewsSection: {
    marginVertical: 32,
    width: '100%',
    backgroundColor: theme.colors.background,
  },
  reviewItem: {
    marginBottom: 16,
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    maxWidth: Platform.OS === 'web' ? 600 : undefined,
  },
  servicesSection: {
    backgroundColor: theme.colors.surface,
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 24,
  },
  mapContainer: {
    height: 200,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 600 : undefined,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    alignSelf: 'center',
  },
  map: {
    flex: 1,
  },
  petsSection: {
    marginBottom: 24,
  },
  petItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderRadius: 8,
  },
  petPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  petInfo: {
    marginLeft: 12,
    flex: 1,
  },
  petName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  petBreed: {
    fontSize: 14,
    color: theme.colors.secondary,
    marginBottom: 2,
  },
  petDetails: {
    fontSize: 14,
    color: theme.colors.secondary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  aboutSubsections: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 24,
  },
  communicationSection: {
    flex: 1,
  },
  skillsSection: {
    flex: 1,
  },
  homeDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  noReviews: {
    fontSize: 16,
    color: theme.colors.secondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 16,
  },
  twoColumnLayout: {
    flexDirection: 'row',
    gap: 24,
  },
  singleColumnLayout: {
    flexDirection: 'column',
  },
  leftColumn: {
    flex: Platform.OS === 'web' ? 1 : undefined,
    maxWidth: Platform.OS === 'web' ? 400 : undefined,
  },
  rightColumn: {
    flex: Platform.OS === 'web' ? 2 : undefined,
  },
  servicesBox: {
    backgroundColor: theme.colors.surface,
    padding: 24,
    borderRadius: 12,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 600 : undefined,
    alignSelf: 'center',
  },
  calendar: {
    height: 300,
    marginTop: 16,
  },
  serviceText: {
    fontSize: 10,
    fontWeight: '100',
  },
  homeFeaturesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  featureBubble: {
    backgroundColor: theme.colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  featureText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  reviewItem: {
    marginBottom: 24,
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  reviewerPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewText: {
    fontSize: 14,
    lineHeight: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  modalScroll: {
    maxHeight: Platform.OS === 'web' ? '70vh' : '80%',
  },
  closeButton: {
    marginTop: 16,
    alignItems: 'center',
    padding: 12,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalCloseIcon: {
    padding: 8,
  },
  modalScrollContent: {
    paddingBottom: 24,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: Platform.OS === 'web' ? 40 : 20,
  },
  reviewsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 16,
  },
  reviewItem: {
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    flex: 1,
    minWidth: Platform.OS === 'web' ? 300 : '100%',
    // maxWidth: Platform.OS === 'web' ? 'calc(50% - 8px)' : undefined,
    marginBottom: 0, // Remove default margin since we're using gap
  },
  specialistSection: {
    marginTop: 24,
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
  },
  specialistText: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.text,
  },
  modalReviewItem: {
    marginBottom: 16,
    width: '100%',
  },
  leftColumnMobile: {
    maxWidth: '100%',
    alignItems: 'center',
  },
  profileSectionMobile: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 500, // Limit width on mobile for better readability
    alignSelf: 'center',
  },
  servicesBox: {
    backgroundColor: theme.colors.surface,
    padding: 24,
    borderRadius: 12,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%', // Ensure full width in mobile view
  },
});

export default SitterProfile;
