import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

const SERVICE_TYPE_SUGGESTIONS = [
  "Overnight Cat Sitting (Client's Home)",
  "Dog Walking",
  "Pet Boarding",
  "Exotic Pet Care",
  "Daytime Pet Sitting",
];

const ANIMAL_TYPE_SUGGESTIONS = [
  'Dog',
  'Cat',
  'Cow',
  'Calf',
  'Lizard',
  'Bird',
  'Rabbit',
  'Fish',
];

const ServiceManager = ({ services, setServices, setHasUnsavedChanges }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentService, setCurrentService] = useState({
    serviceName: '',
    animalTypes: '',
    rates: { puppies: '', adults: '' },
    additionalAnimalRate: '',
  });
  const [collapsedServices, setCollapsedServices] = useState([]);
  const [allCollapsed, setAllCollapsed] = useState(false);
  const [additionalRates, setAdditionalRates] = useState([]);
  const [serviceTypeSuggestions, setServiceTypeSuggestions] = useState([]);
  const [animalTypeSuggestions, setAnimalTypeSuggestions] = useState([]);
  const [serviceDropdownPosition, setServiceDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [animalDropdownPosition, setAnimalDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [showAnimalDropdown, setShowAnimalDropdown] = useState(false);

  const serviceInputRef = useRef(null);
  const animalInputRef = useRef(null);

  const toggleCollapseAll = () => {
    if (allCollapsed) {
      setCollapsedServices([]); // Expand all
    } else {
      setCollapsedServices(services.map((_, index) => index)); // Collapse all
    }
    setAllCollapsed(!allCollapsed);
  };

  const handleAddService = () => {
    if (
      currentService.serviceName.trim() &&
      currentService.animalTypes.trim() &&
      (currentService.rates.puppies || currentService.rates.adults)
    ) {
      const updatedService = {
        ...currentService,
        additionalRates,
      };

      if (currentService.index !== undefined) {
        setServices((prevServices) =>
          prevServices.map((service, index) =>
            index === currentService.index ? updatedService : service
          )
        );
      } else {
        setServices((prevServices) => [...prevServices, updatedService]);
      }

      setCurrentService({
        serviceName: '',
        animalTypes: '',
        rates: { puppies: '', adults: '' },
        additionalAnimalRate: '',
      });
      setAdditionalRates([]);
      setModalVisible(false);
      setHasUnsavedChanges(true);
    }
  };


  const handleServiceTypeChange = (text) => {
    setCurrentService((prev) => ({ ...prev, serviceName: text }));
    if (text.trim()) {
      const filteredSuggestions = SERVICE_TYPE_SUGGESTIONS.filter((suggestion) =>
        suggestion.toLowerCase().includes(text.toLowerCase())
      ).slice(0, 5);
      setServiceTypeSuggestions(filteredSuggestions);
      measureDropdown(serviceInputRef, setServiceDropdownPosition, 'service');
      setShowServiceDropdown(true);
    } else {
      setServiceTypeSuggestions([]);
      setShowServiceDropdown(false);
    }
  };

  const handleAnimalTypeChange = (text) => {
    setCurrentService((prev) => ({ ...prev, animalTypes: text }));
    if (text.trim()) {
      const filteredSuggestions = ANIMAL_TYPE_SUGGESTIONS.filter((suggestion) =>
        suggestion.toLowerCase().startsWith(text.toLowerCase())
      ).slice(0, 5);
      setAnimalTypeSuggestions(filteredSuggestions);
      measureDropdown(animalInputRef, setAnimalDropdownPosition, 'animal');
      setShowAnimalDropdown(true);
    } else {
      setAnimalTypeSuggestions([]);
      setShowAnimalDropdown(false);
    }
  };

  const measureDropdown = (inputRef, setPosition, inputType) => {
    if (inputRef.current) {
      inputRef.current.measure((x, y, width, height, pageX, pageY) => {
        console.log('x: ', x, 'y: ', y, 'width: ', width, 'height: ', height, 'pageX: ', pageX, 'pageY: ', pageY);
        if (inputType === 'animal') {
          setPosition({ 
            top: y + height + 87, // Offset for animal dropdown
            left: x, 
            width: '100%',
          });
        } else {
          setPosition({ 
            top: y + height - 6, // Normal positioning for service dropdown
            left: x, 
            width: '100%',
          });
        }
      });
    }
  };

  const addAdditionalRate = () => {
    setAdditionalRates((prevRates) => [...prevRates, { label: '', value: '', description: '' }]);
  };

  const updateAdditionalRate = (index, key, value) => {
    setAdditionalRates((prevRates) =>
      prevRates.map((rate, i) => (i === index ? { ...rate, [key]: value } : rate))
    );
  };

  const renderServiceCard = ({ item, index }) => {
    const isCollapsed = collapsedServices.includes(index);
    return (
      <View style={[styles.serviceCard, isCollapsed && styles.collapsedCard]}>
        <View style={styles.topRow}>
          <Text style={styles.serviceName}>{item.serviceName}</Text>
          {!isCollapsed && (
            <TouchableOpacity onPress={() => handleDeleteService(index)}>
              <MaterialCommunityIcons name="delete" size={20} color={theme.colors.danger} />
            </TouchableOpacity>
          )}
        </View>
        {isCollapsed ? (
          <View style={styles.collapsedRow}>
            <Text style={styles.rateText}>
              Puppies: ${item.rates.puppies || 'N/A'}, Adults: ${item.rates.adults || 'N/A'}, Add’l Animal: ${item.additionalAnimalRate || 'N/A'}
            </Text>
            <TouchableOpacity onPress={() => toggleCollapse(index)}>
              <MaterialCommunityIcons name="chevron-down" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.middleRow}>
              <Text style={styles.rateText}>Puppies: ${item.rates.puppies || 'N/A'}</Text>
              <Text style={styles.rateText}>Adults: ${item.rates.adults || 'N/A'}</Text>
              <Text style={styles.rateText}>
                Add’l Animal: ${item.additionalAnimalRate || 'N/A'}
              </Text>
              {item.additionalRates?.map((rate, idx) => (
                <Text key={idx} style={styles.rateText}>
                  {rate.label}: ${rate.value} {rate.description && `(${rate.description})`}
                </Text>
              ))}
            </View>
            <View style={styles.bottomRow}>
              <TouchableOpacity onPress={() => handleEditService(index)}>
                <MaterialCommunityIcons name="pencil" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => toggleCollapse(index)}>
                <MaterialCommunityIcons name="chevron-up" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleCollapseAll} style={styles.collapseAllButton}>
        <Text style={styles.collapseAllText}>
          {allCollapsed ? 'Expand All' : 'Collapse All'}
        </Text>
      </TouchableOpacity>
      <FlatList
        data={services}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderServiceCard}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setCurrentService({
            serviceName: '',
            animalTypes: '',
            rates: { puppies: '', adults: '' },
            additionalAnimalRate: '',
          });
          setModalVisible(true);
        }}
      >
        <Text style={styles.addButtonText}>Add New Service</Text>
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalScroll}>
              <Text style={styles.modalTitle}>
                {currentService?.index !== undefined ? 'Edit Service' : 'Add New Service'}
              </Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  ref={serviceInputRef}
                  style={styles.input}
                  placeholder="Service Name"
                  value={currentService?.serviceName}
                  onChangeText={handleServiceTypeChange}
                />
                {showServiceDropdown && (
                  <View style={[styles.suggestionsContainer, serviceDropdownPosition]}>
                    {serviceTypeSuggestions.map((suggestion, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => {
                          setCurrentService((prev) => ({ ...prev, serviceName: suggestion }));
                          setShowServiceDropdown(false);
                        }}
                      >
                        <Text 
                          style={[
                            styles.suggestionText,
                            index === serviceTypeSuggestions.length - 1 && { borderBottomWidth: 0 }
                          ]}
                        >
                          {suggestion}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              <div style={styles.inputWrapper}>
                <TextInput
                  ref={animalInputRef}
                  style={styles.input}
                  placeholder="Animal Type"
                  value={currentService?.animalTypes}
                  onChangeText={handleAnimalTypeChange}
                />
                {showAnimalDropdown && (
                  <View style={[styles.suggestionsContainer, animalDropdownPosition]}>
                    {animalTypeSuggestions.map((suggestion, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => {
                          setCurrentService((prev) => ({ ...prev, animalTypes: suggestion }));
                          setShowAnimalDropdown(false);
                        }}
                      >
                        <Text 
                          style={[
                            styles.suggestionText,
                            index === animalTypeSuggestions.length - 1 && { borderBottomWidth: 0 }
                          ]}
                        >
                          {suggestion}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </div>
              <TextInput
                style={styles.input}
                placeholder="Constant Care Rate"
                keyboardType="decimal-pad"
                value={currentService?.rates?.puppies || ''}
                onChangeText={(value) =>
                  setCurrentService((prev) => ({
                    ...prev,
                    rates: { ...prev.rates, puppies: value.replace(/[^0-9.]/g, '') },
                  }))
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Adult Rate"
                keyboardType="decimal-pad"
                value={currentService?.rates?.adults || ''}
                onChangeText={(value) =>
                  setCurrentService((prev) => ({
                    ...prev,
                    rates: { ...prev.rates, adults: value.replace(/[^0-9.]/g, '') },
                  }))
                }
              />
              <TextInput
                style={[styles.input, styles.additionalAnimalRate]}
                placeholder="Additional Animal Rate"
                keyboardType="decimal-pad"
                value={currentService?.additionalAnimalRate || ''}
                onChangeText={(value) =>
                  setCurrentService((prev) => ({ 
                    ...prev, 
                    additionalAnimalRate: value.replace(/[^0-9.]/g, '') 
                  }))
                }
              />
              {additionalRates.map((rate, idx) => (
                <View key={idx} style={styles.additionalRateRow}>
                  <TextInput
                    style={[styles.input, styles.additionalRateInput]}
                    placeholder="Rate Title"
                    value={rate.label || ''}
                    onChangeText={(text) => updateAdditionalRate(idx, 'label', text)}
                  />
                  <TextInput
                    style={[styles.input, styles.additionalRateInput]}
                    placeholder="Rate Amount"
                    keyboardType="decimal-pad"
                    value={rate.value || ''}
                    onChangeText={(value) => updateAdditionalRate(idx, 'value', value.replace(/[^0-9.]/g, ''))}
                  />
                  <TextInput
                    style={[styles.input, styles.additionalRateInput]}
                    placeholder="Rate Description"
                    value={rate.description || ''}
                    onChangeText={(text) => updateAdditionalRate(idx, 'description', text)}
                  />
                </View>
              ))}
              <TouchableOpacity onPress={addAdditionalRate} style={styles.addRateButton}>
                <Text style={styles.addRateText}>+ Add Additional Rate</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.saveButton} onPress={handleAddService}>
                <Text style={styles.saveButtonText}>
                  {currentService?.index !== undefined ? 'Save Changes' : 'Add Service'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );

};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  serviceCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 10,
    marginVertical: 10,
  },
  collapsedCard: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  middleRow: {
    marginVertical: 5,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceName: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  rateText: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.textSecondary,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: theme.colors.buttonText,
    fontSize: theme.fontSizes.medium,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '50%',
    overflow: 'visible',
  },
  modalScroll: {
    flex: 1,
    overflow: 'scroll',
  },
  modalTitle: {
    fontSize: theme.fontSizes.large,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 5,
    width: '100%',
    padding: 10,
    marginBottom: 10,
    backgroundColor: theme.colors.inputBackground,
  },
  additionalAnimalRate: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: 10,
    marginBottom: 10,
  },
  suggestionsContainer: {
    position: 'absolute',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 5,
    zIndex: 1000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    // paddingVertical: 8, // Add inner padding
    marginTop: 5, // Add space between input and dropdown
    maxHeight: 150,
    overflow: 'hidden',
  },  
  suggestionText: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    // zIndex: 0,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 5,
    padding: 10,
  },
  saveButtonText: {
    color: theme.colors.buttonText,
  },
  cancelButton: {
    backgroundColor: theme.colors.danger,
    borderRadius: 5,
    padding: 10,
  },
  cancelButtonText: {
    color: theme.colors.buttonText,
  },
  collapseAllButton: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
  },
  collapseAllText: {
    color: theme.colors.buttonText,
    fontSize: theme.fontSizes.medium,
  },
  collapsedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  additionalRateRow: {
    marginTop: 10,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  additionalRateInput: {
    marginBottom: 5,
  },
  addRateText: {
    paddingTop: 20,
    paddingBottom: 20,
  },
});

export default ServiceManager;
