import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Switch, ScrollView, Platform, Dimensions } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme } from '../styles/theme';
import DatePicker from './DatePicker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');
const modalWidth = Platform.OS === 'web' ? width * 0.4 : width * 0.9;

const ALL_DAYS = "All Days";
const DAYS_OF_WEEK = [
  ALL_DAYS,
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

const DefaultSettingsModal = ({ isVisible, onClose, onSave, defaultSettings }) => {
  const [selectedDays, setSelectedDays] = useState([]);
  const [settings, setSettings] = useState(defaultSettings || {
    Monday: { isAllDay: false, startTime: '09:00', endTime: '17:00', endDate: null },
    Tuesday: { isAllDay: false, startTime: '09:00', endTime: '17:00', endDate: null },
    Wednesday: { isAllDay: false, startTime: '09:00', endTime: '17:00', endDate: null },
    Thursday: { isAllDay: false, startTime: '09:00', endTime: '17:00', endDate: null },
    Friday: { isAllDay: false, startTime: '09:00', endTime: '17:00', endDate: null },
    Saturday: { isAllDay: false, startTime: '09:00', endTime: '17:00', endDate: null },
    Sunday: { isAllDay: false, startTime: '09:00', endTime: '17:00', endDate: null },
  });

  const [showTimePicker, setShowTimePicker] = useState({ visible: false, type: '', value: '' });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isCurrentlyUnavailable, setIsCurrentlyUnavailable] = useState(false);
  const [showDayDropdown, setShowDayDropdown] = useState(false);

  const handleSave = () => {
    onSave({
      ...settings,
      [selectedDays[0]]: {
        ...settings[selectedDays[0]],
        isUnavailable: !isCurrentlyUnavailable
      }
    });
  };

  const updateDaySettings = (day, newSettings) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [day]: { ...prevSettings[day], ...newSettings }
    }));
  };

  const handleDaySelection = (day) => {
    setSelectedDays(current => {
      if (day === ALL_DAYS) {
        return current.includes(ALL_DAYS) 
          ? [] 
          : DAYS_OF_WEEK.filter(d => d !== ALL_DAYS);
      }
      
      const withoutAll = current.filter(d => d !== ALL_DAYS);
      if (withoutAll.includes(day)) {
        return withoutAll.filter(d => d !== day);
      } else {
        if (withoutAll.length + 1 === DAYS_OF_WEEK.length - 1) {
          return DAYS_OF_WEEK.filter(d => d !== ALL_DAYS);
        } else {
          return [...withoutAll, day];
        }
      }
    });
  };

  const handleAvailabilityChange = () => {
    console.log("Selected days:", selectedDays);
    if (selectedDays.length === 0) return;

    const daysToUpdate = selectedDays.includes(ALL_DAYS) 
      ? DAYS_OF_WEEK.filter(day => day !== ALL_DAYS)
      : selectedDays;
    
    console.log("Days to update:", daysToUpdate);
    console.log("Current settings:", settings);
    console.log("Is currently unavailable:", isCurrentlyUnavailable);

    const newSettings = { ...settings };
    daysToUpdate.forEach(day => {
      console.log(`Updating ${day}`);
      newSettings[day] = {
        ...settings[day],
        isUnavailable: !isCurrentlyUnavailable,
        startTime: settings[selectedDays[0]].startTime,
        endTime: settings[selectedDays[0]].endTime,
        isAllDay: settings[selectedDays[0]].isAllDay,
        endDate: settings[selectedDays[0]].endDate
      };
    });
    
    console.log("New settings:", newSettings);
    setSettings(newSettings);
    onSave(newSettings);
    setIsCurrentlyUnavailable(!isCurrentlyUnavailable);
  };

  const renderTimePicker = (type, value, onChange) => {
    if (Platform.OS === 'web') {
      return (
        <input
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={styles.webTimePicker}
        />
      );
    } else if (Platform.OS === 'ios') {
        return (
            <DateTimePicker
          value={new Date(`2000-01-01T${value}`)}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={(event, selectedTime) => {
            if (selectedTime) {
              onChange(selectedTime.toTimeString().slice(0, 5));
            }
          }}
        />
        )
    } else {
      return (
        <>
          <TouchableOpacity onPress={() => setShowTimePicker({ visible: true, type, value })}>
            <Text>{value}</Text>
          </TouchableOpacity>
          {Platform.OS === 'android' && showTimePicker.visible && showTimePicker.type === type && (
            <DateTimePicker
              value={new Date(`2000-01-01T${showTimePicker.value}`)}
              mode="time"
              is24Hour={false}
              display="default"
              onChange={(event, selectedTime) => {
                setShowTimePicker({ visible: false, type: '', value: '' });
                if (selectedTime) {
                  onChange(selectedTime.toTimeString().slice(0, 5));
                }
              }}
            />
          )}
        </>
      );
    }
  };

  const renderEndDatePicker = () => {
    const daySettings = settings[selectedDays[0]];
    
    return (
      <DatePicker
        value={daySettings.endDate}
        onChange={(date) => updateDaySettings(selectedDays[0], { endDate: date })}
        placeholder="Select End Date"
      />
    );
  };

  const renderDaySettings = () => {
    if (selectedDays.length === 0) return null;
    
    const daySettings = settings[selectedDays[0]];
    
    return (
      <View style={styles.daySettingsContainer}>
        <View style={styles.settingRow}>
          <Text>All Day:</Text>
          <Switch
            value={daySettings.isAllDay}
            onValueChange={(value) => {
              const newSettings = { ...settings };
              selectedDays.forEach(day => {
                newSettings[day] = {
                  ...newSettings[day],
                  isAllDay: value
                };
              });
              setSettings(newSettings);
            }}
          />
        </View>
        {!daySettings.isAllDay && (
          <>
            <View style={styles.settingRow}>
              <Text>Start Time:</Text>
              {renderTimePicker(
                'startTime',
                daySettings.startTime,
                (newTime) => {
                  const newSettings = { ...settings };
                  selectedDays.forEach(day => {
                    newSettings[day] = {
                      ...newSettings[day],
                      startTime: newTime
                    };
                  });
                  setSettings(newSettings);
                }
              )}
            </View>
            <View style={styles.settingRow}>
              <Text>End Time:</Text>
              {renderTimePicker(
                'endTime',
                daySettings.endTime,
                (newTime) => {
                  const newSettings = { ...settings };
                  selectedDays.forEach(day => {
                    newSettings[day] = {
                      ...newSettings[day],
                      endTime: newTime
                    };
                  });
                  setSettings(newSettings);
                }
              )}
            </View>
          </>
        )}
        <View style={styles.settingRow}>
          <Text>End Date:</Text>
          <DatePicker
            value={daySettings.endDate}
            onChange={(date) => {
              const newSettings = { ...settings };
              selectedDays.forEach(day => {
                newSettings[day] = {
                  ...newSettings[day],
                  endDate: date
                };
              });
              setSettings(newSettings);
            }}
            placeholder="Select End Date"
          />
        </View>
      </View>
    );
  };

  const checkCurrentAvailability = (days, settings) => {
    if (!days || days.length === 0) return false;
    
    return days.some(day => settings[day]?.isUnavailable);
  };

  useEffect(() => {
    if (selectedDays.length > 0) {
      const isUnavailable = checkCurrentAvailability(selectedDays, settings);
      setIsCurrentlyUnavailable(isUnavailable);
    } else {
      setIsCurrentlyUnavailable(false);
    }
  }, [selectedDays, settings]);

  const renderDaySelector = () => (
    <View style={styles.inputWrapper}>
      <Text style={styles.inputLabel}>Day(s) *</Text>
      <TouchableOpacity
        style={[
          styles.input,
          styles.customDropdown,
          selectedDays.length === 0 && styles.inputError
        ]}
        onPress={() => setShowDayDropdown(!showDayDropdown)}
      >
        <Text style={{
          color: selectedDays.length > 0 ? theme.colors.text : theme.colors.placeHolderText
        }}>
          {selectedDays.length === 0 
            ? 'Select Days' 
            : selectedDays.includes(ALL_DAYS)
              ? 'All Days'
              : selectedDays.length > 2
                ? `${selectedDays.length} Days Selected`
                : selectedDays.join(', ')}
        </Text>
        <MaterialCommunityIcons 
          name={showDayDropdown ? "chevron-up" : "chevron-down"} 
          size={24} 
          color={theme.colors.text} 
        />
      </TouchableOpacity>
      
      {showDayDropdown && (
        <View style={styles.dropdownContainer}>
          <ScrollView style={styles.dropdownScroll}>
            {DAYS_OF_WEEK.map((day) => (
              <TouchableOpacity
                key={day}
                style={styles.dropdownItem}
                onPress={() => handleDaySelection(day)}
              >
                <View style={styles.dropdownItemContent}>
                  <Text style={[
                    styles.dropdownText,
                    selectedDays.includes(day) && styles.selectedOption
                  ]}>
                    {day}
                  </Text>
                  {selectedDays.includes(day) && (
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
  );

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { width: modalWidth }]}>
          <Text style={styles.modalTitle}>Default Settings</Text>
          {renderDaySelector()}
          {renderDaySettings()}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.availabilityButton,
                isCurrentlyUnavailable ? styles.availableButton : styles.unavailableButton,
                selectedDays.length === 0 && styles.disabledButton
              ]}
              onPress={handleAvailabilityChange}
              disabled={selectedDays.length === 0}
            >
              <Text style={styles.availabilityButtonText}>
                {isCurrentlyUnavailable ? 'Mark Available' : 'Mark Unavailable'}
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
    borderRadius: 17,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: theme.fontSizes.large,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  settingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.medium,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  dayContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginVertical: 5,
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
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  tab: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  selectedTab: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    color: theme.colors.text,
  },
  selectedTabText: {
    color: theme.colors.primary,
  },
  daySettingsContainer: {
    marginBottom: 15,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  webTimePicker: {
    padding: 5,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 5,
  },
  webDatePicker: {
    padding: 5,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 5,
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
    marginBottom: 5,
    color: theme.colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 5,
    padding: 10,
    backgroundColor: theme.colors.surface,
  },
  customDropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 5,
    maxHeight: 200,
    zIndex: 1000,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  dropdownItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    color: theme.colors.text,
  },
  selectedOption: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  inputError: {
    borderColor: theme.colors.danger,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default DefaultSettingsModal;
