import React, { useState } from 'react';
import { View, StyleSheet, Modal, ScrollView } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { theme } from '../styles/theme';
import DatePicker from './DatePicker';
import TimePicker from './TimePicker';

const RequestBookingModal = ({ visible, onClose, onSubmit, services = [], pets = [] }) => {
  const [selectedService, setSelectedService] = useState('');
  const [selectedPets, setSelectedPets] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [startTime, setStartTime] = useState(() => {
    const date = new Date();
    date.setHours(9, 0, 0);
    return date;
  });
  const [endTime, setEndTime] = useState(() => {
    const date = new Date();
    date.setHours(17, 0, 0);
    return date;
  });

  const resetForm = () => {
    setSelectedService('');
    setSelectedPets([]);
    setStartDate(new Date());
    setEndDate(new Date());
    const defaultStartTime = new Date();
    defaultStartTime.setHours(9, 0, 0);
    const defaultEndTime = new Date();
    defaultEndTime.setHours(17, 0, 0);
    setStartTime(defaultStartTime);
    setEndTime(defaultEndTime);
  };

  const formatTimeForSubmission = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const handleSubmit = () => {
    onSubmit({
      serviceType: selectedService,
      pets: selectedPets,
      startDate,
      endDate,
      startTime: formatTimeForSubmission(startTime),
      endTime: formatTimeForSubmission(endTime)
    });
    resetForm();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      onRequestClose={handleClose}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Request Booking</Text>
          
          <ScrollView style={styles.scrollView}>
            {/* Service Selection */}
            <Text style={styles.label}>Select Service</Text>
            <View style={styles.serviceOptions}>
              {services.map((service) => (
                <Button
                  key={service}
                  mode={selectedService === service ? "contained" : "outlined"}
                  onPress={() => setSelectedService(service)}
                  style={styles.serviceButton}
                >
                  {service}
                </Button>
              ))}
            </View>

            {/* Pet Selection */}
            <Text style={styles.label}>Select Pets</Text>
            <View style={styles.petOptions}>
              {pets.map((pet) => (
                <Button
                  key={pet.id}
                  mode={selectedPets.includes(pet.id) ? "contained" : "outlined"}
                  onPress={() => {
                    if (selectedPets.includes(pet.id)) {
                      setSelectedPets(selectedPets.filter(id => id !== pet.id));
                    } else {
                      setSelectedPets([...selectedPets, pet.id]);
                    }
                  }}
                  style={styles.petButton}
                >
                  {pet.name}
                </Button>
              ))}
            </View>

            {/* Date Selection */}
            <Text style={styles.label}>Select Dates</Text>
            <View style={styles.dateContainer}>
              <DatePicker
                label="Start Date"
                date={startDate}
                onDateChange={setStartDate}
              />
              <DatePicker
                label="End Date"
                date={endDate}
                onDateChange={setEndDate}
                minimumDate={startDate}
              />
            </View>

            {/* Time Selection */}
            <Text style={styles.label}>Select Times</Text>
            <View style={styles.timeContainer}>
              <View style={styles.timePickerWrapper}>
                <TimePicker
                  label="Start Time"
                  value={startTime}
                  onChange={(newTime) => {
                    if (newTime instanceof Date) {
                      setStartTime(newTime);
                    }
                  }}
                  mode="time"
                />
              </View>
              <View style={styles.timePickerWrapper}>
                <TimePicker
                  label="End Time"
                  value={endTime}
                  onChange={(newTime) => {
                    if (newTime instanceof Date) {
                      setEndTime(newTime);
                    }
                  }}
                  mode="time"
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <Button mode="outlined" onPress={handleClose} style={styles.button}>
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={handleSubmit}
              style={styles.button}
              disabled={!selectedService || selectedPets.length === 0}
            >
              Submit
            </Button>
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
    borderRadius: 8,
    padding: 20,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  scrollView: {
    maxHeight: '70%',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 15,
    marginBottom: 10,
  },
  serviceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  serviceButton: {
    marginBottom: 10,
  },
  petOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  petButton: {
    marginBottom: 10,
  },
  dateContainer: {
    gap: 10,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  button: {
    flex: 1,
  },
  timePickerWrapper: {
    flex: 1,
  },
});

export default RequestBookingModal; 