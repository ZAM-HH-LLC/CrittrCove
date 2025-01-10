import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet, ScrollView, Picker, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import DatePicker from './DatePicker';
import TimePicker from './TimePicker';
import { format } from 'date-fns';
import { TIME_OPTIONS } from '../data/mockData';

const AddOccurrenceModal = ({ 
  visible, 
  onClose, 
  onAdd, 
  defaultRates, 
  hideRates = false,
  initialOccurrence = null,
  modalTitle = 'Add New Occurrence'
}) => {
  const [occurrence, setOccurrence] = useState(initialOccurrence || {
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    startTime: new Date(),
    endTime: new Date(new Date().setHours(new Date().getHours() + 1)),
    rates: {
      baseRate: defaultRates?.baseRate || 0,
      additionalRates: []
    }
  });

  const [showAddRate, setShowAddRate] = useState(false);
  const [newRate, setNewRate] = useState({ name: '', amount: '' });
  const [timeUnit, setTimeUnit] = useState('per visit');
  const [isLoading, setIsLoading] = useState(false);

  const handleAdd = async () => {
    try {
      setIsLoading(true);
      
      const totalCost = parseFloat(occurrence.rates.baseRate) + 
        occurrence.rates.additionalRates.reduce((sum, rate) => sum + parseFloat(rate.amount || 0), 0);

      const occurrenceData = {
        ...occurrence,
        startTime: format(occurrence.startTime, 'HH:mm'),
        endTime: format(occurrence.endTime, 'HH:mm'),
        totalCost,
        rates: {
          ...occurrence.rates,
          baseRate: parseFloat(occurrence.rates.baseRate),
          additionalRates: occurrence.rates.additionalRates.map(rate => ({
            ...rate,
            amount: parseFloat(rate.amount)
          })),
          timeUnit,
        }
      };

      // Add a delay before calling onAdd to ensure loading state is visible
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await onAdd(occurrenceData);

      // Reset the modal state
      setOccurrence({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        startTime: new Date(),
        endTime: new Date(new Date().setHours(new Date().getHours() + 1)),
        rates: {
          baseRate: defaultRates?.baseRate || 0,
          additionalRates: []
        }
      });
      setShowAddRate(false);
      setNewRate({ name: '', amount: '' });
      
      // Add another delay before closing
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error('Error adding occurrence:', error);
    } finally {
      setIsLoading(false);
      onClose(); // Move onClose() here to ensure it happens after loading is complete
    }
  };

  const handleAddRate = () => {
    if (newRate.name && newRate.amount) {
      setOccurrence(prev => ({
        ...prev,
        rates: {
          ...prev.rates,
          additionalRates: [...prev.rates.additionalRates, {
            ...newRate,
            amount: parseFloat(newRate.amount)
          }]
        }
      }));
      setNewRate({ name: '', amount: '' });
      setShowAddRate(false);
    }
  };

  const handleDeleteRate = (index) => {
    setOccurrence(prev => ({
      ...prev,
      rates: {
        ...prev.rates,
        additionalRates: prev.rates.additionalRates.filter((_, i) => i !== index)
      }
    }));
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView>
            <View style={styles.dateTimeSection}>
              <Text style={styles.sectionTitle}>Date & Time</Text>
              
              <View style={styles.dateTimeContainer}>
                <View style={styles.dateTimeColumn}>
                  <Text style={styles.label}>Start Date</Text>
                  <DatePicker
                    value={occurrence.startDate}
                    onChange={(date) => setOccurrence(prev => ({ ...prev, startDate: date }))}
                  />
                </View>
                <View style={styles.dateTimeColumn}>
                  <Text style={styles.label}>Start Time</Text>
                  <TimePicker
                    value={occurrence.startTime}
                    onChange={(time) => setOccurrence(prev => ({ ...prev, startTime: time }))}
                    fullWidth
                  />
                </View>
              </View>
            </View>
            <View style={styles.dateTimeSection}>
              
              <View style={styles.dateTimeContainer}>
                <View style={styles.dateTimeColumn}>
                  <Text style={styles.label}>End Date</Text>
                  <DatePicker
                    value={occurrence.endDate}
                    onChange={(date) => setOccurrence(prev => ({ ...prev, endDate: date }))}
                  />
                </View>
                <View style={styles.dateTimeColumn}>
                  <Text style={styles.label}>End Time</Text>
                  <TimePicker
                    value={occurrence.endTime}
                    onChange={(time) => setOccurrence(prev => ({ ...prev, endTime: time }))}
                    fullWidth
                  />
                </View>
              </View>
            </View>

            {!hideRates && (
              <>
                <View style={styles.rateSection}>
                  <View style={styles.rateContainer}>
                    <View style={styles.baseRateInput}>
                      <Text style={styles.label}>Base Rate</Text>
                      <TextInput
                        style={styles.input}
                        value={occurrence.rates.baseRate.toString()}
                        onChangeText={(text) => setOccurrence(prev => ({
                          ...prev,
                          rates: {
                            ...prev.rates,
                            baseRate: text.replace(/[^0-9.]/g, '')
                          }
                        }))}
                        keyboardType="decimal-pad"
                        placeholder="0.00"
                      />
                    </View>
                    <View style={styles.timeUnitInput}>
                      <Text style={styles.label}>Per</Text>
                      <Picker
                        selectedValue={timeUnit}
                        onValueChange={(itemValue) => setTimeUnit(itemValue)}
                        style={styles.picker}
                      >
                        {TIME_OPTIONS.map((option) => (
                          <Picker.Item key={option} label={option} value={option} />
                        ))}
                      </Picker>
                    </View>
                  </View>
                </View>

                <View style={styles.rateSection}>
                  <Text style={[styles.label, {marginTop: 10, marginBottom: 0}]}>Additional Rates</Text>
                  {occurrence.rates.additionalRates.map((rate, index) => (
                    <View key={index} style={[styles.rateRow, {marginTop: 10, marginBottom: 0}]}>
                      <TextInput
                        style={[styles.input, styles.rateInput]}
                        value={rate.name}
                        editable={false}
                      />
                      <View style={[styles.rateAmountContainer]}>
                        {/* <Text style={styles.dollarSign}>$</Text> */}
                        <TextInput
                          style={[styles.input, styles.rateAmountInput]}
                          value={rate.amount}
                          editable={false}
                        />
                      </View>
                      <TouchableOpacity onPress={() => handleDeleteRate(index)}>
                        <MaterialCommunityIcons name="close" size={24} color={theme.colors.error} />
                      </TouchableOpacity>
                    </View>
                  ))}

                  {showAddRate ? (
                    <>
                      <View style={styles.rateLabelContainer}>
                        <Text style={styles.rateTitleLabel}>Rate Title</Text>
                        <Text style={styles.rateAmountLabel}>Rate Amount</Text>
                      </View>
                      <View style={styles.rateRow}>
                        <TextInput
                          style={[styles.input, styles.rateInput]}
                          value={newRate.name}
                          onChangeText={(text) => setNewRate(prev => ({ ...prev, name: text }))}
                          placeholder="Rate Title"
                        />
                        <View style={[styles.rateAmountContainer]}>
                          {/* <Text style={styles.dollarSign}>$</Text> */}
                          <TextInput
                            style={[styles.input, styles.rateAmountInput]}
                            value={newRate.amount}
                            onChangeText={(text) => setNewRate(prev => ({ 
                              ...prev, 
                              amount: text.replace(/[^0-9.]/g, '') 
                            }))}
                            keyboardType="decimal-pad"
                            placeholder="0.00"
                          />
                        </View>
                        <TouchableOpacity onPress={handleAddRate}>
                          <MaterialCommunityIcons name="plus" size={24} color={theme.colors.primary} />
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <TouchableOpacity 
                      style={styles.addRateButton}
                      onPress={() => setShowAddRate(true)}
                    >
                      <Text style={styles.addRateButtonText}>Add another rate</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.addButton]}
                onPress={handleAdd}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={theme.colors.surface} />
                ) : (
                  <Text style={styles.addButtonText}>Add</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 20,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 15,
  },
  dateTimeSection: {
    // marginBottom: 20,
  },
  dateTimeContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
    marginBottom: 15,
  },
  dateTimeColumn: {
    flex: 1,
  },
  topSpacing: {
    marginTop: 15,
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  rateInput: {
    flex: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 12,
  },
  rateAmountContainer: {
    flex: 1,
  },
  rateAmountInput: {
    flex: 1,
  },
  addRateButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  addRateButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: theme.colors.text,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  dollarSign: {
    fontSize: 16,
    color: theme.colors.text,
    marginRight: 4,
  },
  input: {
    backgroundColor: theme.colors.surface,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 15,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
  },
  cancelButtonText: {
    color: theme.colors.text,
    fontSize: 16,
  },
  addButtonText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  rateLabelContainer: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 5,
  },
  rateTitleLabel: {
    flex: 2,
    fontSize: 16,
    color: theme.colors.text,
  },
  rateAmountLabel: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: 10,
  },
  rateContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  baseRateInput: {
    flex: 1,
  },
  timeUnitInput: {
    flex: 1,
  },
  picker: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    height: 39,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});

export default AddOccurrenceModal;