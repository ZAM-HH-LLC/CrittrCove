import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

const RateSetter = ({ rates, setRates, setHasUnsavedChanges, editMode }) => {
  const rateServices = [
    { label: 'In House', service: 'inHouse' },
    { label: 'Overnight', service: 'overnight' },
    { label: 'Drop Bys', service: 'dropBys' },
    { label: 'Boarding', service: 'boarding' },
    { label: 'Day Care', service: 'dayCare' },
  ];

  return (
    <View style={styles.container}>
      {rateServices.map(({ label, service }) => (
        <View key={service} style={styles.rateContainer}>
          <Text style={styles.rateLabel}>{label}</Text>
          {editMode ? (
            <TextInput
              style={styles.rateInput}
              value={rates[service]}
              onChangeText={(value) => {
                setRates((prevRates) => ({ ...prevRates, [service]: value }));
                setHasUnsavedChanges(true);
              }}
              keyboardType="numeric"
              editable={editMode}
            />
          ) : (
            <Text style={styles.rateValue}>{rates[service] || 'N/A'}</Text>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  rateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  rateLabel: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text,
    flex: 1,
  },
  rateInput: {
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    width: '40%',
    backgroundColor: theme.colors.inputBackground,
  },
  rateValue: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text,
    flex: 1,
  },
});

export default RateSetter;
