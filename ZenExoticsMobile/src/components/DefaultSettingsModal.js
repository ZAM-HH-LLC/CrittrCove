import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Switch, ScrollView, Platform, Dimensions } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme } from '../styles/theme';

const { width } = Dimensions.get('window');
const modalWidth = Platform.OS === 'web' ? width * 0.4 : width * 0.9;

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DefaultSettingsModal = ({ isVisible, onClose, onSave, defaultSettings }) => {
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [settings, setSettings] = useState(defaultSettings || {
    Monday: { isAllDay: false, isUnavailable: false, startTime: '09:00', endTime: '17:00', endDate: null },
    Tuesday: { isAllDay: false, isUnavailable: false, startTime: '09:00', endTime: '17:00', endDate: null },
    Wednesday: { isAllDay: false, isUnavailable: false, startTime: '09:00', endTime: '17:00', endDate: null },
    Thursday: { isAllDay: false, isUnavailable: false, startTime: '09:00', endTime: '17:00', endDate: null },
    Friday: { isAllDay: false, isUnavailable: false, startTime: '09:00', endTime: '17:00', endDate: null },
    Saturday: { isAllDay: false, isUnavailable: false, startTime: '09:00', endTime: '17:00', endDate: null },
    Sunday: { isAllDay: false, isUnavailable: false, startTime: '09:00', endTime: '17:00', endDate: null },
  });

  const [showTimePicker, setShowTimePicker] = useState({ visible: false, type: '', value: '' });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSave = () => {
    onSave(settings);
  };

  const updateDaySettings = (day, newSettings) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [day]: { ...prevSettings[day], ...newSettings }
    }));
  };

  const renderDayTabs = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
      {daysOfWeek.map(day => (
        <TouchableOpacity
          key={day}
          style={[styles.tab, selectedDay === day && styles.selectedTab]}
          onPress={() => setSelectedDay(day)}
        >
          <Text style={[styles.tabText, selectedDay === day && styles.selectedTabText]}>{day}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

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
    const daySettings = settings[selectedDay];
    const endDate = daySettings.endDate ? new Date(daySettings.endDate) : new Date();

    if (Platform.OS === 'web') {
      return (
        <input
          type="date"
          value={daySettings.endDate || ''}
          onChange={(e) => updateDaySettings(selectedDay, { endDate: e.target.value })}
          style={styles.webDatePicker}
        />
      );
    } else if (Platform.OS === 'ios') {
        return (
            <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            if (selectedDate) {
              updateDaySettings(selectedDay, { endDate: selectedDate.toISOString().split('T')[0] });
            }
          }}
        />
        )
     } else {
      return (
        <>
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <Text>{daySettings.endDate || 'Select Date'}</Text>
          </TouchableOpacity>
          {Platform.OS === 'android' && showDatePicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  updateDaySettings(selectedDay, { endDate: selectedDate.toISOString().split('T')[0] });
                }
              }}
            />
          )}
        </>
      );
    }
  };

  const renderDaySettings = () => {
    const daySettings = settings[selectedDay];
    return (
      <View style={styles.daySettingsContainer}>
        <View style={styles.settingRow}>
          <Text>All Day:</Text>
          <Switch
            value={daySettings.isAllDay}
            onValueChange={(value) => updateDaySettings(selectedDay, { isAllDay: value })}
          />
        </View>
        <View style={styles.settingRow}>
          <Text>Mark as Unavailable:</Text>
          <Switch
            value={daySettings.isUnavailable}
            onValueChange={(value) => updateDaySettings(selectedDay, { isUnavailable: value })}
          />
        </View>
        {!daySettings.isAllDay && (
          <>
            <View style={styles.settingRow}>
              <Text>Start Time:</Text>
              {renderTimePicker(
                'startTime',
                daySettings.startTime,
                (newTime) => updateDaySettings(selectedDay, { startTime: newTime })
              )}
            </View>
            <View style={styles.settingRow}>
              <Text>End Time:</Text>
              {renderTimePicker(
                'endTime',
                daySettings.endTime,
                (newTime) => updateDaySettings(selectedDay, { endTime: newTime })
              )}
            </View>
          </>
        )}
        <View style={styles.settingRow}>
          <Text>End Date:</Text>
          {renderEndDatePicker()}
        </View>
      </View>
    );
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
          <Text style={styles.modalTitle}>Default Settings</Text>
          {renderDayTabs()}
          {renderDaySettings()}
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
});

export default DefaultSettingsModal;
