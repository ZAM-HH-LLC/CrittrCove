import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Switch, Platform, Dimensions, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme } from '../styles/theme';
import UnavailableTimeSlot from './UnavailableTimeSlot';
import { format, parse } from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const modalWidth = Platform.OS === 'web' ? width * 0.4 : width * 0.9;

const ALL_SERVICES = "All Services";
const SERVICE_TYPES = [
  ALL_SERVICES,
  "Overnight Cat Sitting (Client's Home)",
  "Cat Boarding",
  "Drop-In Visits (30 min)",
  "Drop-In Visits (60 min)",
  "Dog Walking",
  "Doggy Day Care",
  "Pet Boarding",
  "Exotic Pet Care",
  "Daytime Pet Sitting",
  "Ferrier",
];

const AddAvailabilityModal = ({ isVisible, onClose, onSave, selectedDates, currentAvailability, bookings, onClientPress }) => {
  const [isAllDay, setIsAllDay] = useState(false);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [isAvailable, setIsAvailable] = useState(true);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);

  useEffect(() => {
    if (selectedDates.length > 0 && !isAllDay) {
      const currentStartTime = format(startTime, 'HH:mm');
      const currentEndTime = format(endTime, 'HH:mm');
      
      const hasMatchingUnavailableTime = currentAvailability[selectedDates[0]]?.unavailableTimes?.some(
        time => time.startTime === currentStartTime && time.endTime === currentEndTime
      );
      
      setIsAvailable(!hasMatchingUnavailableTime);
    }
  }, [selectedDates, startTime, endTime, currentAvailability]);

  const isDuplicateTime = () => {
    console.log("Checking for duplicate time");
    console.log("Current availability for date:", currentAvailability[selectedDates[0]]);
    
    if (!currentAvailability[selectedDates[0]]) return false;
    
    const existingTimes = currentAvailability[selectedDates[0]].unavailableTimes || [];
    const newStartTime = format(startTime, 'HH:mm');
    const newEndTime = format(endTime, 'HH:mm');
    
    console.log("Existing times:", existingTimes);
    console.log("New time:", newStartTime, "-", newEndTime);
    
    const isDuplicate = existingTimes.some(time => 
      time.startTime === newStartTime && 
      time.endTime === newEndTime
    );
    
    console.log("Is duplicate:", isDuplicate);
    return isDuplicate;
  };

  const handleSave = () => {
    if (selectedServices.length === 0) {
      return;
    }
    
    const services = selectedServices.includes(ALL_SERVICES) 
      ? SERVICE_TYPES.filter(service => service !== ALL_SERVICES) 
      : selectedServices;

    if (isAvailable && !isAllDay) {
      const isDuplicate = isDuplicateTime();
      if (isDuplicate) {
        return;
      }
    }

    setIsAvailable(!isAvailable);

    onSave({
      dates: selectedDates,
      isAllDay,
      startTime: isAllDay ? null : format(startTime, 'HH:mm'),
      endTime: isAllDay ? null : format(endTime, 'HH:mm'),
      isAvailable: !isAvailable,
      serviceTypes: services,
      reason: `Unavailable for: ${services.join(', ')}`,
      timeToRemove: !isAvailable ? {
        startTime: format(startTime, 'HH:mm'),
        endTime: format(endTime, 'HH:mm')
      } : null
    });
  };

  const renderUnavailableTimes = () => {
    if (selectedDates.length === 0) return null;

    const date = selectedDates[0];
    const unavailableTimes = currentAvailability[date]?.unavailableTimes || [];

    if (unavailableTimes.length === 0) return null;

    return (
      <View style={styles.unavailableTimesContainer}>
        <Text style={styles.sectionTitle}>Unavailable Times:</Text>
        <ScrollView>
          {unavailableTimes.map((time, index) => (
            <UnavailableTimeSlot
              key={index}
              startTime={time.startTime}
              endTime={time.endTime}
              reason={time.reason || 'No services specified'}
            />
          ))}
        </ScrollView>
      </View>
    );
  };

