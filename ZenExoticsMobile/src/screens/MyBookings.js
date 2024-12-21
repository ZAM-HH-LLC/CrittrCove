import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import CrossPlatformView from '../components/CrossPlatformView';
import BackHeader from '../components/BackHeader';
import BookingCard from '../components/BookingCard';
import { mockProfessionalBookings, mockClientBookings } from '../data/mockData';


const MyBookings = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('professional');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    // Simulate API call with 1 second delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const data = activeTab === 'professional' ? mockProfessionalBookings : mockClientBookings;
    setBookings(data);
    setLoading(false);
  };

  // Fetch bookings when tab changes
  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      // If search is empty, show all bookings
      fetchBookings();
      return;
    }

    const currentData = activeTab === 'professional' ? mockProfessionalBookings : mockClientBookings;
    
    const filtered = currentData.filter(booking => {
      const searchLower = query.toLowerCase();
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
    // Navigate to booking details screen
    navigation.navigate('BookingDetails', { bookingId });
  };

  const handleCancelBooking = (bookingId) => {
    // Implement booking cancellation logic
    console.log('Cancel booking:', bookingId);
  };

  const renderBookingCard = ({ item }) => (
    <BookingCard
      booking={item}
      type={activeTab}
      onViewDetails={() => handleViewDetails(item.id)}
      onCancel={() => handleCancelBooking(item.id)}
    />
  );

  return (
    <CrossPlatformView fullWidthHeader={true}>
      <BackHeader
        title="My Bookings"
        onBackPress={() => navigation.navigate('More')}
      />
      
      <View style={styles.container}>
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
        ) : (
          <FlatList
            data={bookings}
            renderItem={renderBookingCard}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
          />
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
});

export default MyBookings;