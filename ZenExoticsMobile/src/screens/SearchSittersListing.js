import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image, Platform, SafeAreaView, StatusBar, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
import { theme } from '../styles/theme';
import { debounce } from 'lodash';
import { mockSitters } from '../data/mockData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
// import { mockSitters } from '../data/mockData';

const { width: screenWidth } = Dimensions.get('window');

const NoSittersView = () => (
  <View style={styles.noSittersContainer}>
    <Text style={styles.noSittersText}>
      No sitters match your criteria in this area. Try adjusting your filters or expanding the map view.
    </Text>
  </View>
);

const LoadingIndicator = () => (
  <View style={styles.loadingIndicator}>
    <Text style={styles.loadingText}>Loading more sitters...</Text>
  </View>
);

const SitterCard = ({ sitter, onPress }) => {
  const truncateBio = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
  };

  return (
    <TouchableOpacity 
      style={styles.sitterCard} 
      onPress={onPress}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Image 
            source={{ uri: sitter.profilePicture }} 
            style={styles.profilePicture} 
          />
          <View style={styles.verifiedBadge}>
            <MaterialCommunityIcons name="check-circle" size={20} color={theme.colors.primary} />
          </View>
        </View>
        <View style={styles.cardHeaderRight}>
          <Text style={styles.priceText}>from</Text>
          <Text style={styles.price}>${sitter.price}</Text>
          <Text style={styles.priceSubtext}>per night</Text>
        </View>
      </View>
      <View style={styles.cardContent}>
        <View style={styles.nameContainer}>
          <Text style={styles.sitterNumber}>{sitter.id}. </Text>
          <Text style={styles.sitterName}>{sitter.name}</Text>
          <View style={styles.starBadge}>
            <Text style={styles.starBadgeText}>Star Sitter</Text>
          </View>
        </View>
        <Text style={styles.sitterBio} numberOfLines={2}>
          {truncateBio(sitter.bio)}
        </Text>
        <Text style={styles.sitterLocation}>{sitter.location}</Text>
        <View style={styles.statsContainer}>
          <View style={styles.ratingContainer}>
            <MaterialCommunityIcons name="star" size={20} color={theme.colors.primary} />
            <Text style={styles.rating}>{sitter.reviews}</Text>
            <Text style={styles.reviewCount}>• {sitter.reviewCount || 50} reviews</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const WebMapComponent = ({ sitters, navigation, userLocation }) => {
  const { MapContainer, TileLayer, Marker, Popup } = require('react-leaflet');
  const L = require('leaflet');

  // Set default center and zoom
  const defaultCenter = [37.0902, -95.7129]; // US center
  const defaultZoom = 4;

  // If we have user location, use that instead
  const center = userLocation 
    ? [userLocation.latitude, userLocation.longitude]
    : defaultCenter;
  
  // Set zoom based on whether we have user location
  const zoom = userLocation ? 12 : defaultZoom;

  // Create map instance ref to handle zoom
  const mapRef = React.useRef(null);

  // Handle initial zoom when map and userLocation are ready
  React.useEffect(() => {
    if (mapRef.current && userLocation) {
      mapRef.current.setView(
        [userLocation.latitude, userLocation.longitude],
        12,
        {
          animate: true,
          duration: 1
        }
      );
    }
  }, [userLocation]);

  const createNumberedIcon = (number) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        background-color: ${theme.colors.primary};
        color: white;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        border: 2px solid white;
      ">${number}</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };
  
  return (
    <div style={{ 
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'hidden'
    }}>
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={zoom}
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {sitters.map(sitter => (
          <Marker
            key={sitter.id}
            position={[sitter.coordinates.latitude, sitter.coordinates.longitude]}
            icon={createNumberedIcon(sitter.id)}
          >
            <Popup>
              <div 
                onClick={() => navigation.navigate('SitterDetails', { sitter })}
                style={{ cursor: 'pointer' }}
              >
                {sitter.name}<br/>
                {sitter.bio}
                <br/>
                <span style={{ color: 'blue', textDecoration: 'underline' }}>
                  Click for more details
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

const NativeMapComponent = ({ sitters, userLocation, currentMapRegion, handleRegionChange }) => {
  const MapView = require('react-native-maps').default;
  const { Marker } = require('react-native-maps');
  const [mapRef, setMapRef] = useState(null);

  const zoomIn = () => {
    if (!mapRef) return;
    mapRef.getCamera().then((cam) => {
      const newCamera = {
        ...cam,
        altitude: cam.altitude * 0.5
      };
      mapRef.animateCamera(newCamera, { duration: 300 });
    });
  };

  const zoomOut = () => {
    if (!mapRef) return;
    mapRef.getCamera().then((cam) => {
      const newCamera = {
        ...cam,
        altitude: cam.altitude * 2
      };
      mapRef.animateCamera(newCamera, { duration: 300 });
    });
  };

  return (
    <View style={styles.mapWrapper}>
      <MapView
        ref={setMapRef}
        style={styles.map}
        initialRegion={currentMapRegion}
        onRegionChangeComplete={handleRegionChange}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {sitters.map(sitter => (
          <Marker
            key={sitter.id}
            coordinate={sitter.coordinates}
            title={sitter.name}
            description={sitter.bio}
          />
        ))}
      </MapView>
      
      <View style={styles.zoomControls}>
        <TouchableOpacity style={styles.zoomButton} onPress={zoomIn}>
          <MaterialCommunityIcons name="plus" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.zoomButton} onPress={zoomOut}>
          <MaterialCommunityIcons name="minus" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const Header = ({ navigation, toggleMap, toggleFilters, isSmallScreen, showMap, showFilters }) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.navigate('SearchSitters')}
      >
        <MaterialCommunityIcons 
          name="arrow-left" 
          size={24} 
          color={theme.colors.text} 
        />
      </TouchableOpacity>
      
      <Text style={styles.headerTitle}>Available Professionals</Text>
      
      <View style={styles.headerButtons}>
        <TouchableOpacity 
          style={[styles.iconButton, showFilters && styles.iconButtonActive]}
          onPress={toggleFilters}
        >
          <MaterialCommunityIcons 
            name="filter-variant" 
            size={24} 
            color={showFilters ? theme.colors.primary : theme.colors.text}
          />
        </TouchableOpacity>
        
        {isSmallScreen && (
          <TouchableOpacity 
            style={[styles.iconButton, showMap && styles.iconButtonActive]}
            onPress={toggleMap}
          >
            <MaterialCommunityIcons 
              name="map" 
              size={24} 
              color={showMap ? theme.colors.primary : theme.colors.text}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const LocationInput = ({ value, onChange, suggestions, onSuggestionSelect }) => {
  const locationInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedFetch = useCallback(
    debounce(async (text) => {
      if (text.length < 1) return;
      
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${text}&countrycodes=us&limit=5`,
          {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'ZenExotics Mobile App'
            }
          }
        );
        const data = await response.json();
        const suggestions = data.map(item => ({
          display_name: item.display_name,
          lat: item.lat,
          lon: item.lon
        }));
        onSuggestionSelect(suggestions);
      } catch (error) {
        console.error('Error fetching locations:', error);
        onSuggestionSelect([]);
      }
    }, 300),
    [onSuggestionSelect]
  );

  return (
    <View style={[styles.locationInputWrapper, { zIndex: 2 }]}>
      <TextInput
        ref={locationInputRef}
        style={styles.locationInput}
        placeholder="Enter city, state, or zip"
        value={value}
        onChangeText={(text) => {
          onChange(text);
          if (text.length < 1) {
            onSuggestionSelect([]);
          } else {
            debouncedFetch(text);
          }
        }}
      />
      {suggestions.length > 0 && (
        <View style={styles.suggestionsWrapper}>
          <ScrollView 
            style={styles.suggestionsContainer}
            keyboardShouldPersistTaps="always"
            nestedScrollEnabled={true}
          >
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionItem}
                onPress={() => {
                  onChange(suggestion.display_name);
                  onSuggestionSelect([]);
                }}
              >
                <Text>{suggestion.display_name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const FiltersView = ({ isSmallScreen, onClose, setShowFilters }) => {
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [location, setLocation] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [service, setService] = useState('');
  const [servicesSuggestions, setServicesSuggestions] = useState([]);
  const locationInputRef = useRef(null);
  const serviceInputRef = useRef(null);

  // Services search with debounce
  const searchServices = useCallback(
    debounce((searchText) => {
      if (!searchText) return;
      const filteredServices = mockSitters.reduce((acc, sitter) => {
        // Only include services from sitters in the selected location
        if (!location || sitter.location.toLowerCase().includes(location.toLowerCase())) {
          sitter.serviceTypes.forEach(service => {
            if (service.toLowerCase().includes(searchText.toLowerCase()) && !acc.includes(service)) {
              acc.push(service);
            }
          });
        }
        return acc;
      }, []);
      setServicesSuggestions(filteredServices);
    }, 300),
    [location]
  );

  const ServicesInput = () => (
    <View style={[styles.servicesInputWrapper, { zIndex: 1 }]}>
      <TextInput
        ref={serviceInputRef}
        style={styles.serviceInput}
        placeholder="Search services"
        value={service}
        onChangeText={(text) => {
          setService(text);
          searchServices(text);
        }}
        keyboardShouldPersistTaps="always"
      />
      {servicesSuggestions.length > 0 && (
        <View style={styles.suggestionsWrapper}>
          <ScrollView 
            style={styles.suggestionsContainer}
            keyboardShouldPersistTaps="always"
            nestedScrollEnabled={true}
          >
            {servicesSuggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionItem}
                onPress={() => {
                  setService(suggestion);
                  setServicesSuggestions([]);
                }}
              >
                <Text>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );

  const handleApplyFilters = () => {
    const filters = {
      minPrice: minPrice ? parseFloat(minPrice) : null,
      maxPrice: maxPrice ? parseFloat(maxPrice) : null,
      location,
      service
    };

    // Update the fetchSittersInRegion function to use these filters
    if (currentMapRegion) {
      fetchSittersInRegion(currentMapRegion, 1, filters);
    }
    setShowFilters(false);
  };

  const filterContent = (
    <ScrollView 
      style={styles.filtersContainer}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled={true}
    >
      <View style={[styles.filterSection, { zIndex: 3 }]}>
        <Text style={styles.filterTitle}>Price Range</Text>
        <View style={styles.priceInputContainer}>
          <TextInput
            style={styles.priceInput}
            placeholder="Min Price"
            value={minPrice}
            onChangeText={setMinPrice}
            keyboardType="numeric"
          />
          <Text style={styles.priceSeparator}>-</Text>
          <TextInput
            style={styles.priceInput}
            placeholder="Max Price"
            value={maxPrice}
            onChangeText={setMaxPrice}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={[styles.filterSection, { zIndex: 2 }]}>
        <Text style={styles.filterTitle}>Location</Text>
        <LocationInput
          value={location}
          onChange={setLocation}
          suggestions={locationSuggestions}
          onSuggestionSelect={setLocationSuggestions}
        />
      </View>

      <View style={[styles.filterSection, { zIndex: 1 }]}>
        <Text style={styles.filterTitle}>Services</Text>
        <ServicesInput />
      </View>

      <TouchableOpacity 
        style={styles.applyFiltersButton}
        onPress={handleApplyFilters}
      >
        <Text style={styles.applyFiltersText}>Apply Filters</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  if (isSmallScreen) {
    return (
      <View style={styles.filtersWrapper}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Filters</Text>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setShowFilters(false)}
          >
            <MaterialCommunityIcons 
              name="close" 
              size={24} 
              color={theme.colors.text} 
            />
          </TouchableOpacity>
        </View>
        {filterContent}
      </View>
    );
  }

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalFiltersWrapper}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Filters</Text>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setShowFilters(false)}
          >
            <MaterialCommunityIcons 
              name="close" 
              size={24} 
              color={theme.colors.text} 
            />
          </TouchableOpacity>
        </View>
        {filterContent}
      </View>
    </View>
  );
};

const SearchSittersListing = ({ navigation }) => {
  const [sitters, setSitters] = useState(() => {
    if (Platform.OS === 'web') {
      const storedSitters = sessionStorage.getItem('sittersList');
      return storedSitters ? JSON.parse(storedSitters) : [];
    }
    return [];
  });

  useEffect(() => {
    if (Platform.OS === 'web') {
      sessionStorage.setItem('sittersList', JSON.stringify(sitters));
    }
  }, [sitters]);

  useEffect(() => {
    if (sitters.length === 0) {
      setSitters(mockSitters);
    }
  }, []);

  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [currentMapRegion, setCurrentMapRegion] = useState(null);
  const [searchParams, setSearchParams] = useState(null);

  useEffect(() => {
    const loadSearchParams = async () => {
      try {
        let storedParams;
        if (Platform.OS === 'web') {
          storedParams = sessionStorage.getItem('searchParams');
        } else {
          storedParams = await AsyncStorage.getItem('searchParams');
        }

        if (storedParams) {
          const params = JSON.parse(storedParams);
          setSearchParams(params);
          setUserLocation(params.location);
          setCurrentMapRegion(params.location);
          
          // Initialize sitters with filtered results
          const initialSitters = params.initialSitters || [];
          setSitters(initialSitters);
        }
      } catch (error) {
        console.error('Error loading search params:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSearchParams();

    // Cleanup
    return () => {
      if (Platform.OS === 'web') {
        sessionStorage.removeItem('searchParams');
      } else {
        AsyncStorage.removeItem('searchParams');
      }
    };
  }, []);

  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [previousView, setPreviousView] = useState('list'); // Track previous view

  // Simplified toggle functions
  const toggleMap = () => {
    if (showMap) {
      // If map is already showing, close it and show listing
      setShowMap(false);
      setShowFilters(false);
    } else {
      // If map isn't showing, show it and hide filters
      setShowMap(true);
      setShowFilters(false);
    }
  };

  const toggleFilters = () => {
    if (showFilters) {
      // If filters are already showing, close them and show listing
      setShowFilters(false);
      setShowMap(false);
    } else {
      // If filters aren't showing, show them and hide map
      setShowFilters(true);
      setShowMap(false);
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isSmallScreen, setIsSmallScreen] = useState(
    Platform.OS === 'web' ? window.innerWidth < 900 : true
  );

  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleResize = () => {
        setIsSmallScreen(window.innerWidth < 900);
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const SITTERS_PER_PAGE = 20;

  const fetchSittersInRegion = async (region, page, filters = {}) => {
    try {
      setLoading(true);
      const startIndex = (page - 1) * SITTERS_PER_PAGE;
      
      const sittersInView = mockSitters.filter(sitter => {
        const isWithinLatBounds = 
          sitter.coordinates.latitude >= (region.latitude - region.latitudeDelta/2) &&
          sitter.coordinates.latitude <= (region.latitude + region.latitudeDelta/2);
          
        const isWithinLngBounds = 
          sitter.coordinates.longitude >= (region.longitude - region.longitudeDelta/2) &&
          sitter.coordinates.longitude <= (region.longitude + region.longitudeDelta/2);
          
        const matchesFilters = 
          (!searchParams?.serviceType || sitter.serviceTypes.includes(searchParams.serviceType)) &&
          (!searchParams?.animalType || sitter.animalTypes.includes(searchParams.animalType));
          
        // Add price filter
        const matchesPrice = 
          (!filters.minPrice || sitter.price >= filters.minPrice) &&
          (!filters.maxPrice || sitter.price <= filters.maxPrice);

        // Add service filter
        const matchesService = !filters.service || 
          sitter.serviceTypes.some(service => 
            service.toLowerCase().includes(filters.service.toLowerCase())
          );

        // Add location filter (you'll need to implement location matching logic)
        const matchesLocation = !filters.location || 
          sitter.location.toLowerCase().includes(filters.location.toLowerCase());
        
        return isWithinLatBounds && isWithinLngBounds && matchesFilters && 
               matchesPrice && matchesService && matchesLocation;
      });

      const paginatedSitters = sittersInView.slice(startIndex, startIndex + SITTERS_PER_PAGE);
      
      if (page === 1) {
        setSitters(paginatedSitters);
      } else {
        setSitters(prev => [...prev, ...paginatedSitters]);
      }
      
      setHasMore(sittersInView.length > startIndex + SITTERS_PER_PAGE);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching sitters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegionChange = useCallback(
    debounce((region) => {
      setCurrentMapRegion(region);
      fetchSittersInRegion(region, 1);
    }, 500),
    []
  );

  const loadMoreSitters = () => {
    if (!loading && hasMore && currentMapRegion) {
      fetchSittersInRegion(currentMapRegion, currentPage + 1);
    }
  };

  const handleSitterPress = (sitter) => {
    if (Platform.OS === 'web') {
      sessionStorage.setItem('currentSitter', JSON.stringify(sitter));
      navigation.push('SitterProfile');
    } else {
      navigation.navigate('SitterProfile', { sitter });
    }
  };

  const renderMap = () => {
    if (Platform.OS === 'web') {
      return <WebMapComponent 
        sitters={sitters} 
        navigation={navigation}
        userLocation={userLocation}
      />;
    }
    return <NativeMapComponent 
      sitters={sitters}
      userLocation={userLocation}
      currentMapRegion={currentMapRegion}
      handleRegionChange={handleRegionChange}
    />;
  };

  const containerStyles = [
    styles.sittersContainer,
    isSmallScreen && { width: '100%' },
    !isSmallScreen && { width: '25%' }
  ];

  const mapContainerStyles = [
    styles.mapContainer,
    isSmallScreen && { width: '100%' },
    !isSmallScreen && { width: '75%' }
  ];

  useEffect(() => {
    return () => {
      if (Platform.OS === 'web') {
        sessionStorage.removeItem('currentSitter');
      }
    };
  }, []);

  return (
    <SafeAreaView style={[
      styles.safeArea,
      Platform.OS === 'android' && { paddingTop: StatusBar.currentHeight }
    ]}>
      <Header 
        navigation={navigation} 
        toggleMap={toggleMap}
        toggleFilters={toggleFilters}
        isSmallScreen={isSmallScreen}
        showMap={showMap}
        showFilters={showFilters}
      />
      
      <View style={styles.container}>
        {(!isSmallScreen || (!showMap && !showFilters)) && (
          <View style={containerStyles}>
            {Platform.OS === 'web' ? (
              <div style={{ 
                height: '100%', 
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                maxHeight: 'calc(100vh - 64px)',
                paddingRight: '8px',
              }}>
                <View style={styles.scrollContent}>
                  {sitters.length > 0 ? (
                    <>
                      {sitters.map(sitter => (
                        <SitterCard 
                          key={sitter.id} 
                          sitter={sitter} 
                          onPress={() => handleSitterPress(sitter)} 
                        />
                      ))}
                      {loading && <LoadingIndicator />}
                      {!hasMore && <Text style={styles.noMoreSittersText}>No more sitters in this area</Text>}
                    </>
                  ) : (
                    <NoSittersView />
                  )}
                </View>
              </div>
            ) : (
              <ScrollView 
                contentContainerStyle={styles.scrollContent}
                onScroll={({ nativeEvent }) => {
                  const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
                  const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
                  if (isCloseToBottom) {
                    loadMoreSitters();
                  }
                }}
                scrollEventThrottle={400}
              >
                {sitters.length > 0 ? (
                  <>
                    {sitters.map(sitter => (
                      <SitterCard 
                        key={sitter.id} 
                        sitter={sitter} 
                        onPress={() => handleSitterPress(sitter)} 
                      />
                    ))}
                    {loading && <LoadingIndicator />}
                    {!hasMore && <Text style={styles.noMoreSittersText}>No more sitters in this area</Text>}
                  </>
                ) : (
                  <NoSittersView />
                )}
              </ScrollView>
            )}
          </View>
        )}

        {(!isSmallScreen || showMap) && (
          <View style={mapContainerStyles}>
            {renderMap()}
          </View>
        )}

        {showFilters && (
          <FiltersView 
            isSmallScreen={isSmallScreen} 
            onClose={() => setShowFilters(false)}
            setShowFilters={setShowFilters}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
    ...(Platform.OS === 'web' && {
      height: '100vh',
      overflow: 'hidden',
    }),
  },
  container: {
    flexDirection: 'row',
    flex: 1,
    ...(Platform.OS === 'web' && {
      height: 'calc(100vh - 64px)',
      overflow: 'hidden',
    }),
  },
  sittersContainer: {
    width: '25%',
    backgroundColor: theme.colors.background,
    height: 'calc(100vh - 140px)',
    overflow: 'hidden',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: Platform.OS === 'web' ? 16 : 40,
  },
  sitterCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    minHeight: 240,
    borderColor: theme.colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardHeaderLeft: {
    position: 'relative',
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 2,
  },
  cardHeaderRight: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.textSecondary,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  priceSubtext: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.textSecondary,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sitterNumber: {
    fontSize: theme.fontSizes.large,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  sitterName: {
    fontSize: theme.fontSizes.large,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginRight: 8,
  },
  starBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  starBadgeText: {
    color: 'white',
    fontSize: theme.fontSizes.small,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    gap: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  repeatContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewCount: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.medium,
  },
  repeatText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.medium,
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  availabilityText: {
    color: theme.colors.success,
    fontSize: theme.fontSizes.medium,
  },
  mapContainer: {
    width: '75%',
    ...(Platform.OS === 'web' && {
      height: '100%',
      overflow: 'hidden',
    }),
  },
  map: {
    flex: 1,
    borderRadius: 8,
  },
  noSittersContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noSittersText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text,
    textAlign: 'center',
  },
  loadingIndicator: {
    padding: 16,
    alignItems: 'center',
  },
  loadingText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.medium,
  },
  noMoreSittersText: {
    textAlign: 'center',
    padding: 16,
    color: theme.colors.text,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    zIndex: 1000,
  },
  headerTitle: {
    fontSize: theme.fontSizes.large,
    color: theme.colors.text,
    flex: 1,
    marginLeft: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  backButton: {
    padding: 8,
  },
  iconButton: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mapWrapper: {
    flex: 1,
    marginBottom: Platform.OS === 'web' ? 0 : 60,
  },
  zoomControls: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  zoomButton: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.background,
  },
  filtersContainer: {
    flex: 1,
    padding: 16,
    position: 'relative',
  },
  filterSection: {
    marginBottom: 24,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: theme.colors.text,
  },
  applyFiltersButton: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  applyFiltersText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  iconButtonActive: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.primary,
    borderWidth: 1,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalFiltersWrapper: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
  },
  closeButton: {
    padding: 8,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    gap: 8,
  },
  priceInput: {
    flex: 1,
    maxWidth: '45%',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  priceSeparator: {
    flex: 0.1,
    textAlign: 'center',
    fontSize: 20,
    color: theme.colors.text,
  },
  locationInputContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  locationInput: {
    height: 45,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    maxHeight: 200,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    zIndex: 1000,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  serviceInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  locationInputWrapper: {
    position: 'relative',
    zIndex: 2,
  },
  suggestionsWrapper: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  suggestionsContainer: {
    maxHeight: 200,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: 'white',
  },
  filtersContainer: {
    flex: 1,
    padding: 16,
    position: 'relative',
    zIndex: 1000,
  },
  filterSection: {
    marginBottom: 24,
    position: 'relative',
    zIndex: 1000,
  },
  servicesInputWrapper: {
    position: 'relative',
    zIndex: 1,
  },
});

export default SearchSittersListing;

