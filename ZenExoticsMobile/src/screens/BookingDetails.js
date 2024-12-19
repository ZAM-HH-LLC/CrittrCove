import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../styles/theme';
import CrossPlatformView from '../components/CrossPlatformView';
import BackHeader from '../components/BackHeader';
import { fetchBookingDetails } from '../data/mockData';

const BookingDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Define an async function inside useEffect to fetch booking data
    const fetchBooking = async () => {
      // Set loading state to true before starting the fetch
      setLoading(true);
      
      try {
        // route.params comes from React Navigation
        // When we navigate using: navigation.navigate('BookingDetails', { bookingId: 'bk1' })
        // The bookingId becomes available in route.params.bookingId
        // The ?. is optional chaining - it prevents errors if route.params is undefined
        const bookingId = route.params?.bookingId;
        
        // Call our mock API function from mockData.js
        // await waits for the Promise to resolve
        const bookingData = await fetchBookingDetails(bookingId);
        
        // Update our component state with the fetched data
        setBooking(bookingData);
      } catch (error) {
        // If anything goes wrong (like booking not found), log the error
        console.error('Error fetching booking details:', error);
      } finally {
        // Whether successful or not, set loading to false
        setLoading(false);
      }
    };

    // Only run fetchBooking if we have a bookingId in route.params
    // This prevents unnecessary API calls if no ID is provided
    if (route.params?.bookingId) {
      fetchBooking();
    }
    
    // The dependency array [route.params?.bookingId] means this effect will run:
    // 1. When the component first mounts
    // 2. Any time route.params?.bookingId changes
  }, [route.params?.bookingId]);

  const handleApprove = () => {
    // Implement approval logic
    console.log('Booking approved');
  };

  const handleModify = () => {
    // Navigate to modification screen
    console.log('Modify booking');
  };

  const handleCancel = () => {
    // Implement cancellation logic
    console.log('Booking cancelled');
  };

  const StatusBadge = ({ status }) => (
    <View style={styles.statusContainer}>
      <Text style={styles.statusLabel}>Booking Status:</Text>
      <View style={[
        styles.statusBadge,
        { backgroundColor: getStatusColor(status).backgroundColor }
      ]}>
        <Text style={[
          styles.statusText,
          { color: getStatusColor(status).textColor }
        ]}>
          {status}
        </Text>
      </View>
    </View>
  );

  const getStatusColor = (status) => {
    const colors = {
      Pending: { backgroundColor: theme.colors.warning + '20', textColor: theme.colors.warning },
      Confirmed: { backgroundColor: theme.colors.success + '20', textColor: theme.colors.success },
      Canceled: { backgroundColor: theme.colors.error + '20', textColor: theme.colors.error },
      Completed: { backgroundColor: theme.colors.primary + '20', textColor: theme.colors.primary },
    };
    return colors[status] || colors.Pending;
  };

  if (loading) {
    return (
      <CrossPlatformView fullWidthHeader={true}>
        <BackHeader
          title="Booking Details"
          onBackPress={() => navigation.navigate('MyBookings')}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </CrossPlatformView>
    );
  }

  if (!booking) {
    return (
      <CrossPlatformView fullWidthHeader={true}>
        <BackHeader
          title="Booking Details"
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Booking not found</Text>
        </View>
      </CrossPlatformView>
    );
  }

  return (
    <CrossPlatformView fullWidthHeader={true}>
      <BackHeader
        title="Booking Details"
        onBackPress={() => navigation.navigate('MyBookings')}
      />
      <ScrollView style={styles.container}>
        <StatusBadge status={booking.status} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Parties</Text>
          <Text style={styles.label}>Client:</Text>
          <Text style={styles.text}>{booking.clientName}</Text>
          <Text style={styles.label}>Professional:</Text>
          <Text style={styles.text}>{booking.professionalName}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date & Time</Text>
          <View style={styles.dateTimeRow}>
            <View style={styles.dateTimeColumn}>
              <Text style={styles.label}>Start Date:</Text>
              <Text style={styles.text}>{booking.startDate}</Text>
              <Text style={styles.label}>Start Time:</Text>
              <Text style={styles.text}>{booking.startTime}</Text>
            </View>
            <View style={styles.dateTimeColumn}>
              <Text style={styles.label}>End Date:</Text>
              <Text style={styles.text}>{booking.endDate}</Text>
              <Text style={styles.label}>End Time:</Text>
              <Text style={styles.text}>{booking.endTime}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Details</Text>
          <Text style={styles.label}>Service Type:</Text>
          <Text style={styles.text}>{booking.serviceType}</Text>
          <Text style={styles.label}>Animal Type:</Text>
          <Text style={styles.text}>{booking.animalType}</Text>
          <Text style={styles.label}>Number of Pets:</Text>
          <Text style={styles.text}>{booking.numberOfPets}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cost Breakdown</Text>
          <Text style={styles.label}>Service Type: {booking.serviceType}</Text>
          
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>
              Base Rate: ${booking.rates.baseRate.toFixed(2)} x {booking.numberOfPets} Pets x {booking.duration} Hour
            </Text>
            <Text style={styles.costAmount}>
              ${booking.costs.baseTotal.toFixed(2)}
            </Text>
          </View>

          {booking.numberOfPets > 1 && (
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>
                Additional Pet Rate: ${booking.rates.additionalPetRate.toFixed(2)} x {booking.numberOfPets - 1} Pet
              </Text>
              <Text style={styles.costAmount}>
                ${booking.costs.additionalPetTotal.toFixed(2)}
              </Text>
            </View>
          )}

          {booking.rates.extraServices.map((service, index) => (
            <View key={index} style={styles.costRow}>
              <Text style={styles.costLabel}>{service.name}:</Text>
              <Text style={styles.costAmount}>
                ${service.amount.toFixed(2)}
              </Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.costRow}>
            <Text style={styles.label}>Subtotal:</Text>
            <Text style={styles.text}>${booking.costs.subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.label}>Client Fee:</Text>
            <Text style={styles.text}>${booking.costs.clientFee.toFixed(2)}</Text>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.label}>Taxes:</Text>
            <Text style={styles.text}>${booking.costs.taxes.toFixed(2)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={[styles.costRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Client Cost:</Text>
            <Text style={styles.totalAmount}>
              ${booking.costs.totalClientCost.toFixed(2)}
            </Text>
          </View>
          <View style={[styles.costRow, styles.payoutRow]}>
            <Text style={styles.payoutLabel}>Professional Payout:</Text>
            <Text style={styles.payoutAmount}>
              ${booking.costs.professionalPayout.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cancellation Policy</Text>
          <Text style={styles.policyText}>
            • No refund if canceled within 1 hour of booking start time{'\n'}
            • 50% refund if canceled between 1-24 hours before start time{'\n'}
            • Full refund if canceled more than 24 hours before the booking
          </Text>
        </View>

        <View style={styles.actionButtons}>
          {booking.status === 'Pending' && (
            <TouchableOpacity
              style={[styles.button, styles.approveButton]}
              onPress={handleApprove}
            >
              <Text style={styles.buttonText}>Approve Details</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.button, styles.modifyButton]}
            onPress={handleModify}
          >
            <Text style={styles.buttonText}>Modify Details</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancel}
          >
            <Text style={[styles.buttonText, styles.cancelButtonText]}>
              Cancel Booking
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </CrossPlatformView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    // marginBottom: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: theme.colors.placeholder,
    marginBottom: 4,
  },
  text: {
    fontSize: 16,
    marginBottom: 8,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  payoutRow: {
    marginTop: 8,
  },
  payoutLabel: {
    fontSize: 14,
    color: theme.colors.success,
  },
  payoutAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.success,
  },
  policyText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionButtons: {
    gap: 12,
    marginBottom: 24,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: theme.colors.success,
  },
  modifyButton: {
    backgroundColor: theme.colors.primary,
  },
  cancelButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  buttonText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButtonText: {
    color: theme.colors.error,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 16,
    marginRight: 8,
    color: theme.colors.text,
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateTimeColumn: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
    color: theme.colors.primary,
  },
  costLabel: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
  },
  costAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.error,
    textAlign: 'center',
  },
});

export default BookingDetails;