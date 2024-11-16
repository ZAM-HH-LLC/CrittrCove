import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Platform, StatusBar, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';
import Icon from 'react-native-vector-icons/Ionicons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import AddAvailabilityModal from '../components/AddAvailabilityModal';
import DefaultSettingsModal from '../components/DefaultSettingsModal';
import { format, parse } from 'date-fns';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Fake backend request simulation
const fetchAvailabilityData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        availableDates: {
          '2024-10-01': { startTime: '09:00', endTime: '17:00' },
          '2024-10-02': { startTime: '10:00', endTime: '18:00' },
          '2024-10-03': { startTime: '09:00', endTime: '17:00' },
        },
        unavailableDates: {
          '2024-10-04': { startTime: '00:00', endTime: '24:00' },
          '2024-10-05': { startTime: '10:00', endTime: '18:00' },
        },
        bookings: {
          '2024-10-06': [
            { startTime: '14:00', endTime: '16:00', client_name: 'Charlie' },
            { startTime: '18:00', endTime: '20:00', client_name: 'Alfred' }
          ],
          '2024-10-07': [
            { startTime: '10:00', endTime: '12:00', client_name: 'Uhtred' }
          ],
        },
      });
    }, 1000);
  });
};

const AvailabilitySettings = () => {
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDates, setSelectedDates] = useState([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const [defaultAvailability, setDefaultAvailability] = useState('available');
  const [isMultiDaySelection, setIsMultiDaySelection] = useState(false);
  const [currentAvailability, setCurrentAvailability] = useState({});
  const [bookings, setBookings] = useState({});
  const [defaultSettings, setDefaultSettings] = useState({
    Monday: { isAllDay: false, isUnavailable: false, startTime: '09:00', endTime: '17:00', endDate: null },
    Tuesday: { isAllDay: false, isUnavailable: false, startTime: '09:00', endTime: '17:00', endDate: null },
    Wednesday: { isAllDay: false, isUnavailable: false, startTime: '09:00', endTime: '17:00', endDate: null },
    Thursday: { isAllDay: false, isUnavailable: false, startTime: '09:00', endTime: '17:00', endDate: null },
    Friday: { isAllDay: false, isUnavailable: false, startTime: '09:00', endTime: '17:00', endDate: null },
    Saturday: { isAllDay: false, isUnavailable: false, startTime: '09:00', endTime: '17:00', endDate: null },
    Sunday: { isAllDay: false, isUnavailable: false, startTime: '09:00', endTime: '17:00', endDate: null },
  });

  useEffect(() => {
    fetchAvailabilityData().then((data) => {
      updateMarkedDates(data.availableDates, data.unavailableDates, data.bookings);
      
      // Create a combined availability object
      const combinedAvailability = {};
      Object.keys(data.availableDates).forEach(date => {
        combinedAvailability[date] = { 
          isAvailable: true,
          unavailableTimes: [] // Initialize empty array for partially unavailable times
        };
      });
      Object.keys(data.unavailableDates).forEach(date => {
        combinedAvailability[date] = { 
          isAvailable: false,
          unavailableTimes: [{
            startTime: data.unavailableDates[date].startTime,
            endTime: data.unavailableDates[date].endTime,
            reason: ' Personal Time'
          }]
        };
      });
      Object.keys(data.bookings).forEach(date => {
        if (!combinedAvailability[date]) {
          combinedAvailability[date] = { 
            isAvailable: true,
            unavailableTimes: []
          };
        }
        combinedAvailability[date].unavailableTimes = [
          ...combinedAvailability[date].unavailableTimes,
          ...data.bookings[date].map(booking => ({
            startTime: booking.startTime,
            endTime: booking.endTime,
            reason: ` Booked with ${booking.client_name}`,
            clientId: booking.clientId // Assuming each booking has a clientId
          }))
        ];
      });
      setCurrentAvailability(combinedAvailability);
      setBookings(data.bookings);
    });
  }, []);

  const updateMarkedDates = (availableDates, unavailableDates, bookings) => {
    const newMarkedDates = {};

    Object.entries(unavailableDates).forEach(([date, time]) => {
      const isFullDay = time.startTime === '00:00' && time.endTime === '24:00';
      newMarkedDates[date] = {
        customStyles: {
          container: { backgroundColor: isFullDay ? 'lightgrey' : theme.colors.calendarColor },
          text: { color: 'white' }
        }
      };
    });

    Object.entries(availableDates).forEach(([date, time]) => {
      newMarkedDates[date] = {
        customStyles: {
          container: { backgroundColor: 'white' },
          text: { color: 'black' }
        }
      };
    });

    Object.entries(bookings).forEach(([date, bookingList]) => {
      const isFullDay = bookingList.some(booking => 
        booking.startTime === '00:00' && booking.endTime === '24:00'
      );
      newMarkedDates[date] = { 
        marked: true,
        dotColor: theme.colors.primary,
        customStyles: {
          container: { backgroundColor: isFullDay ? theme.colors.primary : theme.colors.calendarColorYellowBrown },
          text: { color: 'white' }
        }
      };
    });

    setMarkedDates(newMarkedDates);
  };

  const onDayPress = (day) => {
    const { dateString } = day;
    if (isMultiDaySelection) {
      if (selectedDates.length === 0 || selectedDates.length === 2) {
        setSelectedDates([dateString]);
      } else if (selectedDates.length === 1) {
        const start = moment(selectedDates[0]);
        const end = moment(dateString);
        const range = [];
        let current = start.clone();

        while (current.isSameOrBefore(end)) {
          range.push(current.format('YYYY-MM-DD'));
          current.add(1, 'days');
        }
        setSelectedDates(range);
        setIsAddModalVisible(true);
      }
    } else {
      setSelectedDates([dateString]);
      setIsAddModalVisible(true);
    }
  };

  const handleAddAvailability = (availabilityData) => {
    console.log('Adding availability:', availabilityData);
    const newMarkedDates = { ...markedDates };
    const newCurrentAvailability = { ...currentAvailability };

    availabilityData.dates.forEach(date => {
      const existingUnavailableTimes = newCurrentAvailability[date]?.unavailableTimes || [];

      if (availabilityData.isAvailable) {
        // If making available, remove the specific time slot if it exists
        const updatedUnavailableTimes = existingUnavailableTimes.filter(slot => 
          slot.startTime !== availabilityData.startTime ||
          slot.endTime !== availabilityData.endTime
        );

        newCurrentAvailability[date] = {
          isAvailable: true,
          unavailableTimes: updatedUnavailableTimes
        };

        // Update marked dates based on whether there are any remaining unavailable times
        if (updatedUnavailableTimes.length === 0) {
          newMarkedDates[date] = {
            customStyles: {
              container: { backgroundColor: 'white' },
              text: { color: 'black' }
            }
          };
        } else {
          newMarkedDates[date] = {
            customStyles: {
              container: { backgroundColor: theme.colors.calendarColor },
              text: { color: 'white' }
            }
          };
        }
      } else {
        // If marking as unavailable
        if (availabilityData.isAllDay) {
          newCurrentAvailability[date] = {
            isAvailable: false,
            unavailableTimes: [{ startTime: '00:00', endTime: '24:00', reason: ' Personal Time' }]
          };
          newMarkedDates[date] = {
            customStyles: {
              container: { backgroundColor: 'lightgrey' },
              text: { color: 'white' }
            }
          };
        } else {
          const newUnavailableTime = {
            startTime: availabilityData.startTime,
            endTime: availabilityData.endTime,
            reason: ' Personal Time'
          };
          newCurrentAvailability[date] = {
            isAvailable: true,
            unavailableTimes: [...existingUnavailableTimes, newUnavailableTime]
          };
          newMarkedDates[date] = {
            customStyles: {
              container: { backgroundColor: theme.colors.calendarColor },
              text: { color: 'white' }
            }
          };
        }
      }
    });

    setMarkedDates(newMarkedDates);
    setCurrentAvailability(newCurrentAvailability);
    setIsAddModalVisible(false);
    setSelectedDates([]);
  };

  const handleUpdateDefaultSettings = (newSettings) => {
    console.log('Updating default settings:', newSettings);
    setDefaultSettings(newSettings);
    applyDefaultSettingsToCalendar(newSettings);
    setIsSettingsModalVisible(false);
  };

  const applyDefaultSettingsToCalendar = (settings) => {
    const newMarkedDates = { ...markedDates };
    const newCurrentAvailability = { ...currentAvailability };
    const today = new Date();
    const oneYearFromNow = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());

    Object.entries(settings).forEach(([day, daySettings]) => {
      let currentDate = new Date(today);
      while (currentDate <= (daySettings.endDate ? new Date(daySettings.endDate) : oneYearFromNow)) {
        if (currentDate.getDay() === daysOfWeek.indexOf(day)) {
          const dateString = currentDate.toISOString().split('T')[0];
          if (daySettings.isUnavailable) {
            if (daySettings.isAllDay) {
              newMarkedDates[dateString] = {
                customStyles: {
                  container: { backgroundColor: 'lightgrey' },
                  text: { color: 'white' }
                }
              };
              newCurrentAvailability[dateString] = {
                isAvailable: false,
                unavailableTimes: [{ startTime: '00:00', endTime: '24:00', reason: 'Default Setting' }]
              };
            } else {
              newMarkedDates[dateString] = {
                customStyles: {
                  container: { backgroundColor: theme.colors.calendarColor },
                  text: { color: 'white' }
                }
              };
              newCurrentAvailability[dateString] = {
                isAvailable: true,
                unavailableTimes: [{
                  startTime: daySettings.startTime,
                  endTime: daySettings.endTime,
                  reason: 'Default Setting'
                }]
              };
            }
          } else {
            newMarkedDates[dateString] = {
              customStyles: {
                container: { backgroundColor: 'white' },
                text: { color: 'black' }
              }
            };
            newCurrentAvailability[dateString] = {
              isAvailable: true,
              unavailableTimes: []
            };
          }
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    setMarkedDates(newMarkedDates);
    setCurrentAvailability(newCurrentAvailability);
  };

  const handleClientPress = (clientId) => {
    // Navigate to the client history page
    // You'll need to implement this navigation logic
    console.log(`Navigating to client history for client ID: ${clientId}`);
  };

  const IconComponent = Platform.OS === 'web' ? MaterialCommunityIcons : Icon;

  const renderArrow = (direction) => {
    let iconName;
    if (Platform.OS === 'web') {
      iconName = direction === 'left' ? 'chevron-left' : 'chevron-right';
    } else {
      iconName = direction === 'left' ? 'chevron-back' : 'chevron-forward';
    }
    return (
      <IconComponent 
        name={iconName} 
        size={24} 
        color={theme.colors.primary}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Availability</Text>
        <TouchableOpacity 
          style={styles.defaultSettingsButton} 
          onPress={() => setIsSettingsModalVisible(true)}
        >
          <Text style={styles.defaultSettingsText}>Default Settings</Text>
          <IconComponent 
            name={Platform.OS === 'web' ? 'cog' : 'settings-outline'} 
            size={24} 
            color={theme.colors.text} 
          />
        </TouchableOpacity>
      </View>
      <View style={styles.selectionToggle}>
        <TouchableOpacity
          style={[styles.toggleButton, !isMultiDaySelection && styles.activeToggle]}
          onPress={() => setIsMultiDaySelection(false)}
        >
          <Text style={styles.toggleText}>Select One Day</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, isMultiDaySelection && styles.activeToggle]}
          onPress={() => setIsMultiDaySelection(true)}
        >
          <Text style={styles.toggleText}>Select Multiple Days</Text>
        </TouchableOpacity>
      </View>

      {/* Calendar Component */}
      <Calendar
        markedDates={{
          ...markedDates,
          ...selectedDates.reduce((acc, date) => ({
            ...acc,
            [date]: {
              ...markedDates[date],
              selected: true,
              customStyles: {
                ...markedDates[date]?.customStyles,
                container: { backgroundColor: theme.colors.primary },
                text: { color: 'white' }
              }
            }
          }), {})
        }}
        onDayPress={onDayPress}
        markingType={'custom'}
        renderArrow={renderArrow}
        theme={{
          arrowColor: theme.colors.primary,
        }}
      />

      {/* Color Code Key */}
      <View style={styles.colorKeyContainer}>
        <Text style={styles.colorKeyTitle}>Color Code Key:</Text>
        <View style={styles.colorKeyItem}>
          <View style={[styles.colorBox, { backgroundColor: 'lightgrey' }]} />
          <Text style={styles.colorKeyText}>Unavailable All Day</Text>
        </View>
        <View style={styles.colorKeyItem}>
          <View style={[styles.colorBox, { backgroundColor: theme.colors.calendarColor }]} />
          <Text style={styles.colorKeyText}>Partially Unavailable</Text>
        </View>
        <View style={styles.colorKeyItem}>
          <View style={[styles.colorBox, { backgroundColor: theme.colors.calendarColorYellowBrown }]} />
          <Text style={styles.colorKeyText}>Booked Dates</Text>
        </View>
        <View style={styles.colorKeyItem}>
          <View style={[styles.colorBox, { backgroundColor: theme.colors.primary }]} />
          <Text style={styles.colorKeyText}>Current Selection</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => setIsAddModalVisible(true)}
      >
        <IconComponent name={Platform.OS === 'web' ? 'plus' : 'add'} size={24} color="white" />
      </TouchableOpacity>
      <AddAvailabilityModal
        isVisible={isAddModalVisible}
        onClose={() => {
          setIsAddModalVisible(false);
          setSelectedDates([]);
        }}
        onSave={handleAddAvailability}
        selectedDates={selectedDates}
        currentAvailability={currentAvailability}
        bookings={bookings}
        onClientPress={handleClientPress}
      />
      <DefaultSettingsModal
        isVisible={isSettingsModalVisible}
        onClose={() => setIsSettingsModalVisible(false)}
        onSave={handleUpdateDefaultSettings}
        defaultSettings={defaultSettings}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: theme.fontSizes.large,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  selectionToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  toggleButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  activeToggle: {
    backgroundColor: theme.colors.primary,
  },
  toggleText: {
    color: theme.colors.text,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  defaultSettingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  defaultSettingsText: {
    marginRight: 8,
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text,
  },
  colorKeyContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 5,
    elevation: 2,
  },
  colorKeyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  colorKeyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  colorBox: {
    width: 20,
    height: 20,
    borderRadius: 3,
    marginRight: 10,
  },
  colorKeyText: {
    fontSize: 14,
    color: 'black',
  },
});

export default AvailabilitySettings;
