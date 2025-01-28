import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import CrossPlatformView from '../components/CrossPlatformView';
import BackHeader from '../components/BackHeader';
import BookingCard from '../components/BookingCard';
import { mockProfessionalBookings, mockClientBookings } from '../data/mockData';
import { AuthContext } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { handleBack } from '../components/Navigation';
import { API_BASE_URL } from '../config/config';

const MyBookings = () => {
  const navigation = useNavigation();
  const { is_prototype, isApprovedProfessional } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState(isApprovedProfessional ? 'professional' : 'client');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    
    if (is_prototype) {
      // Use mock data for prototype
      await new Promise(resolve => setTimeout(resolve, 1000));
      const data = activeTab === 'professional' ? mockProfessionalBookings : mockClientBookings;
      setBookings(data);
      setLoading(false);
      return;
    }

    try {
      let token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`${API_BASE_URL}/api/bookings/v1/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const bookingsData = activeTab === 'professional' 
        ? response.data.bookings?.professional_bookings 
        : response.data.bookings?.client_bookings;

      if (!bookingsData || bookingsData.length === 0) {
        setBookings([]);
        return;
      }

      // Transform API data to match the expected format
      const transformedBookings = bookingsData.map(booking => ({
        id: booking.booking_id.toString(),
        clientName: booking.client_name,
        professionalName: booking.professional_name,
        serviceName: booking.service_name,
        date: booking.start_date,
        time: booking.start_time,
        status: booking.status,
        totalCost: booking.total_client_cost,
        totalPayout: booking.total_sitter_payout
      }));

      setBookings(transformedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch bookings when tab changes
  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      fetchBookings();
      return;
    }

    const searchLower = query.toLowerCase();
    const filtered = bookings.filter(booking => {
      if (activeTab === 'professional') {
        return (
          booking.id.toLowerCase().includes(searchLower) ||
          booking.clientName.toLowerCase().includes(searchLower)
        );
      } else {
        return (
          booking.id.toLowerCase().includes(searchLower) ||
          booking.professionalName.toLowerCase().includes(searchLower)
        );
      }
    });

    setBookings(filtered);
  };

  const handleViewDetails = (bookingId) => {
    // Navigate to booking details screen with isProfessional flag based on active tab
    navigation.navigate('BookingDetails', { 
      bookingId,
      isProfessional: activeTab === 'professional'
    });
  };

  const handleCancelBooking = (bookingId) => {
    // Implement booking cancellation logic
    console.log('Cancel booking:', bookingId);
  };

  const renderBookingCard = ({ item }) => (
    <BookingCard
      booking={{
        ...item,
        // Ensure consistent property names between prototype and API data
        clientName: item.clientName || item.client_name,
        professionalName: item.professionalName || item.professional_name,
        serviceName: item.serviceName || item.service_name,
        date: item.date || item.start_date,
        time: item.time || item.start_time,
      }}
      type={activeTab}
      onViewDetails={() => handleViewDetails(item.id)}
      onCancel={() => handleCancelBooking(item.id)}
    />
  );

  const EmptyStateMessage = () => (
    <View style={styles.emptyStateContainer}>
      <MaterialCommunityIcons 
        name={error ? "alert-circle-outline" : "calendar-blank-outline"} 
        size={64} 
        color={error ? theme.colors.error : theme.colors.primary} 
      />
      <Text style={styles.emptyStateTitle}>
        {error ? 'Error Getting Bookings' : 'No Bookings Found'}
      </Text>
      <Text style={styles.emptyStateSubtitle}>
        {error 
          ? 'There was an error fetching your bookings. Please try again later.' 
          : activeTab === 'professional' 
            ? isApprovedProfessional 
              ? 'Create a service to start receiving bookings'
              : 'Apply to become a professional to start receiving bookings'
            : 'Browse available services to make your first booking'
        }
      </Text>
      {!error && (
        <TouchableOpacity
          style={styles.createServiceButton}
          onPress={() => navigation.navigate(
            activeTab === 'professional'
              ? isApprovedProfessional
                ? 'ServiceManager'
                : 'BecomeProfessional'
              : 'SearchProfessionalsListing'
          )}
        >
          <Text style={styles.createServiceButtonText}>
            {activeTab === 'professional'
              ? isApprovedProfessional
                ? 'Create Service'
                : 'Become Professional'
              : 'Browse Services'
            }
          </Text>
        </TouchableOpacity>
      )}
      {error && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchBookings}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <CrossPlatformView fullWidthHeader={true}>
      <BackHeader
        title="My Bookings"
        onBackPress={() => handleBack(navigation)} // Use default 'More' route
      />
      
      <View style={styles.container}>
        {isApprovedProfessional && (
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'professional' && styles.activeTab]}
              onPress={() => setActiveTab('professional')}
            >
              <Text style={[styles.tabText, activeTab === 'professional' && styles.activeTabText]}>
                Professional Bookings
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'client' && styles.activeTab]}
              onPress={() => setActiveTab('client')}
            >
              <Text style={[styles.tabText, activeTab === 'client' && styles.activeTabText]}>
                Client Bookings
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={24} color={theme.colors.placeholder} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by Booking ID or Name"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : bookings.length > 0 ? (
          <FlatList
            data={bookings}
            renderItem={renderBookingCard}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <EmptyStateMessage />
        )}
      </View>
    </CrossPlatformView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    padding: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  tab: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    color: theme.colors.primary,
    fontWeight: '500',
  },
  activeTabText: {
    color: theme.colors.surface,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyStateTitle: {
    fontSize: theme.fontSizes.large,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: theme.colors.placeholder,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  createServiceButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  createServiceButtonText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: theme.colors.error,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MyBookings;