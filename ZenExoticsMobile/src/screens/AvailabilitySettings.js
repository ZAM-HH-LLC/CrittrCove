import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Platform, StatusBar, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';
import Icon from 'react-native-vector-icons/Ionicons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import AddAvailabilityModal from '../components/AddAvailabilityModal';
import DefaultSettingsModal from '../components/DefaultSettingsModal';
import { format, parse } from 'date-fns';
import { SERVICE_TYPES, fetchAvailabilityData } from '../data/mockData';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const AvailabilitySettings = () => {
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDates, setSelectedDates] = useState([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const [defaultAvailability, setDefaultAvailability] = useState('available');
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAvailabilityData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchAvailabilityData();
        updateMarkedDates(data.availableDates, data.unavailableDates, data.bookings);
        
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
      } catch (err) {
        setError('Failed to load availability data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAvailabilityData();
  }, []);

  const updateMarkedDates = (availableDates, unavailableDates, bookings) => {
    const newMarkedDates = {};

    // Helper function to check if all services are selected for a time slot
    const hasAllServices = (reason) => {
      if (!reason) return false;
      const services = reason.replace('Unavailable for: ', '').split(', ');
      // Subtract 1 from SERVICE_TYPES.length to account for "All Services" option
      return services.length === (SERVICE_TYPES.length - 1);
    };

    Object.entries(unavailableDates).forEach(([date, time]) => {
      const isFullDay = time.startTime === '00:00' && time.endTime === '24:00';
      const allServicesSelected = hasAllServices(time.reason);
      
      // Only mark as fully unavailable if it's all day AND all services are selected
      if (isFullDay && allServicesSelected) {
        newMarkedDates[date] = {
          customStyles: {
            container: { backgroundColor: 'lightgrey' },
            text: { color: 'white' }
          }
        };
      } else {
        // Otherwise mark as partially unavailable
        newMarkedDates[date] = {
          customStyles: {
            container: { backgroundColor: theme.colors.calendarColor },
            text: { color: 'white' }
          }
        };
      }
    });

    Object.entries(availableDates).forEach(([date, time]) => {
      if (!newMarkedDates[date]) {
        newMarkedDates[date] = {
          customStyles: {
            container: { backgroundColor: 'white' },
            text: { color: 'black' }
          }
        };
      }
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
  };

  const handleAddAvailability = (availabilityData) => {
    const newMarkedDates = { ...markedDates };
    const newCurrentAvailability = { ...currentAvailability };

    availabilityData.dates.forEach(date => {
      if (availabilityData.isAvailable) {
        // If marking as available, remove the specific time slot
        if (!availabilityData.isAllDay && availabilityData.timeToRemove) {
          const currentTimes = newCurrentAvailability[date]?.unavailableTimes || [];
          newCurrentAvailability[date] = {
            isAvailable: true,
            unavailableTimes: currentTimes.filter(time => 
              time.startTime !== availabilityData.timeToRemove.startTime || 
              time.endTime !== availabilityData.timeToRemove.endTime
            )
          };

          // Update calendar marker based on remaining unavailable times
          if (newCurrentAvailability[date].unavailableTimes.length === 0) {
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
          // Handle all-day available
          newCurrentAvailability[date] = {
            isAvailable: true,
            unavailableTimes: []
          };
          newMarkedDates[date] = {
            customStyles: {
              container: { backgroundColor: 'white' },
              text: { color: 'black' }
            }
          };
        }
      } else {
        // Handle marking as unavailable
        if (!availabilityData.isAllDay) {
          const newUnavailableTime = {
            startTime: availabilityData.startTime,
            endTime: availabilityData.endTime,
            reason: availabilityData.reason
          };

          newCurrentAvailability[date] = {
            isAvailable: true,
            unavailableTimes: [
              ...(newCurrentAvailability[date]?.unavailableTimes || []),
              newUnavailableTime
            ]
          };

          newMarkedDates[date] = {
            customStyles: {
              container: { backgroundColor: theme.colors.calendarColor },
              text: { color: 'white' }
            }
          };
        } else {
          // Handle all-day unavailable
          const selectedServicesCount = availabilityData.serviceTypes?.length || 0;
          const isAllServicesSelected = selectedServicesCount === (SERVICE_TYPES.length - 1); // -1 for "All Services" option

          newCurrentAvailability[date] = {
            isAvailable: false,
            unavailableTimes: [{
              startTime: '00:00',
              endTime: '24:00',
              reason: availabilityData.reason
            }]
          };

          // Only mark as fully unavailable if ALL services are selected
          newMarkedDates[date] = {
            customStyles: {
              container: { 
                backgroundColor: isAllServicesSelected ? 'lightgrey' : theme.colors.calendarColor 
              },
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

    const daysMapping = {
      'Sunday': 0,
      'Monday': 1,
      'Tuesday': 2,
      'Wednesday': 3,
      'Thursday': 4,
      'Friday': 5,
      'Saturday': 6
    };

    Object.entries(settings).forEach(([day, daySettings]) => {
      let currentDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
      const targetDayNumber = daysMapping[day];
      
      while (currentDate <= (daySettings.endDate ? new Date(daySettings.endDate) : oneYearFromNow)) {
        const currentDayNumber = currentDate.getUTCDay();
        const dateString = currentDate.toISOString().split('T')[0];
        
        if (currentDayNumber === targetDayNumber) {
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
            // Reset to available
            delete newMarkedDates[dateString];
            delete newCurrentAvailability[dateString];
          }
        }
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
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

  const handleDefaultSettingsSave = (newSettings) => {
    console.log("Before updating defaultSettings:", defaultSettings);
    console.log("New settings to be applied:", newSettings);
    setDefaultSettings(newSettings);
    
    // Add a setTimeout to check the state after update
    setTimeout(() => {
      console.log("After updating defaultSettings:", defaultSettings);
    }, 0);
    
    // Call applyDefaultSettingsToCalendar to update the calendar view
    applyDefaultSettingsToCalendar(newSettings);
    setIsSettingsModalVisible(false);
  };

  const handleSaveAvailability = (data) => {
    if (data.isRemoval) {
      // Just update the availability directly
      setCurrentAvailability(prev => ({
        ...prev,
        ...data.updatedAvailability
      }));
      return;
    }

    // ... rest of your existing save logic ...
  };

  const handleRemoveTimeSlot = (date, timeSlot, updatedAvailability, selectedDates) => {
    if (updatedAvailability && selectedDates) {
      // Handle multiple dates
      setCurrentAvailability(prev => ({
        ...prev,
        ...updatedAvailability
      }));

      // Update marked dates for multiple dates
      const newMarkedDates = { ...markedDates };
      selectedDates.forEach(date => {
        if (updatedAvailability[date]?.unavailableTimes.length === 0) {
          newMarkedDates[date] = {
            customStyles: {
              container: { backgroundColor: 'white' },
              text: { color: 'black' }
            }
          };
        }
      });
      setMarkedDates(newMarkedDates);
    } else {
      // Handle single date (existing functionality)
      setCurrentAvailability(prev => {
        const currentDateAvailability = prev[date];
        if (!currentDateAvailability) return prev;

        const filteredTimes = currentDateAvailability.unavailableTimes.filter(
          time => !(time.startTime === timeSlot.startTime && time.endTime === timeSlot.endTime)
        );

        // Update marked dates for single date
        const newMarkedDates = { ...markedDates };
        if (filteredTimes.length === 0) {
          newMarkedDates[date] = {
            customStyles: {
              container: { backgroundColor: 'white' },
              text: { color: 'black' }
            }
          };
          setMarkedDates(newMarkedDates);
        }

        return {
          ...prev,
          [date]: {
            ...currentDateAvailability,
            unavailableTimes: filteredTimes
          }
        };
      });
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading availability...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              loadAvailabilityData();
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
        onRemoveTimeSlot={handleRemoveTimeSlot}
      />
      <DefaultSettingsModal
        isVisible={isSettingsModalVisible}
        onClose={() => setIsSettingsModalVisible(false)}
        onSave={handleDefaultSettingsSave}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: theme.colors.whiteText,
    fontSize: theme.fontSizes.medium,
  },
});

export default AvailabilitySettings;
