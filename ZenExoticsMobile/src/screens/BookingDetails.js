import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Alert, Platform, Modal } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../styles/theme';
import CrossPlatformView from '../components/CrossPlatformView';
import BackHeader from '../components/BackHeader';
import { fetchBookingDetails, createBooking, updateBookingStatus, mockMessages, mockConversations, CURRENT_USER_ID, BOOKING_STATES } from '../data/mockData';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DatePicker from '../components/DatePicker';
import { TIME_OPTIONS } from '../data/mockData';
import AddRateModal from '../components/AddRateModal';
import { format } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';
import TimePicker from '../components/TimePicker';
import AddOccurrenceModal from '../components/AddOccurrenceModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../config/config';

const LAST_VIEWED_BOOKING_ID = 'last_viewed_booking_id';

// Replace with Services that professional offers
const SERVICE_OPTIONS = ['Dog Walking', 'Pet Sitting', 'House Sitting', 'Drop-In Visits'];
// Replace with Animal types that the client owns
const ANIMAL_OPTIONS = ['Dog', 'Cat', 'Bird', 'Small Animal'];
// Replace with the pets that the client has in their "my pets" tab
const PET_OPTIONS = [
  { id: 'dog1', name: 'Max', type: 'Dog', breed: 'Golden Retriever' },
  { id: 'cat1', name: 'Luna', type: 'Cat', breed: 'Siamese' },
  // Add more default options or fetch from an API
];

const mockUpdateBookingPets = async (bookingId, pets) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('Updating booking pets:', { bookingId, pets });
  return { success: true };
};

const mockUpdateBookingService = async (bookingId, serviceDetails) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('Updating booking service:', { bookingId, serviceDetails });
  return { success: true };
};

const formatDateWithoutTimezone = (dateString) => {
  if (!dateString) return new Date();
  // Split the date string to avoid timezone issues
  const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
  return new Date(year, month - 1, day); // month is 0-based in JS Date
};

const calculateTimeUnits = (startDate, endDate, startTime, endTime, timeUnit) => {
  const start = new Date(`${startDate}T${startTime}`);
  const end = new Date(`${endDate}T${endTime}`);
  const diffMs = end - start;
  
  switch(timeUnit) {
    case '15 min':
      return Math.ceil(diffMs / (15 * 60 * 1000));
    case '30 min':
      return Math.ceil(diffMs / (30 * 60 * 1000));
    case '45 min':
      return Math.ceil(diffMs / (45 * 60 * 1000));
    case '1 hr':
      return Math.ceil(diffMs / (60 * 60 * 1000));
    case '2 hr':
      return Math.ceil(diffMs / (2 * 60 * 60 * 1000));
    case '4 hr':
      return Math.ceil(diffMs / (4 * 60 * 60 * 1000));
    case '8 hr':
      return Math.ceil(diffMs / (8 * 60 * 60 * 1000));
    case '24 hr':
    case 'per day':
      return Math.ceil(diffMs / (24 * 60 * 60 * 1000));
    case 'overnight':
      return 1; // Overnight is typically counted as one unit
    case 'per visit':
      return 1; // Per visit is counted as one unit
    default:
      return 1;
  }
};

const calculateOccurrenceCost = (occurrence) => {
  // If occurrence doesn't have rates, return 0
  if (!occurrence.rates) {
    return 0;
  }
  
  const timeUnits = calculateTimeUnits(
    occurrence.startDate,
    occurrence.endDate,
    occurrence.startTime,
    occurrence.endTime,
    occurrence.rates.timeUnit
  );
  
  const baseTotal = occurrence.rates.baseRate * timeUnits;
  const additionalRatesTotal = (occurrence.rates.additionalRates || [])
    .reduce((sum, rate) => sum + parseFloat(rate.amount || 0), 0);
    
  return baseTotal + additionalRatesTotal;
};

