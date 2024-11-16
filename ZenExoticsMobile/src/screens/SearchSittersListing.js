import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image, Platform, SafeAreaView, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
import { theme } from '../styles/theme';
import { debounce } from 'lodash';
import { mockSitters } from '../data/mockData';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const SitterCard = ({ sitter, onPress }) => (
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
      <Text style={styles.sitterBio}>{sitter.bio}</Text>
      <Text style={styles.sitterLocation}>{sitter.location}</Text>
      <View style={styles.statsContainer}>
        <View style={styles.ratingContainer}>
          <MaterialCommunityIcons name="star" size={20} color={theme.colors.primary} />
          <Text style={styles.rating}>{sitter.reviews}</Text>
          <Text style={styles.reviewCount}>• {sitter.reviewCount || 50} reviews</Text>
        </View>
        {/* <View style={styles.repeatContainer}>
          <MaterialCommunityIcons name="sync" size={20} color={theme.colors.text} />
          <Text style={styles.repeatText}>{sitter.repeatClients || 19} repeat clients</Text>
        </View> */}
      </View>
      {/* <View style={styles.availabilityContainer}>
        <MaterialCommunityIcons name="clock-outline" size={20} color={theme.colors.success} />
        <Text style={styles.availabilityText}>Availability updated today</Text>
      </View> */}
    </View>
  </TouchableOpacity>
);

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

const Header = ({ navigation, toggleMap, isSmallScreen }) => {
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
      
      <Text style={styles.headerTitle}>Available Sitters</Text>
      
      <View style={styles.headerButtons}>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => navigation.navigate('SearchSitters')}
        >
          <MaterialCommunityIcons 
            name="filter-variant" 
            size={24} 
            color={theme.colors.text}
          />
        </TouchableOpacity>
        
        {isSmallScreen && (
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={toggleMap}
          >
            <MaterialCommunityIcons 
              name="map" 
              size={24} 
              color={theme.colors.text}
            />
          </TouchableOpacity>
        )}
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

  const [showMap, setShowMap] = useState(false);
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

  const fetchSittersInRegion = async (region, page) => {
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
          (!searchParams.serviceType || sitter.serviceTypes.includes(searchParams.serviceType)) &&
          (!searchParams.animalType || sitter.animalTypes.includes(searchParams.animalType));
          
        return isWithinLatBounds && isWithinLngBounds && matchesFilters;
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

  const toggleMap = () => {
    setShowMap(prev => !prev);
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
        isSmallScreen={isSmallScreen}
      />
      
      <View style={styles.container}>
        {(!isSmallScreen || !showMap) && (
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
                        <SitterCard key={sitter.id} sitter={sitter} onPress={() => handleSitterPress(sitter)} />
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
                      <SitterCard key={sitter.id} sitter={sitter} onPress={() => handleSitterPress(sitter)} />
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
});

export default SearchSittersListing;