const renderTimePicker = () => {
  if (Platform.OS === 'web') {
    return (
      <>
        <View style={styles.timePickerContainer}>
          <Text>Start Time:</Text>
          <input
            type="time"
            value={format(startTime, 'HH:mm')}
            onChange={(e) => setStartTime(parse(e.target.value, 'HH:mm', new Date()))}
            style={styles.webTimePicker}
          />
        </View>
        <View style={styles.timePickerContainer}>
          <Text>End Time:</Text>
          <input
            type="time"
            value={format(endTime, 'HH:mm')}
            onChange={(e) => setEndTime(parse(e.target.value, 'HH:mm', new Date()))}
            style={styles.webTimePicker}
          />
        </View>
      </>
    );
  } else if (Platform.OS === 'ios') {
    return (
      <>
        <Text>Start Time:</Text>
        <DateTimePicker
          value={startTime}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={(event, selectedTime) => setStartTime(selectedTime || startTime)}
        />
        <Text>End Time:</Text>
        <DateTimePicker
          value={endTime}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={(event, selectedTime) => setEndTime(selectedTime || endTime)}
        />
      </>
    );
  } else {
    return (
      <>
        <View>
            <Text>Start Time:</Text>
            <TouchableOpacity onPress={() => setShowStartTimePicker(true)}>
                <View>
                <Text>{format(startTime, 'hh:mm a')}</Text>
                </View>
            </TouchableOpacity>
            {showStartTimePicker && (
                <DateTimePicker
                value={startTime}
                mode="time"
                is24Hour={false}
                display="default"
                onChange={(event, selectedTime) => {
                    setShowStartTimePicker(false);
                    setStartTime(selectedTime || startTime);
                }}
                />
            )}
        </View>

        <View>
            <Text>End Time:</Text>
            <TouchableOpacity onPress={() => setShowEndTimePicker(true)}>
                <View>
                <Text>{format(endTime, 'hh:mm a')}</Text>
                </View>
            </TouchableOpacity>
            {showEndTimePicker && (
                <DateTimePicker
                value={endTime}
                mode="time"
                is24Hour={false}
                display="default"
                onChange={(event, selectedTime) => {
                    setShowEndTimePicker(false);
                    setEndTime(selectedTime || endTime);
                }}
                />
            )}
        </View>
      </>
    );
  }
};


  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { width: modalWidth }]}>
          <Text style={styles.modalTitle}>
            {selectedDates.length > 1 ? 'Edit Multiple Days' : 'Edit Availability'}
          </Text>
          <Text>Selected Dates: {selectedDates.join(', ')}</Text>
          {renderUnavailableTimes()}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Service Type(s) *</Text>
            <TouchableOpacity
              style={[
                styles.input,
                styles.customDropdown,
                selectedServices.length === 0 && styles.inputError
              ]}
              onPress={() => setShowServiceDropdown(!showServiceDropdown)}
            >
              <Text style={{
                color: selectedServices.length > 0 ? theme.colors.text : theme.colors.placeHolderText
              }}>
                {selectedServices.length > 0 
                  ? selectedServices.includes(ALL_SERVICES)
                    ? "All Services"
                    : selectedServices.length > 1
                      ? `${selectedServices.length} services selected`
                      : selectedServices[0]
                  : "Select service type(s)"
                }
              </Text>
              <MaterialCommunityIcons 
                name={showServiceDropdown ? "chevron-up" : "chevron-down"} 
                size={24} 
                color={theme.colors.primary} 
              />
            </TouchableOpacity>
            
            {showServiceDropdown && (
              <View style={styles.dropdownContainer}>
                <ScrollView style={styles.dropdownScroll}>
                  {SERVICE_TYPES.map((service) => (
                    <TouchableOpacity
                      key={service}
                      style={styles.dropdownItem}
                      onPress={() => {
                        if (service === ALL_SERVICES) {
                          setSelectedServices(
                            selectedServices.includes(ALL_SERVICES) 
                              ? [] 
                              : [ALL_SERVICES]
                          );
                        } else {
                          setSelectedServices(prev => {
                            // Remove "All Services" if it was selected
                            const withoutAll = prev.filter(s => s !== ALL_SERVICES);
                            
                            if (prev.includes(service)) {
                              return withoutAll.filter(s => s !== service);
                            } else {
                              return [...withoutAll, service];
                            }
                          });
                        }
                      }}
                    >
                      <View style={styles.dropdownItemContent}>
                        <Text style={[
                          styles.dropdownText,
                          selectedServices.includes(service) && styles.selectedOption
                        ]}>
                          {service}
                        </Text>
                        {selectedServices.includes(service) && (
                          <MaterialCommunityIcons 
                            name="check" 
                            size={20} 
                            color={theme.colors.primary} 
                          />
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
          <View style={styles.switchContainer}>
            <Text>All Day</Text>
            <Switch value={isAllDay} onValueChange={setIsAllDay} />
          </View>
          {!isAllDay && renderTimePicker()}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.availabilityButton,
                isAvailable ? styles.unavailableButton : styles.availableButton,
                selectedServices.length === 0 && styles.disabledButton
              ]}
              onPress={() => {
                console.log("Availability button pressed");
                if (selectedServices.length > 0) {
                  handleSave();
                }
              }}
            >
              <Text style={styles.availabilityButtonText}>
                {isAvailable ? 'Mark Unavailable' : 'Mark Available'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 17,
    maxHeight: '80%',
    zIndex: 1,
  },
  modalTitle: {
    fontSize: theme.fontSizes.large,
    fontWeight: 'bold',
    marginBottom: 15,
    zIndex: 1,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginVertical: 10,
    zIndex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  cancelButton: {
    padding: 10,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  availabilityButton: {
    padding: 10,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  unavailableButton: {
    backgroundColor: theme.colors.danger,
  },
  availableButton: {
    backgroundColor: theme.colors.primary,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  timePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginVertical: 10,
    zIndex: 1,
  },
  webTimePicker: {
    padding: 5,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 5,
  },
  unavailableTimesContainer: {
    maxHeight: 150,
    marginVertical: 10,
    width: '100%',
    zIndex: 1,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.medium,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  availabilityButtonText: {
    color: theme.colors.whiteText,
    fontWeight: 'bold',
  },
  inputWrapper: {
    position: 'relative',
    width: '100%',
    marginBottom: 15,
    zIndex: 2,
  },
  
  inputLabel: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.text,
    marginBottom: 5,
    fontWeight: '500',
  },
  
  input: {
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    backgroundColor: theme.colors.inputBackground,
  },
  
  customDropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 40,
  },
  
  dropdownContainer: {
    position: 'absolute',
    top: '95%',
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 5,
    marginTop: 2,
    maxHeight: 160,
    zIndex: 1000,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  
  dropdownScroll: {
    maxHeight: 160,
  },
  
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    height: 40,
  },
  
  dropdownText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.medium,
  },
  
  selectedOption: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  
  inputError: {
    borderColor: theme.colors.danger,
  },
  
  dropdownItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 10,
  },
});

export default AddAvailabilityModal;
