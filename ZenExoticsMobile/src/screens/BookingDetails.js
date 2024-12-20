import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Alert, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../styles/theme';
import CrossPlatformView from '../components/CrossPlatformView';
import BackHeader from '../components/BackHeader';
import { fetchBookingDetails } from '../data/mockData';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DatePicker from '../components/DatePicker';
import { TIME_OPTIONS } from '../data/mockData';
import AddRateModal from '../components/AddRateModal';
import { format } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';
import TimePicker from '../components/TimePicker';
import EditOccurrenceModal from '../components/EditOccurrenceModal';
import AddOccurrenceModal from '../components/AddOccurrenceModal';

const LAST_VIEWED_BOOKING_ID = 'last_viewed_booking_id';

const SERVICE_OPTIONS = ['Dog Walking', 'Pet Sitting', 'House Sitting', 'Drop-In Visits'];
const ANIMAL_OPTIONS = ['Dog', 'Cat', 'Bird', 'Small Animal'];

const BookingDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedBooking, setEditedBooking] = useState({
    rates: {
      additionalPetRate: 0,
      holidayFee: 0,
      weekendFee: 0,
      extraServices: []
    }
  });
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [timeDropdownPosition, setTimeDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const timeInputRef = useRef(null);
  const [showAddRateModal, setShowAddRateModal] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [showAnimalDropdown, setShowAnimalDropdown] = useState(false);
  const [showPetRateDropdown, setShowPetRateDropdown] = useState(false);
  const [showAdditionalPetRate, setShowAdditionalPetRate] = useState(true);
  const [showHolidayRate, setShowHolidayRate] = useState(true);
  const [showWeekendRate, setShowWeekendRate] = useState(true);
  const [selectedOccurrence, setSelectedOccurrence] = useState(null);
  const [showEditOccurrenceModal, setShowEditOccurrenceModal] = useState(false);
  const [showAddOccurrenceModal, setShowAddOccurrenceModal] = useState(false);
  const [expandedOccurrenceId, setExpandedOccurrenceId] = useState(null);
  const isProfessional = true; // TODO: Get this from auth context

  useEffect(() => {
    // Define an async function inside useEffect to fetch booking data
    const fetchBooking = async () => {
      // Set loading state to true before starting the fetch
      setLoading(true);
      
      try {
        // First try to get bookingId from route params
        let bookingId = route.params?.bookingId;

        // If no bookingId in route params, try to get from AsyncStorage
        if (!bookingId) {
          bookingId = await AsyncStorage.getItem(LAST_VIEWED_BOOKING_ID);
        } else {
          // If we got bookingId from route params, save it to AsyncStorage
          await AsyncStorage.setItem(LAST_VIEWED_BOOKING_ID, bookingId);
        }

        if (!bookingId) {
          // If still no bookingId, navigate back to MyBookings
          navigation.replace('MyBookings');
          return;
        }
        
        // Call our mock API function from mockData.js
        // await waits for the Promise to resolve
        const bookingData = await fetchBookingDetails(bookingId);
        
        // Update our component state with the fetched data
        setBooking(bookingData);
      } catch (error) {
        // If anything goes wrong (like booking not found), log the error
        console.error('Error fetching booking details:', error);
        navigation.replace('MyBookings');
      } finally {
        // Whether successful or not, set loading to false
        setLoading(false);
      }
    };

    // Only run fetchBooking if we have a bookingId in route.params
    // This prevents unnecessary API calls if no ID is provided
    fetchBooking();
    
    // The dependency array [route.params?.bookingId] means this effect will run:
    // 1. When the component first mounts
    // 2. Any time route.params?.bookingId changes
  }, [route.params?.bookingId]);

  // Add cleanup when component unmounts
  useEffect(() => {
    return () => {
      // Clear the cached booking ID when leaving the screen
      AsyncStorage.removeItem(LAST_VIEWED_BOOKING_ID);
    };
  }, []);

  // Reset edit mode when component mounts or reloads
  useEffect(() => {
    setIsEditMode(false);
  }, []);

  // Add this useEffect to properly initialize editedBooking
  useEffect(() => {
    if (booking) {
      setEditedBooking({
        ...booking,
        rates: {
          additionalPetRate: booking.rates?.additionalPetRate ?? 0,
          holidayFee: booking.rates?.holidayFee ?? 0,
          weekendFee: booking.rates?.weekendFee ?? 0,
          extraServices: booking.rates?.extraServices || []
        }
      });
    }
  }, [booking]);

  const measureTimeDropdown = () => {
    if (timeInputRef.current && Platform.OS === 'web') {
      timeInputRef.current.measure((x, y, width, height, pageX, pageY) => {
        setTimeDropdownPosition({
          top: pageY + height,
          left: pageX,
          width: width,
        });
      });
    }
  };

  const handleTimeOptionSelect = (option) => {
    setEditedBooking(prev => ({
      ...prev,
      lengthOfService: option
    }));
    setShowTimeDropdown(false);
    recalculateTotals();
  };

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

  const toggleEditMode = () => {
    if (isEditMode) {
      // Save changes
      setIsEditMode(false);
      setEditedBooking(null);
    } else {
      // Enter edit mode
      setIsEditMode(true);
      setEditedBooking({
        ...booking,
        startTime: booking.startTime ? new Date(`2024-01-01T${booking.startTime}`) : new Date(),
        endTime: booking.endTime ? new Date(`2024-01-01T${booking.endTime}`) : new Date(),
        startDate: booking.startDate ? new Date(booking.startDate) : new Date(),
        endDate: booking.endDate ? new Date(booking.endDate) : new Date(),
      });
    }
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

  const handleRemoveService = (index) => {
    // Add this function since it's referenced in the code
    console.log('Removing service at index:', index);
  };

  const renderEditButton = () => (
    <TouchableOpacity 
      onPress={toggleEditMode}
      style={styles.editButton}
      testID="edit-button"
    >
      <MaterialCommunityIcons 
        name={isEditMode ? "check" : "pencil"} 
        size={24} 
        color={theme.colors.primary} 
      />
    </TouchableOpacity>
  );

  const handleUpdatePets = (newCount) => {
    setEditedBooking(prev => ({
      ...prev,
      numberOfPets: parseInt(newCount),
    }));
    recalculateTotals();
  };

  const handleUpdateDuration = (newDuration) => {
    setEditedBooking(prev => ({
      ...prev,
      duration: parseInt(newDuration),
    }));
    recalculateTotals();
  };

  const handleRemoveRate = (index) => {
    const updatedRates = [...editedBooking.rates.extraServices];
    updatedRates.splice(index, 1);
    
    setEditedBooking(prev => ({
      ...prev,
      rates: {
        ...prev.rates,
        extraServices: updatedRates
      }
    }));
    recalculateTotals();
  };

  const recalculateTotals = async () => {
    try {
      const baseTotal = editedBooking.rates.baseRate * editedBooking.quantity;
      const extraServicesTotal = editedBooking.rates.extraServices.reduce((sum, service) => sum + service.amount, 0);
      const holidayFee = editedBooking.rates.holidayFee || 0;
      const weekendFee = editedBooking.rates.weekendFee || 0;
      
      // Calculate additional pet fees (assuming 1 pet included in base rate)
      const additionalPets = Math.max(0, editedBooking.numberOfPets - 1);
      const additionalPetTotal = additionalPets * (editedBooking.rates.additionalPetRate || 0);
      
      const subtotal = baseTotal + extraServicesTotal + holidayFee + weekendFee + additionalPetTotal;
      const clientFee = subtotal * 0.10;
      const taxes = subtotal * 0.09;
      const totalClientCost = subtotal + clientFee + taxes;
      const professionalPayout = subtotal * 0.90;

      setEditedBooking(prev => ({
        ...prev,
        costs: {
          baseTotal,
          extraServicesTotal,
          additionalPetTotal,
          subtotal,
          clientFee,
          taxes,
          totalClientCost,
          professionalPayout
        }
      }));
    } catch (error) {
      console.error('Error recalculating totals:', error);
    }
  };

  const calculateTotalCosts = (occurrences) => {
    const subtotal = occurrences.reduce((sum, occ) => sum + occ.totalCost, 0);
    const clientFee = subtotal * 0.10; // 10% client fee
    const taxes = subtotal * 0.09; // 9% tax
    return {
      subtotal,
      clientFee,
      taxes,
      totalClientCost: subtotal + clientFee + taxes
    };
  };

  const handleSaveOccurrence = (updatedOccurrence) => {
    const updatedOccurrences = booking.occurrences.map(occ => 
      occ.id === updatedOccurrence.id ? updatedOccurrence : occ
    );
    
    // Update booking with new occurrences and recalculate costs
    setBooking(prev => ({
      ...prev,
      occurrences: updatedOccurrences,
      costs: calculateTotalCosts(updatedOccurrences)
    }));
    
    setShowEditOccurrenceModal(false);
  };

  const handleAddOccurrence = (newOccurrence) => {
    const updatedOccurrences = [...booking.occurrences, {
      ...newOccurrence,
      id: `occ${booking.occurrences.length + 1}`,
    }];
    
    setBooking(prev => ({
      ...prev,
      occurrences: updatedOccurrences,
      costs: calculateTotalCosts(updatedOccurrences)
    }));
    
    setShowAddOccurrenceModal(false);
  };

  const handleDateTimeCardPress = (occurrence) => {
    setSelectedOccurrence(occurrence);
    setShowEditOccurrenceModal(true);
  };

  const renderDateTimeSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Date & Time</Text>
      {booking?.occurrences?.map((occurrence, index) => (
        <TouchableOpacity 
          key={index}
          style={styles.occurrenceCard}
          onPress={() => handleDateTimeCardPress(occurrence)}
        >
          <View style={styles.occurrenceDetails}>
            <Text style={styles.dateText}>
              {format(new Date(occurrence.startDate), 'MMM d, yyyy')}
            </Text>
            <Text style={styles.timeText}>
              {`${occurrence.startTime} - ${occurrence.endTime}`}
            </Text>
          </View>
          {isProfessional && (
            <TouchableOpacity 
              style={styles.editOccurrenceButton}
              onPress={() => handleDateTimeCardPress(occurrence)}
            >
              <MaterialCommunityIcons name="pencil" size={20} color={theme.colors.primary} />
              <Text style={styles.editOccurrenceText}>Edit</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      ))}
      
      {isProfessional && (
        <TouchableOpacity
          style={styles.addOccurrenceButton}
          onPress={() => setShowAddOccurrenceModal(true)}
        >
          <MaterialCommunityIcons name="plus" size={24} color={theme.colors.primary} />
          <Text style={styles.addOccurrenceText}>Add Occurrence</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderCostBreakdown = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Cost Breakdown</Text>
      
      {booking?.occurrences?.map((occurrence, index) => (
        <TouchableOpacity 
          key={index}
          style={styles.occurrenceCostRow}
          onPress={() => setExpandedOccurrenceId(
            expandedOccurrenceId === occurrence.id ? null : occurrence.id
          )}
        >
          <View style={styles.occurrenceCostHeader}>
            <Text>{format(new Date(occurrence.startDate), 'MMM d, yyyy')}</Text>
            <View style={styles.costAndIcon}>
              <Text style={styles.occurrenceCost}>
                ${occurrence.totalCost.toFixed(2)}
              </Text>
              <MaterialCommunityIcons 
                name={expandedOccurrenceId === occurrence.id ? "chevron-up" : "chevron-down"}
                size={20} 
                color={theme.colors.text} 
              />
            </View>
          </View>
          
          {expandedOccurrenceId === occurrence.id && (
            <View style={styles.expandedCostDetails}>
              <View style={styles.costDetailRow}>
                <Text>Base Rate:</Text>
                <Text>${occurrence.rates.baseRate.toFixed(2)}</Text>
              </View>
              {occurrence.rates.additionalRates.map((rate, idx) => (
                <View key={idx} style={styles.costDetailRow}>
                  <Text>{rate.name}:</Text>
                  <Text>${rate.amount.toFixed(2)}</Text>
                </View>
              ))}
            </View>
          )}
        </TouchableOpacity>
      ))}

      <View style={styles.costSummary}>
        <View style={styles.summaryRow}>
          <Text>Subtotal:</Text>
          <Text>${booking.costs.subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>Client Fee (10%):</Text>
          <Text>${booking.costs.clientFee.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>Taxes (9%):</Text>
          <Text>${booking.costs.taxes.toFixed(2)}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>
            ${booking.costs.totalClientCost.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );

  const formatTimeString = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const date = new Date(dateStr);
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    return format(date, 'h:mm a');
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
        onBackPress={() => navigation.goBack()}
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

        {renderDateTimeSection()}

        <View style={[styles.section, { zIndex: 2 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Service Details</Text>
            <TouchableOpacity 
              onPress={toggleEditMode}
              style={styles.sectionEditButton}
              testID="edit-button"
            >
              <MaterialCommunityIcons 
                name={isEditMode ? "check" : "pencil"} 
                size={24} 
                color={theme.colors.primary} 
              />
            </TouchableOpacity>
          </View>
          {isEditMode ? (
            <View style={{ zIndex: 3 }}>
              <View style={[styles.editRow, { zIndex: 3 }]}>
                <Text style={styles.label}>Service Type:</Text>
                <View style={[styles.dropdownContainer, { zIndex: 3 }]}>
                  <TouchableOpacity
                    style={styles.dropdownInput}
                    onPress={() => {
                      setShowServiceDropdown(!showServiceDropdown);
                      setShowAnimalDropdown(false);
                    }}
                  >
                    <Text>{editedBooking.serviceType || 'Select Service'}</Text>
                    <MaterialCommunityIcons 
                      name={showServiceDropdown ? "chevron-up" : "chevron-down"} 
                      size={24} 
                      color={theme.colors.text} 
                    />
                  </TouchableOpacity>

                  {showServiceDropdown && (
                    <View style={styles.dropdownList}>
                      <ScrollView nestedScrollEnabled={true}>
                        {SERVICE_OPTIONS.map((service) => (
                          <TouchableOpacity
                            key={service}
                            style={styles.dropdownItem}
                            onPress={() => {
                              setEditedBooking(prev => ({
                                ...prev,
                                serviceType: service
                              }));
                              setShowServiceDropdown(false);
                            }}
                          >
                            <Text style={[
                              styles.dropdownText,
                              editedBooking.serviceType === service && styles.selectedOption
                            ]}>
                              {service}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              </View>

              <View style={[styles.editRow, { zIndex: 2 }]}>
                <Text style={styles.label}>Animal Type:</Text>
                <View style={[styles.dropdownContainer, { zIndex: 2 }]}>
                  <TouchableOpacity
                    style={styles.dropdownInput}
                    onPress={() => {
                      setShowAnimalDropdown(!showAnimalDropdown);
                      setShowServiceDropdown(false);
                    }}
                  >
                    <Text>{editedBooking.animalType || 'Select Animal'}</Text>
                    <MaterialCommunityIcons 
                      name={showAnimalDropdown ? "chevron-up" : "chevron-down"} 
                      size={24} 
                      color={theme.colors.text} 
                    />
                  </TouchableOpacity>

                  {showAnimalDropdown && (
                    <View style={styles.dropdownList}>
                      <ScrollView nestedScrollEnabled={true}>
                        {ANIMAL_OPTIONS.map((animal) => (
                          <TouchableOpacity
                            key={animal}
                            style={styles.dropdownItem}
                            onPress={() => {
                              setEditedBooking(prev => ({
                                ...prev,
                                animalType: animal
                              }));
                              setShowAnimalDropdown(false);
                            }}
                          >
                            <Text style={[
                              styles.dropdownText,
                              editedBooking.animalType === animal && styles.selectedOption
                            ]}>
                              {animal}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              </View>

              <View style={[styles.editRow, { zIndex: 1 }]}>
                <Text style={styles.label}>Number of Pets:</Text>
                <TextInput
                  style={styles.editInput}
                  value={editedBooking.numberOfPets.toString()}
                  onChangeText={(text) => {
                    const number = parseInt(text) || 1;
                    setEditedBooking(prev => ({
                      ...prev,
                      numberOfPets: number
                    }));
                  }}
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>
            </View>
          ) : (
            <View>
              <Text style={[styles.label, {fontSize: 14}]}>Service Type:</Text>
              <Text style={styles.text}>{booking.serviceType}</Text>
              <Text style={[styles.label, {fontSize: 14}]}>Animal Type:</Text>
              <Text style={styles.text}>{booking.animalType}</Text>
              <Text style={[styles.label, {fontSize: 14}]}>Number of Pets:</Text>
              <Text style={styles.text}>{booking.numberOfPets}</Text>
            </View>
          )}
        </View>

        {renderCostBreakdown()}

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
      <AddRateModal
        visible={showAddRateModal}
        onClose={() => setShowAddRateModal(false)}
        onAdd={(newRate) => {
          setEditedBooking(prev => ({
            ...prev,
            rates: {
              ...prev.rates,
              extraServices: [...(prev.rates.extraServices || []), newRate]
            }
          }));
          recalculateTotals();
          setShowAddRateModal(false);
        }}
      />
      <EditOccurrenceModal
        visible={showEditOccurrenceModal}
        onClose={() => setShowEditOccurrenceModal(false)}
        onSave={handleSaveOccurrence}
        occurrence={selectedOccurrence}
      />
      <AddOccurrenceModal
        visible={showAddOccurrenceModal}
        onClose={() => setShowAddOccurrenceModal(false)}
        onAdd={handleAddOccurrence}
        defaultRates={booking?.rates}
      />
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
    marginBottom: 15,
  },
  dateTimeColumn: {
    flex: 1,
    marginRight: 10,
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
  editButton: {
    marginRight: 16,
    padding: 8,
  },
  editField: {
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    alignItems: 'center',
  },
  editableServiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  removeServiceButton: {
    marginLeft: 8,
  },
  editRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  editInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 4,
    padding: 8,
    width: 80,
    textAlign: 'right',
  },
  addRateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginTop: 8,
  },
  addRateText: {
    marginLeft: 8,
    color: theme.colors.primary,
    fontSize: 16,
  },
  editableServiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  removeServiceButton: {
    marginLeft: 8,
  },
  dropdownContainer: {
    position: 'relative',
    width: 150,
  },
  dropdownInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 4,
    padding: 4,
    backgroundColor: theme.colors.surface,
  },
  timeDropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 4,
    maxHeight: 200,
    zIndex: 1001,
    elevation: 5,
    marginTop: 4,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
  },
  dropdownText: {
    color: theme.colors.text,
  },
  selectedOption: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  bookingDatesSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  datePickerContainer: {
    flex: 1,
    marginRight: 10,
  },
  timePickerContainer: {
    width: 120,
  },
  timePickerButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 4,
    padding: 8,
    backgroundColor: theme.colors.surface,
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 4,
    maxHeight: 150,
    elevation: 5,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  rateSection: {
    marginBottom: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
  },
  rateSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: theme.colors.primary,
  },
  rateInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  rateInputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: theme.colors.placeholder,
    marginBottom: 4,
  },
  rateInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 4,
    padding: 8,
    fontSize: 14,
  },
  additionalRateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  removeButton: {
    padding: 4,
  },
  summarySection: {
    marginTop: 20,
    padding: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  rateHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  columnHeader: {
    fontSize: 12,
    color: theme.colors.placeholder,
    fontWeight: '500',
  },
  rateAmountColumn: {
    alignItems: 'flex-start',
  },
  rateActionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 72,
    gap: 8,
  },
  infoButton: {
    padding: 4,
  },
  actionButtons: {
    width: 72, // Approximate width of both buttons + gap
  },
  additionalRateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: 8,
  },
  occurrenceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  occurrenceDetails: {
    flex: 1,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 14,
    color: theme.colors.placeholder,
  },
  editOccurrenceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
  },
  editOccurrenceText: {
    color: theme.colors.primary,
    marginLeft: 5,
  },
  addOccurrenceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 8,
    marginTop: 12,
  },
  addOccurrenceText: {
    marginLeft: 8,
    color: theme.colors.primary,
    fontSize: 16,
  },
  occurrenceCostRow: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingVertical: 12,
  },
  occurrenceCostHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costAndIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  occurrenceCost: {
    fontSize: 16,
    fontWeight: '500',
  },
  costSummary: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  expandedCostDetails: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  costDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionEditButton: {
    padding: 8,
  },
});

export default BookingDetails;