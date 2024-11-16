import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Switch, Platform, Dimensions, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme } from '../styles/theme';
import UnavailableTimeSlot from './UnavailableTimeSlot';
import { format, parse } from 'date-fns';

const { width } = Dimensions.get('window');
const modalWidth = Platform.OS === 'web' ? width * 0.4 : width * 0.9;

const AddAvailabilityModal = ({ isVisible, onClose, onSave, selectedDates, currentAvailability, bookings, onClientPress }) => {
  const [isAllDay, setIsAllDay] = useState(false);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [markAsUnavailable, setMarkAsUnavailable] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  useEffect(() => {
    if (selectedDates.length > 0) {
      const allUnavailableOrPartial = selectedDates.every(date => 
        currentAvailability[date]?.isAvailable === false || 
        currentAvailability[date]?.isAvailable === undefined
      );
      setMarkAsUnavailable(!allUnavailableOrPartial);
    }
  }, [selectedDates, currentAvailability]);

  const handleSave = () => {
    onSave({
      dates: selectedDates,
      isAllDay,
      startTime: isAllDay ? null : format(startTime, 'HH:mm'),
      endTime: isAllDay ? null : format(endTime, 'HH:mm'),
      isAvailable: !markAsUnavailable,
    });
  };

  const renderUnavailableTimes = () => {
    if (selectedDates.length !== 1) return null;

    const date = selectedDates[0];
    const dateAvailability = currentAvailability[date];
    
    // Don't show for completely unavailable days
    if (dateAvailability?.isAvailable === false) return null;

    const dateBookings = bookings[date] || [];
    const unavailableTimes = dateAvailability?.unavailableTimes || [];

    // Only show if there are unavailable times or bookings
    if (unavailableTimes.length === 0 && dateBookings.length === 0) return null;

    return (
      <ScrollView style={styles.unavailableTimesContainer}>
        <Text style={styles.sectionTitle}>Unavailable Times:</Text>
        {dateBookings.length > 0 ? (
          dateBookings.map((booking, index) => (
            <UnavailableTimeSlot 
              key={`booking-${index}`}
              startTime={booking.startTime}
              endTime={booking.endTime}
              reason={`Booked: ${booking.client_name}`}
              onPress={() => onClientPress(booking.clientId)}
            />
          ))
        ) : (
          unavailableTimes.map((time, index) => (
            <UnavailableTimeSlot 
              key={`unavailable-${index}`}
              startTime={time.startTime}
              endTime={time.endTime}
              reason="Personal Time"
            />
          ))
        )}
      </ScrollView>
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
          <View style={styles.switchContainer}>
            <Text>All Day</Text>
            <Switch value={isAllDay} onValueChange={setIsAllDay} />
          </View>
          <View style={styles.switchContainer}>
            <Text>Mark as Unavailable</Text>
            <Switch value={markAsUnavailable} onValueChange={setMarkAsUnavailable} />
          </View>
          {!isAllDay && renderTimePicker()}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
              <Text style={styles.buttonText}>Save</Text>
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
  },
  modalTitle: {
    fontSize: theme.fontSizes.large,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginVertical: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
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
  },
  sectionTitle: {
    fontSize: theme.fontSizes.medium,
    fontWeight: 'bold',
    marginBottom: 5,
  },
});

export default AddAvailabilityModal;
