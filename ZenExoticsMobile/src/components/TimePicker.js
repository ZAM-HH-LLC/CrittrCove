import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme } from '../styles/theme';

const TimePicker = ({ label, value, onChange }) => {
  const [showPicker, setShowPicker] = React.useState(false);

  const handleChange = (event, selectedDate) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const showTimepicker = () => {
    setShowPicker(true);
  };

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text>{label}</Text>
        <input
          type="time"
          value={value.toTimeString().slice(0, 5)}
          onChange={(e) => onChange(new Date(`2000-01-01T${e.target.value}`))}
          style={styles.webTimePicker}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>{label}</Text>
      <TouchableOpacity onPress={showTimepicker}>
        <Text>{value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={value}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={handleChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  webTimePicker: {
    padding: 5,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 5,
  },
});

export default TimePicker;

