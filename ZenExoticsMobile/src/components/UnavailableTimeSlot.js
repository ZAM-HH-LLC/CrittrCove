import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../styles/theme';
import { convertTo12HourFormat } from '../context/utils';
import { format, parse } from 'date-fns';

const UnavailableTimeSlot = ({ startTime, endTime, reason, onPress }) => {
  const formatTime = (time) => {
    if (typeof time === 'string') {
      // If it's already a string, try to parse it
      try {
        const date = parse(time, 'HH:mm', new Date());
        return format(date, 'h:mm a');
      } catch (error) {
        console.warn(`Invalid time format: ${time}`);
        return 'Invalid Time';
      }
    } else if (time instanceof Date) {
      // If it's a Date object, format it directly
      return format(time, 'h:mm a');
    } else {
      console.warn(`Invalid time format: ${time}`);
      return 'Invalid Time';
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} disabled={!onPress}>
      <Text style={styles.time}>
        {formatTime(startTime)} - {formatTime(endTime)}
      </Text>
      <Text style={styles.reason}> {reason}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: theme.colors.lightGrey,
    borderRadius: 5,
    marginBottom: 5,
  },
  time: {
    fontSize: theme.fontSizes.small,
    fontWeight: 'bold',
  },
  reason: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.textSecondary,
  },
});

export default UnavailableTimeSlot;