const RequestChangesModal = ({ visible, onClose, onSubmit, loading }) => {
  const [reason, setReason] = useState('');

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Request Changes</Text>
          <TextInput
            style={styles.reasonInput}
            placeholder="Enter reason for changes..."
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={4}
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, styles.submitButton]}
              onPress={() => onSubmit(reason)}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Submit</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const BookingDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { is_prototype } = useContext(AuthContext);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProfessionalView, setIsProfessionalView] = useState(false);
  const [isPetsEditMode, setIsPetsEditMode] = useState(false);
  const [isServiceEditMode, setIsServiceEditMode] = useState(false);
  const [editedBooking, setEditedBooking] = useState({
    serviceDetails: {
      type: '',
      animalType: '',
      numberOfPets: 0
    },
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
  const [showAddOccurrenceModal, setShowAddOccurrenceModal] = useState(false);
  const [expandedOccurrenceId, setExpandedOccurrenceId] = useState(null);
  const [selectedPets, setSelectedPets] = useState([]);
  const [showPetDropdown, setShowPetDropdown] = useState(false);
  const [isPetsSaving, setIsPetsSaving] = useState(false);
  const [isServiceSaving, setIsServiceSaving] = useState(false);
  const [showRequestChangesModal, setShowRequestChangesModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState({
    visible: false,
    actionText: '',
    onConfirm: null,
    isLoading: false
  });
  const [availablePets, setAvailablePets] = useState([]);
  const [isLoadingPets, setIsLoadingPets] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      setLoading(true);
      
      try {
        let bookingId = route.params?.bookingId;
        let initialData = route.params?.initialData;
        let isProfessional = route.params?.isProfessional;
        setIsProfessionalView(isProfessional);

        if (is_prototype) {
          if (!bookingId && initialData) {
            bookingId = await createBooking(
              initialData.clientId || 'client123',
              initialData.professionalId || 'professional123',
              initialData
            );
          }

          if (!bookingId) {
            bookingId = await AsyncStorage.getItem(LAST_VIEWED_BOOKING_ID);
          }

          if (!bookingId) {
            navigation.replace('MyBookings');
            return;
          }

          console.log('Fetching booking with ID:', bookingId);
          await AsyncStorage.setItem(LAST_VIEWED_BOOKING_ID, bookingId);
          const bookingData = await fetchBookingDetails(bookingId);
          console.log('Fetched booking data:', bookingData);
          setBooking(bookingData);
        } else {
          // Real API call
          if (!bookingId) {
            navigation.replace('MyBookings');
            return;
          }

          let token = await AsyncStorage.getItem('userToken');
          const response = await axios.get(
            `${API_BASE_URL}/api/bookings/v1/${bookingId}/?is_prorated=true`,
            { headers: { Authorization: `Bearer ${token}` }}
          );

          // Transform API response to match the expected format
          const transformedBooking = {
            ...response.data,
            id: response.data.booking_id,
            clientName: response.data.parties.client_name,
            professionalName: response.data.parties.professional_name,
            serviceType: response.data.service_details.service_type,
            animalType: response.data.service_details.animal_type,
            numberOfPets: response.data.service_details.num_pets,
            costs: response.data.cost_summary,
            status: response.data.status
          };

          console.log('Fetched and transformed booking data:', transformedBooking);
          setBooking(transformedBooking);
        }
      } catch (error) {
        console.error('Error fetching booking details:', error);
        Alert.alert(
          'Error',
          'Unable to load booking details. Please try again.',
          [{ text: 'OK', onPress: () => navigation.replace('MyBookings') }]
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [route.params?.bookingId, navigation, is_prototype]);

  // Add helper function to safely display data
  const getDisplayValue = (value, placeholder = 'TBD') => {
    if (value === null || value === undefined || value === '') {
      return placeholder;
    }
    return value;
  };

  // Reset edit mode when component mounts or reloads
  useEffect(() => {
    setIsPetsEditMode(false);
    setIsServiceEditMode(false);
  }, []);

  // Add this useEffect to properly initialize editedBooking
  useEffect(() => {
    if (booking) {
      setEditedBooking({
        ...booking,
        serviceDetails: {
          type: booking.serviceType || '',
          animalType: booking.animalType || '',
          numberOfPets: (booking.pets || []).length  // Initialize based on pets array length
        },
        rates: {
          additionalPetRate: booking.rates?.additionalPetRate ?? 0,
          holidayFee: booking.rates?.holidayFee ?? 0,
          weekendFee: booking.rates?.weekendFee ?? 0,
          extraServices: booking.rates?.extraServices || []
        }
      });
    }
  }, [booking]);

  // Add function to fetch available pets
  const fetchAvailablePets = async () => {
    console.log('fetching available pets with booking id:', booking.booking_id);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
      setIsLoadingPets(true);
      const response = await axios.get(
        `${API_BASE_URL}/api/booking-drafts/v1/${booking.booking_id}/available_pets/`,
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setAvailablePets(response.data);
      console.log('available pets:', response.data);
    } catch (error) {
      console.error('Error fetching available pets:', error);
      Alert.alert('Error', 'Failed to fetch available pets');
    } finally {
      setIsLoadingPets(false);
    }
  };

  const togglePetsEditMode = async () => {
    if (isPetsEditMode) {
      // Save changes
      try {
        setIsPetsSaving(true);
        if (!is_prototype) {
          const token = await AsyncStorage.getItem('userToken');
          if (!token) {
            throw new Error('No authentication token found');
          }
          const response = await axios.patch(
            `${API_BASE_URL}/api/booking-drafts/v1/${booking.booking_id}/update_pets/`,
            { pets: selectedPets.map(pet => ({
                pet_id: pet.pet_id,
                name: pet.name,
                species: pet.species,
                breed: pet.breed
              }))
            },
            { headers: { Authorization: `Bearer ${token}` }}
          );
          // Update booking status and pets from response
          if (response.data.booking_status) {
            setBooking(prevBooking => ({
              ...prevBooking,
              status: response.data.booking_status,
              pets: selectedPets
            }));
          }
        } else {
          setBooking(prev => ({
            ...prev,
            pets: selectedPets
          }));
        }
        setIsPetsEditMode(false);
      } catch (error) {
        console.error('Error updating pets:', error);
        Alert.alert('Error', 'Failed to update pets');
      } finally {
        setIsPetsSaving(false);
      }
    } else {
      setSelectedPets(booking.pets || []);
      setIsPetsEditMode(true);
    }
  };

  const renderPetSelector = () => {
    if (!isPetsEditMode) {
      return (
        <View>
          {booking?.pets?.length > 0 ? (
            booking.pets.map((pet, index) => (
              <View key={index} style={styles.petRow}>
                <Text style={styles.petName}>
                  {pet.name} • {pet.species} {pet.breed && `• ${pet.breed}`}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noContentText}>No pets added to this booking</Text>
          )}
        </View>
      );
    }

    return (
      <View>
        {selectedPets.map((pet, index) => (
          <View key={index} style={styles.petRow}>
            <Text style={styles.petName}>
              {pet.name} • {pet.species} {pet.breed && `• ${pet.breed}`}
            </Text>
            <TouchableOpacity
              onPress={() => setSelectedPets(prev => prev.filter((_, i) => i !== index))}
            >
              <MaterialCommunityIcons name="close" size={24} color={theme.colors.error} />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity
          style={styles.addPetButton}
          onPress={async () => {
            if (!showPetDropdown && !is_prototype) {
              await fetchAvailablePets();
            }
            setShowPetDropdown(!showPetDropdown);
          }}
        >
          <Text style={styles.addPetText}>Add Pet</Text>
          <MaterialCommunityIcons 
            name={showPetDropdown ? "chevron-up" : "chevron-down"} 
            size={24} 
            color={theme.colors.text} 
          />
        </TouchableOpacity>

        {showPetDropdown && (
          <View style={styles.dropdownList}>
            <ScrollView nestedScrollEnabled={true} style={{ maxHeight: 200 }}>
              {isLoadingPets ? (
                <ActivityIndicator style={{ padding: 10 }} />
              ) : (
                (is_prototype ? PET_OPTIONS : availablePets)
                  .filter(pet => !selectedPets.some(selected => selected.pet_id === pet.pet_id))
                  .map((pet) => (
                    <TouchableOpacity
                      key={pet.pet_id || pet.id}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedPets(prev => [...prev, pet]);
                        setShowPetDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownText}>
                        {pet.name} • {pet.species} {pet.breed && `• ${pet.breed}`}
                      </Text>
                    </TouchableOpacity>
                  ))
              )}
              {!isLoadingPets && availablePets.length === 0 && (
                <Text style={styles.noContentText}>No pets available</Text>
              )}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  const toggleServiceEditMode = async () => {
    if (isServiceEditMode) {
      try {
        setIsServiceSaving(true);
        const response = await mockUpdateBookingService(booking.id, editedBooking);
        if (response.success) {
          // Check if actual changes were made before updating status
          const serviceDetailsChanged = 
            booking.serviceType !== editedBooking.serviceDetails?.type ||
            booking.animalType !== editedBooking.serviceDetails?.animalType ||
            booking.numberOfPets !== editedBooking.serviceDetails?.numberOfPets;

          if (serviceDetailsChanged) {
            setBooking(prev => ({
              ...prev,
              serviceType: editedBooking.serviceDetails?.type || prev.serviceType,
              animalType: editedBooking.serviceDetails?.animalType || prev.animalType,
              numberOfPets: editedBooking.serviceDetails?.numberOfPets || prev.numberOfPets
            }));
            handleStatusUpdateAfterEdit(); // Only call this if changes were made
          }
          setIsServiceEditMode(false);
        }
      } catch (error) {
        console.error('Error updating service:', error);
        Alert.alert('Error', 'Failed to update service details');
      } finally {
        setIsServiceSaving(false);
      }
    } else {
      // Initialize editedBooking with current values when entering edit mode
      setEditedBooking(prev => ({
        ...prev,
        serviceDetails: {
          type: booking.serviceType || '',
          animalType: booking.animalType || '',
          numberOfPets: booking.numberOfPets || 0  // Make sure to use the current numberOfPets
        }
      }));
      setIsServiceEditMode(true);
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

  const canEdit = () => {
    if (!booking) return false;

    // If not a professional view, can't edit
    if (!isProfessionalView) return false;

    // Check if status allows professional edits
    return BOOKING_STATES.PROFESSIONAL_EDITABLE_STATES.includes(booking.status);
  };

  const renderEditButton = () => (
    canEdit() && (
      <TouchableOpacity 
        onPress={togglePetsEditMode}
        style={[styles.editButton, isPetsEditMode && styles.saveButton]}
        testID="edit-button"
        disabled={isPetsSaving}
      >
        {isPetsSaving ? (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        ) : (
          isPetsEditMode ? (
            <Text style={styles.saveButtonText}>Save Pets</Text>
          ) : (
            <MaterialCommunityIcons 
              name="pencil" 
              size={24} 
              color={theme.colors.primary} 
            />
          )
        )}
      </TouchableOpacity>
    )
  );

  const handleUpdatePets = (text) => {
    setEditedBooking(prev => ({
      ...prev,
      serviceDetails: {
        ...prev.serviceDetails,
        numberOfPets: text
      }
    }));
  };

  const handleUpdateDuration = (newDuration) => {
    setEditedBooking(prev => ({
      ...prev,
      duration: parseInt(newDuration),
    }));
    setHasUnsavedChanges(true);
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
    setHasUnsavedChanges(true);
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
    
    handleStatusUpdateAfterEdit();
    setShowAddOccurrenceModal(false);
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
    
    handleStatusUpdateAfterEdit();
    setShowAddOccurrenceModal(false);
  };

  const handleDateTimeCardPress = (occurrence) => {
    // Transform snake_case to camelCase
    const transformedOccurrence = {
      id: occurrence.id,
      startDate: occurrence.start_date,
      endDate: occurrence.end_date,
      startTime: occurrence.start_time,
      endTime: occurrence.end_time,
      rates: {
        baseRate: occurrence.rates?.baseRate || 0,
        additionalAnimalRate: occurrence.rates?.additionalAnimalRate || 0,
        appliesAfterAnimals: occurrence.rates?.appliesAfterAnimals || '1',
        holidayRate: occurrence.rates?.holidayRate || 0,
        additionalRates: occurrence.rates?.additionalRates || [],
        timeUnit: occurrence.rates?.timeUnit || 'per visit'
      }
    };
    setSelectedOccurrence(transformedOccurrence);
    setShowAddOccurrenceModal(true);
  };

  const handleDeleteOccurrence = async (occurrenceId) => {
    setConfirmationModal(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedOccurrences = booking.occurrences.filter(occ => occ.id !== occurrenceId);
      
      setBooking(prev => ({
        ...prev,
        occurrences: updatedOccurrences,
        costs: calculateTotalCosts(updatedOccurrences)
      }));
      
      handleStatusUpdateAfterEdit();
    } catch (error) {
      console.error('Error deleting occurrence:', error);
      Alert.alert('Error', 'Failed to delete occurrence');
    } finally {
      // First set loading to false but keep the modal visible and text
      setConfirmationModal(prev => ({ 
        ...prev, 
        isLoading: false,
        visible: false  // This will trigger the modal's animation to close
      }));
      
      // After a short delay to allow the modal to animate out, clear the rest of the state
      setTimeout(() => {
        setConfirmationModal({ 
          visible: false, 
          actionText: '', 
          onConfirm: null, 
          isLoading: false 
        });
      }, 300); // Adjust timing to match modal animation duration
    }
  };

  const confirmDeleteOccurrence = (occurrenceId) => {
    setConfirmationModal({
      visible: true,
      actionText: 'delete this occurrence',
      onConfirm: () => handleDeleteOccurrence(occurrenceId),
      isLoading: false
    });
  };

  const renderDateTimeSection = () => (
    <View>
      <Text style={styles.sectionTitle}>
        {canEdit() ? "Dates & Times (Set Rates for Dates)" : "Dates & Times"}
      </Text>
      {(booking?.occurrences || []).map((occurrence, index) => (
        canEdit() ? (
          <TouchableOpacity 
            key={index}
            style={styles.occurrenceCard}
            onPress={() => handleDateTimeCardPress(occurrence)}
          >
            <View style={styles.occurrenceDetails}>
              <Text style={styles.dateText}>
                {occurrence.end_date && occurrence.start_date !== occurrence.end_date ? 
                  `${format(formatDateWithoutTimezone(occurrence.start_date), 'MMM d, yyyy')} - ${format(formatDateWithoutTimezone(occurrence.end_date), 'MMM d, yyyy')}` :
                  format(formatDateWithoutTimezone(occurrence.start_date), 'MMM d, yyyy')
                }
              </Text>
              <Text style={styles.timeText}>
                {`${occurrence.start_time} - ${occurrence.end_time}`}
              </Text>
            </View>
            <View style={styles.occurrenceActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => confirmDeleteOccurrence(occurrence.id)}
              >
                <MaterialCommunityIcons name="trash-can-outline" size={20} color={theme.colors.error} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleDateTimeCardPress(occurrence)}
              >
                <MaterialCommunityIcons name="pencil" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ) : (
          <View key={index} style={styles.occurrenceCard}>
            <View style={styles.occurrenceDetails}>
              <Text style={styles.dateText}>
                {occurrence.end_date && occurrence.start_date !== occurrence.end_date ? 
                  `${format(formatDateWithoutTimezone(occurrence.start_date), 'MMM d, yyyy')} - ${format(formatDateWithoutTimezone(occurrence.end_date), 'MMM d, yyyy')}` :
                  format(formatDateWithoutTimezone(occurrence.start_date), 'MMM d, yyyy')
                }
              </Text>
              <Text style={styles.timeText}>
                {`${occurrence.start_time} - ${occurrence.end_time}`}
              </Text>
            </View>
          </View>
        )
      ))}
      
      {canEdit() && (
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
      
      {(booking?.occurrences || []).map((occurrence, index) => (
        <TouchableOpacity 
          key={index}
          style={styles.occurrenceCostRow}
          onPress={() => setExpandedOccurrenceId(
            expandedOccurrenceId === occurrence.id ? null : occurrence.id
          )}
        >
          <View style={styles.occurrenceCostHeader}>
            <Text>
              {occurrence.end_date && occurrence.start_date !== occurrence.end_date ? 
                `${format(formatDateWithoutTimezone(occurrence.start_date), 'MMM d, yyyy')} - ${format(formatDateWithoutTimezone(occurrence.end_date), 'MMM d, yyyy')}` :
                format(formatDateWithoutTimezone(occurrence.start_date), 'MMM d, yyyy')
              }
            </Text>
            <View style={styles.costAndIcon}>
              <Text style={styles.occurrenceCost}>
                ${calculateOccurrenceCost(occurrence).toFixed(2)}
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
                <Text>Base Rate ({occurrence.rates?.timeUnit || 'per visit'}):</Text>
                <Text>
                  ${parseFloat(occurrence.rates?.baseRate).toFixed(2)} × {
                    calculateTimeUnits(
                      occurrence.start_date,
                      occurrence.end_date,
                      occurrence.start_time,
                      occurrence.end_time,
                      occurrence.rates?.timeUnit
                    )
                  } = ${(parseFloat(occurrence.rates?.baseRate) * 
                        calculateTimeUnits(
                          occurrence.start_date,
                          occurrence.end_date,
                          occurrence.start_time,
                          occurrence.end_time,
                          occurrence.rates.timeUnit
                        )).toFixed(2)}
                </Text>
              </View>
              {occurrence.rates?.additionalRates?.map((rate, idx) => (
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
          <Text>${(booking?.costs?.subtotal || 0).toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>Client Fee (10%):</Text>
          <Text>${(booking?.costs?.clientFee || 0).toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>Taxes (9%):</Text>
          <Text>${(booking?.costs?.taxes || 0).toFixed(2)}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>
            ${(booking?.costs?.totalClientCost || 0).toFixed(2)}
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

  const sendBookingMessage = async (bookingId, recipientId, messageType) => {
    try {
      if (!booking) {
        throw new Error('No booking data available');
      }

      console.log('Sending booking message:', {
        bookingId,
        recipientId,
        messageType,
        booking
      });

      // Find the existing conversation with Dr. Mike Johnson
      const conversationId = 'conv_2'; // This is the existing conversation ID from mockData
      console.log('Using existing conversation:', conversationId);

      const bookingMessage = {
        message_id: Date.now().toString(),
        participant1_id: CURRENT_USER_ID,
        participant2_id: recipientId,
        sender: CURRENT_USER_ID,
        type: 'booking_request',
        data: {
          bookingId: bookingId,
          messageType: messageType,
          serviceType: booking.serviceType,
          dates: booking.occurrences.map(occ => ({
            startDate: occ.start_date,
            endDate: occ.end_date,
            startTime: occ.start_time,
            endTime: occ.end_time
          })),
          totalCost: booking.costs.totalClientCost,
          status: booking.status
        },
        timestamp: new Date().toISOString(),
        status: "sent",
        is_booking_request: true,
        metadata: {}
      };

      // Add message to existing conversation
      if (!mockMessages[conversationId]) {
        mockMessages[conversationId] = [];
      }
      mockMessages[conversationId].push(bookingMessage);

      // Update the conversation's last message
      const conversation = mockConversations.find(conv => conv.id === conversationId);
      if (conversation) {
        conversation.lastMessage = "Booking update sent";
        conversation.timestamp = new Date().toISOString();
        conversation.unread = true;
      }

      console.log('Message sent successfully to conversation:', conversationId);
      console.log('Updated conversation messages:', mockMessages[conversationId]);
      return true;
    } catch (error) {
      console.error('Error sending booking message:', error);
      return false;
    }
  };

  const handleStatusUpdate = async (newStatus, reason = '', metadata = {}) => {
    setConfirmationModal(prev => ({ ...prev, isLoading: true }));
    
    try {
      // First send the message
      if (newStatus === BOOKING_STATES.PENDING_CLIENT_APPROVAL) {
        const messageSent = await sendBookingMessage(
          booking.id,
          booking.clientId || 'client123',
          'professional_changes'
        );
        if (!messageSent) {
          throw new Error('Failed to send booking message');
        }
      }

      // Then update the booking status
      console.log('Updating booking status:', {
        bookingId: booking.id,
        currentStatus: booking.status,
        newStatus,
        reason,
        metadata
      });

      const updatedBooking = await updateBookingStatus(
        booking.id, 
        newStatus, 
        reason, 
        {
          ...metadata,
          occurrences: booking.occurrences,
          costs: booking.costs
        }
      );

      setBooking(updatedBooking);
      setHasUnsavedChanges(false);
      Alert.alert('Success', `Booking ${newStatus.toLowerCase()} successfully`);
    } catch (error) {
      console.error('Error updating booking status:', error);
      Alert.alert('Error', 'Failed to update booking status');
    } finally {
      setConfirmationModal(prev => ({ 
        ...prev, 
        isLoading: false,
        visible: false
      }));
    }
  };

  const handleRequestChanges = async (reason) => {
    await handleStatusUpdate(BOOKING_STATES.PENDING_PROFESSIONAL_CHANGES, reason);
    setShowRequestChangesModal(false);
  };

  const showConfirmation = (actionText, onConfirm) => {
    setConfirmationModal({
      visible: true,
      actionText,
      onConfirm,
      isLoading: false
    });
  };

  const hideConfirmation = () => {
    setConfirmationModal({
      visible: false,
      actionText: '',
      onConfirm: null,
      isLoading: false
    });
  };

  const renderActionButtons = () => {
    if (!booking) return null;

    const buttons = [];

    if (isProfessionalView) {
      // Send to Client button - Professional Only
      if ([
        BOOKING_STATES.PENDING_INITIAL_PROFESSIONAL_CHANGES,
        BOOKING_STATES.PENDING_PROFESSIONAL_CHANGES,
        BOOKING_STATES.CONFIRMED_PENDING_PROFESSIONAL_CHANGES
      ].includes(booking.status)) {
        buttons.push(
          <TouchableOpacity
            key="send"
            style={[styles.button, styles.primaryButton]}
            onPress={() => showConfirmation(
              'send these changes to the client',
              () => handleStatusUpdate(BOOKING_STATES.PENDING_CLIENT_APPROVAL)
            )}
          >
            <Text style={styles.buttonText}>Send to Client</Text>
          </TouchableOpacity>
        );
      }

      // Deny button - Professional Only
      if (booking.status === BOOKING_STATES.PENDING_INITIAL_PROFESSIONAL_CHANGES) {
        buttons.push(
          <TouchableOpacity
            key="deny"
            style={[styles.button, styles.denyButton]}
            onPress={() => showConfirmation(
              'deny this booking',
              () => handleStatusUpdate(BOOKING_STATES.DENIED)
            )}
          >
            <Text style={styles.buttonText}>Deny</Text>
          </TouchableOpacity>
        );
      }
    }

    // Cancel button - Both Professional and Client
    if ([
      BOOKING_STATES.PENDING_PROFESSIONAL_CHANGES,
      BOOKING_STATES.CONFIRMED,
      BOOKING_STATES.CONFIRMED_PENDING_PROFESSIONAL_CHANGES,
      BOOKING_STATES.CONFIRMED_PENDING_CLIENT_APPROVAL
    ].includes(booking.status)) {
      buttons.push(
        <TouchableOpacity
          key="cancel"
          style={[styles.button, styles.cancelButton]}
          onPress={() => showConfirmation(
            'cancel this booking',
            () => handleStatusUpdate(BOOKING_STATES.CANCELLED)
          )}
        >
          <Text style={styles.cancelButtonText}>Cancel Booking</Text>
        </TouchableOpacity>
      );
    }

    // Client-specific buttons
    if (!isProfessionalView) {
      // Approve button - Client Only
      if ([
        BOOKING_STATES.PENDING_CLIENT_APPROVAL,
        BOOKING_STATES.CONFIRMED_PENDING_CLIENT_APPROVAL
      ].includes(booking.status)) {
        buttons.push(
          <TouchableOpacity
            key="approve"
            style={[styles.button, styles.approveButton]}
            onPress={() => showConfirmation(
              'approve this booking',
              () => handleStatusUpdate(BOOKING_STATES.CONFIRMED)
            )}
          >
            <Text style={styles.buttonText}>Approve</Text>
          </TouchableOpacity>
        );
      }
    }

    return (
      <View style={styles.actionButtonsContainer}>
        {buttons}
      </View>
    );
  };

  // Add this effect to update editedBooking when booking changes
  useEffect(() => {
    if (booking) {
      setEditedBooking(booking);
    }
  }, [booking]);

  const handleServiceTypeChange = (newServiceType) => {
    console.log('Previous editedBooking:', editedBooking);
    console.log('New service type:', newServiceType);
    
    setEditedBooking(prev => {
      const updated = {
        ...prev,
        serviceDetails: {
          ...prev.serviceDetails,
          type: newServiceType
        }
      };
      console.log('Updated editedBooking:', updated);
      return updated;
    });
  };

  const renderServiceTypeDropdown = () => (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity
        style={styles.dropdownInput}
        onPress={() => setShowServiceDropdown(!showServiceDropdown)}
      >
        <Text>{editedBooking?.serviceDetails?.type || 'Select Service Type'}</Text>
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
                    serviceDetails: {
                      ...(prev.serviceDetails || {}),
                      type: service
                    }
                  }));
                  setShowServiceDropdown(false);
                  handleStatusUpdateAfterEdit();
                }}
              >
                <Text style={[
                  styles.dropdownText,
                  editedBooking?.serviceDetails?.type === service && styles.selectedOption
                ]}>
                  {service}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );

  const renderAnimalTypeDropdown = () => (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity
        style={styles.dropdownInput}
        onPress={() => setShowAnimalDropdown(!showAnimalDropdown)}
      >
        <Text>{editedBooking?.serviceDetails?.animalType || 'Select Animal Type'}</Text>
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
                    serviceDetails: {
                      ...(prev.serviceDetails || {}),
                      animalType: animal
                    }
                  }));
                  setShowAnimalDropdown(false);
                  handleStatusUpdateAfterEdit();
                }}
              >
                <Text style={[
                  styles.dropdownText,
                  editedBooking?.serviceDetails?.animalType === animal && styles.selectedOption
                ]}>
                  {animal}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );

  return (
    <CrossPlatformView fullWidthHeader={true}>
      <BackHeader
        title="Booking Details"
        onBackPress={() => navigation.navigate('MyBookings')}
      />
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : !booking ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to load booking details</Text>
        </View>
      ) : (
        <ScrollView style={styles.container}>
          <StatusBadge status={getDisplayValue(booking?.status, 'Pending Professional Changes')} />
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Booking Parties</Text>
            <View style={styles.serviceDetailRow}>
              <Text style={styles.label}>Client:  </Text>
              <Text style={styles.value}>{getDisplayValue(booking?.clientName)}</Text>
            </View>
            <View style={styles.serviceDetailRow}>
              <Text style={styles.label}>Professional:  </Text>
              <Text style={styles.value}>{getDisplayValue(booking?.professionalName)}</Text>
            </View>
          </View>

          <View style={[styles.section, styles.petsSection]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Booking Pets</Text>
              {renderEditButton()}
            </View>
            
            {renderPetSelector()}
          </View>

          <View style={[styles.section, { zIndex: 2 }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Service Details</Text>
              {canEdit() && (
                <TouchableOpacity 
                  onPress={toggleServiceEditMode}
                  style={styles.sectionEditButton}
                  disabled={isServiceSaving}
                  testID="edit-button"
                >
                  {isServiceSaving ? (
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                  ) : (
                    <MaterialCommunityIcons 
                      name={isServiceEditMode ? "check" : "pencil"} 
                      size={24} 
                      color={theme.colors.primary} 
                    />
                  )}
                </TouchableOpacity>
              )}
            </View>
            {isServiceEditMode ? (
              <View style={styles.serviceEditContainer}>
                <View style={[styles.serviceInputRow, { zIndex: 3 }]}>
                  <Text style={styles.inputLabel}>Service Type:</Text>
                  <View style={styles.inputContainer}>
                    {renderServiceTypeDropdown()}
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.serviceDetailsContainer}>
                <View style={styles.serviceDetailRow}>
                  <Text style={styles.label}>Service Type: </Text>
                  <Text style={styles.value}>{booking.serviceType}</Text>
                </View>
              </View>
            )}
          </View>

          <View style={[styles.section, styles.dateTimeSection]}>
            {renderDateTimeSection()}
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

          {renderActionButtons()}

          <RequestChangesModal
            visible={showRequestChangesModal}
            onClose={() => setShowRequestChangesModal(false)}
            onSubmit={handleRequestChanges}
            loading={actionLoading}
          />
        </ScrollView>
      )}
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
      <AddOccurrenceModal
        visible={showAddOccurrenceModal}
        onClose={() => {
          setShowAddOccurrenceModal(false);
          setSelectedOccurrence(null);
        }}
        onAdd={selectedOccurrence ? handleSaveOccurrence : handleAddOccurrence}
        defaultRates={booking?.rates}
        initialOccurrence={selectedOccurrence}
        isEditing={!!selectedOccurrence}
      />
      <ConfirmationModal
        visible={confirmationModal.visible}
        actionText={confirmationModal.actionText}
        onClose={() => {
          if (!confirmationModal.isLoading) {
            setConfirmationModal({ 
              visible: false, 
              actionText: confirmationModal.actionText, 
              onConfirm: null, 
              isLoading: false 
            });
          }
        }}
        onConfirm={confirmationModal.onConfirm}
        isLoading={confirmationModal.isLoading}
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
    position: 'relative',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 12,
  },
  label: {
    fontSize: theme.fontSizes.largeLarge,
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
    left: 0,
    right: 0,
    top: '100%',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 4,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
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
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
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
  petItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  petDetails: {
    fontSize: 14,
    color: theme.colors.placeholder,
  },
  addPetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addPetText: {
    marginLeft: 8,
    color: theme.colors.primary,
    fontSize: 16,
  },
  petDropdown: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: theme.colors.surface,
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  dropdownPetName: {
    fontSize: 16,
    fontWeight: '500',
  },
  dropdownPetDetails: {
    fontSize: 14,
    color: theme.colors.placeholder,
    marginTop: 2,
  },
  noPetsText: {
    fontSize: 14,
    color: theme.colors.placeholder,
    fontStyle: 'italic',
  },
  petsSection: {
    zIndex: 3,
    elevation: 3,
  },
  dateTimeSection: {
    zIndex: 1,
    elevation: 1,
  },
  actionButtonsContainer: {
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
  },
  submitButtonText: {
    color: theme.colors.surface,
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  denyButton: {
    backgroundColor: theme.colors.error,
  },
  serviceEditContainer: {
    gap: 16,
  },
  serviceInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: theme.fontSizes.largeLarge,
    color: theme.colors.text,
    flex: 1,
  },
  inputContainer: {
    width: 150, // Fixed width for dropdowns and number input
  },
  numberInput: {
    height: 40,
    width: 150, // Match the width of dropdowns
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  serviceDetailsContainer: {
    gap: 12,
  },
  serviceDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: theme.fontSizes.mediumLarge,
    color: theme.colors.text,
  },
  value: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text,
    fontWeight: '500',
  },
  occurrenceActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default BookingDetails;