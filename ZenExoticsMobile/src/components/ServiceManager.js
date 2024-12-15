import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { Picker } from '@react-native-picker/picker';

const SERVICE_TYPE_SUGGESTIONS = [
  "Overnight Cat Sitting (Client's Home)",
  "Cat Boarding",
  "Drop-In Visits (30 min)",
  "Drop-In Visits (60 min)",
  "Dog Walking",
  "Doggy Day Care",
  "Pet Boarding",
  "Exotic Pet Care",
  "Daytime Pet Sitting",
  "Ferrier", 
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

const TIME_OPTIONS = [
  '15 min',
  '30 min',
  '45 min',
  '1 hr',
  '2 hr',
  '4 hr',
  '8 hr',
  '24 hr',
  'overnight',
  'per day',
  'per visit'
];

const ServiceManager = ({ services, setServices, setHasUnsavedChanges }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentService, setCurrentService] = useState({
    serviceName: '',
    animalTypes: '',
    rates: { base_rate: ''},
    additionalAnimalRate: '',
    lengthOfService: '',
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
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [hoveredButton, setHoveredButton] = useState(null);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);

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
    setShowValidationErrors(true);
    
    const areAdditionalRatesValid = additionalRates.every(rate => 
      rate.label?.trim() && 
      rate.value?.trim() && 
      rate.description?.trim()
    );

    if (
      currentService.serviceName.trim() &&
      currentService.animalTypes.trim() &&
      currentService.lengthOfService &&
      (currentService.rates.base_rate) &&
      (additionalRates.length === 0 || areAdditionalRatesValid)
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
        rates: { base_rate: ''},
        additionalAnimalRate: '',
        lengthOfService: '',
      });
      setAdditionalRates([]);
      setModalVisible(false);
      setHasUnsavedChanges(true);
      setShowValidationErrors(false);
    }
  };

  const handleEditService = (index) => {
    const serviceToEdit = { ...services[index], index }; // Include index for editing
    setCurrentService(serviceToEdit);
    setAdditionalRates(serviceToEdit.additionalRates || []); // Load additional rates
    setModalVisible(true);
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
            top: y + height - 6, // Offset for animal dropdown
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

  const toggleCollapse = (index) => {
    setCollapsedServices((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  const handleDeleteService = (index) => {
    setServiceToDelete(index);
    setShowDeleteModal(true);
  };

  const renderServiceCard = ({ item, index }) => {
    const isCollapsed = collapsedServices.includes(index);
    return (
      <View style={[styles.serviceCard, isCollapsed && styles.collapsedCard]}>
        <View style={[styles.topRow, isCollapsed && styles.collapsedTopRow]}>
          <Text style={styles.serviceName}>{item.serviceName}</Text>
          {!isCollapsed && (
            <View style={styles.topRowIcons}>
              <TouchableOpacity 
                onPress={() => handleDeleteService(index)} 
                style={styles.iconButton}
              >
                <MaterialCommunityIcons name="delete" size={24} color={theme.colors.danger} />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => handleEditService(index)} 
                style={styles.iconButton}
              >
                <MaterialCommunityIcons name="pencil" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        <View style={[styles.middleRow, isCollapsed && styles.collapsedMiddleRow]}>
          <Text style={styles.rateText}>Base Rate: ${item.rates.base_rate || 'N/A'}</Text>
          <Text style={styles.rateText}>Additional Animal: ${item.additionalAnimalRate || 'N/A'}</Text>
          {!isCollapsed && <Text style={styles.rateText}>Duration: {item.lengthOfService || 'N/A'}</Text>}
          {!isCollapsed && item.additionalRates?.map((rate, idx) => (
            <Text key={idx} style={styles.rateText}>
              {rate.label}: ${rate.value} {rate.description && `(${rate.description})`}
            </Text>
          ))}
        </View>
        
        <TouchableOpacity 
          onPress={() => toggleCollapse(index)} 
          style={styles.collapseButton}
        >
          <MaterialCommunityIcons 
            name={isCollapsed ? "chevron-down" : "chevron-up"} 
            size={24} 
            color={theme.colors.primary} 
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerButtons}>
        <Text style={styles.sectionTitle}>Services</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={toggleCollapseAll} 
            style={styles.headerButton}
            onMouseEnter={() => setHoveredButton('collapse')}
            onMouseLeave={() => setHoveredButton(null)}
          >
            <MaterialCommunityIcons 
              name={allCollapsed ? "chevron-down" : "chevron-up"} 
              size={24} 
              color={theme.colors.primary} 
            />
            {hoveredButton === 'collapse' && (
              <Text style={styles.buttonTooltip}>
                {allCollapsed ? 'Expand' : 'Collapse'}
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onMouseEnter={() => setHoveredButton('add')}
            onMouseLeave={() => setHoveredButton(null)}
            onPress={() => {
              setCurrentService({
                serviceName: '',
                animalTypes: '',
                rates: { base_rate: ''},
                additionalAnimalRate: '',
                lengthOfService: '',
              });
              setModalVisible(true);
            }}
          >
            <MaterialCommunityIcons 
              name="plus" 
              size={24} 
              color={theme.colors.primary} 
            />
            {hoveredButton === 'add' && (
              <Text style={styles.buttonTooltip}>Add Service</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={services}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderServiceCard}
      />
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
              <View style={[styles.inputWrapper, { zIndex: 3 }]}>
                <Text style={styles.inputLabel}>Service Name</Text>
                <TextInput
                  ref={serviceInputRef}
                  style={[
                    styles.input,
                    showValidationErrors && !currentService?.serviceName?.trim() && styles.inputError
                  ]}
                  placeholder="Service Name"
                  placeholderTextColor={theme.colors.placeHolderText}
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
              <View style={[styles.inputWrapper, { zIndex: 2 }]}>
                <Text style={styles.inputLabel}>Animal Type</Text>
                <TextInput
                  ref={animalInputRef}
                  style={[
                    styles.input,
                    showValidationErrors && !currentService?.animalTypes?.trim() && styles.inputError
                  ]}
                  placeholder="Animal Type"
                  placeholderTextColor={theme.colors.placeHolderText}
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
              </View>
              <View style={[styles.inputWrapper, { zIndex: 1 }]}>
                <Text style={styles.inputLabel}>Length of Service</Text>
                <TouchableOpacity
                  style={[
                    styles.input,
                    styles.customDropdown,
                    showValidationErrors && !currentService?.lengthOfService && styles.inputError
                  ]}
                  onPress={() => setShowTimeDropdown(!showTimeDropdown)}
                >
                  <Text style={{
                    color: currentService?.lengthOfService ? theme.colors.text : theme.colors.placeHolderText
                  }}>
                    {currentService?.lengthOfService || "Select duration"}
                  </Text>
                  <MaterialCommunityIcons 
                    name={showTimeDropdown ? "chevron-up" : "chevron-down"} 
                    size={24} 
                    color={theme.colors.primary} 
                  />
                </TouchableOpacity>
                
                {showTimeDropdown && (
                  <View style={styles.timeDropdownContainer}>
                    {TIME_OPTIONS.map((time) => (
                      <TouchableOpacity
                        key={time}
                        style={styles.timeDropdownItem}
                        onPress={() => {
                          setCurrentService(prev => ({ ...prev, lengthOfService: time }));
                          setShowTimeDropdown(false);
                        }}
                      >
                        <Text style={[
                          styles.timeDropdownText,
                          currentService?.lengthOfService === time && styles.selectedTimeOption
                        ]}>
                          {time}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              <Text style={styles.inputLabel}>Base Rate</Text>
              <TextInput
                style={[
                  styles.input,
                  showValidationErrors && !currentService?.rates?.base_rate?.trim() && styles.inputError
                ]}
                placeholder="$ Ex. 25"
                placeholderTextColor={theme.colors.placeHolderText}
                keyboardType="decimal-pad"
                value={currentService?.rates?.base_rate ? `$${currentService.rates.base_rate}` : ''}
                onChangeText={(value) =>
                  setCurrentService((prev) => ({
                    ...prev,
                    rates: { ...prev.rates, base_rate: value.replace(/[^0-9.]/g, '').replace('$', '') },
                  }))
                }
              />
              <Text style={styles.inputLabel}>Additional Animal Rate</Text>
              <TextInput
                style={[
                  styles.input, 
                  styles.additionalAnimalRate,
                  showValidationErrors && !currentService?.additionalAnimalRate?.trim() && styles.inputError
                ]}
                placeholder="$ Ex. 20"
                placeholderTextColor={theme.colors.placeHolderText}
                keyboardType="decimal-pad"
                value={currentService?.additionalAnimalRate ? `$${currentService.additionalAnimalRate}` : ''}
                onChangeText={(value) =>
                  setCurrentService((prev) => ({ 
                    ...prev, 
                    additionalAnimalRate: value.replace(/[^0-9.]/g, '').replace('$', '') 
                  }))
                }
              />
              {additionalRates.map((rate, idx) => (
                <View key={idx} style={styles.additionalRateRow}>
                  <Text style={styles.additionalRateTitle}>Rate #{idx + 1}</Text>
                  <Text style={styles.inputLabel}>Rate Title</Text>
                  <TextInput
                    style={[
                      styles.input, 
                      styles.additionalRateInput,
                      showValidationErrors && !rate.label?.trim() && styles.inputError
                    ]}
                    placeholder="Animal with medication"
                    placeholderTextColor={theme.colors.placeHolderText}
                    value={rate.label || ''}
                    onChangeText={(text) => updateAdditionalRate(idx, 'label', text)}
                  />
                  <Text style={styles.inputLabel}>Rate Amount</Text>
                  <TextInput
                    style={[
                      styles.input, 
                      styles.additionalRateInput,
                      showValidationErrors && !rate.value?.trim() && styles.inputError
                    ]}
                    placeholder="$ Ex. 20"
                    placeholderTextColor={theme.colors.placeHolderText}
                    keyboardType="decimal-pad"
                    value={rate.value ? `$${rate.value}` : ''}
                    onChangeText={(value) => updateAdditionalRate(idx, 'value', value.replace(/[^0-9.]/g, '').replace('$', ''))}
                  />
                  <Text style={styles.inputLabel}>Rate Description</Text>
                  <TextInput
                    style={[
                      styles.input, 
                      styles.additionalRateInput,
                      showValidationErrors && !rate.description?.trim() && styles.inputError
                    ]}
                    placeholder="Rate for animal needing medicaiton"
                    placeholderTextColor={theme.colors.placeHolderText}
                    value={rate.description || ''}
                    onChangeText={(text) => updateAdditionalRate(idx, 'description', text)}
                  />
                  <TouchableOpacity 
                    onPress={() => {
                      setAdditionalRates(prevRates => prevRates.filter((_, i) => i !== idx));
                    }}
                    style={styles.deleteRateButton}
                  >
                    <Text style={styles.deleteRateButtonText}>Delete Additional Rate</Text>
                  </TouchableOpacity>
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
      <Modal
        animationType="slide"
        transparent={true}
        visible={showDeleteModal}
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.deleteModalContent]}>
            <Text style={styles.modalTitle}>Delete Service</Text>
            <Text style={styles.deleteModalText}>Are you sure you want to delete this service?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton2}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.cancelButtonText2}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => {
                  setServices(prevServices => 
                    prevServices.filter((_, i) => i !== serviceToDelete)
                  );
                  setHasUnsavedChanges(true);
                  setShowDeleteModal(false);
                }}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
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
    position: 'relative',
  },
  collapsedCard: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // paddingVertical: ,
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
    flex: 1,
    marginRight: 10,
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
    color: theme.colors.whiteText,
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
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    marginTop: 5,
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
    color: theme.colors.whiteText,
  },
  cancelButton: {
    backgroundColor: theme.colors.danger,
    borderRadius: 5,
    padding: 10,
  },
  cancelButtonText: {
    color: theme.colors.whiteText,
  },
  cancelButton2: {
    backgroundColor: theme.colors.surface, // or 'white'
    borderRadius: 5,
    padding: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelButtonText2: {
    color: theme.colors.text,
  },
  collapseAllButton: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
  },
  collapseAllText: {
    color: theme.colors.whiteText,
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
  deleteRateButton: {
    borderWidth: 1,
    borderColor: theme.colors.danger,
    borderRadius: 5,
    padding: 8,
    marginTop: 5,
    backgroundColor: 'transparent',
    alignItems: 'center',
    width: '100%',
  },
  deleteRateButtonText: {
    color: theme.colors.danger,
    fontSize: theme.fontSizes.small,
    textAlign: 'center',
  },
  inputError: {
    borderColor: theme.colors.danger,
  },
  topRowIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    // minWidth: 120, // Ensure enough space for icons
  },
  iconButton: {
    padding: 8,
    marginLeft: 10,
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteModalContent: {
    maxWidth: 300,
    padding: 20,
  },
  deleteModalText: {
    fontSize: theme.fontSizes.medium,
    marginBottom: 20,
    textAlign: 'center',
  },
  deleteButton: {
    backgroundColor: theme.colors.danger,
    borderRadius: 5,
    padding: 10,
  },
  deleteButtonText: {
    color: theme.colors.whiteText,
  },
  collapseButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    padding: 8,
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  collapsedTopRow: {
    marginBottom: 0,
  },
  collapsedMiddleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 0,
    paddingRight: 40, // Make space for collapse button
    paddingTop: 10,
  },
  rateText: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.textSecondary,
    flex: 1, // This helps with equal spacing in collapsed view
    marginRight: 10,
  },
  inputLabel: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.text,
    marginBottom: 5,
    // marginTop: 10,
    fontWeight: '500',
    zIndex: -1,
  },
  additionalRateTitle: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    width: '100%',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 10,
  },
  headerButton: {
    marginLeft: 40,
    // padding: 8,
    position: 'relative',
  },
  buttonTooltip: {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: [{ translateX: -35 }],
    backgroundColor: theme.colors.surface,
    padding: 8,
    borderRadius: 4,
    fontSize: theme.fontSizes.small,
    color: theme.colors.text,
    width: 70,
    textAlign: 'center',
    // marginBottom: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  dropdownContainer: {
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  picker: {
    backgroundColor: theme.colors.inputBackground,
    zIndex: -1,
    color: theme.colors.placeHolderText,
    height: 40,
    width: '100%',
  },
  customDropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 40,
  },
  
  timeDropdownContainer: {
    position: 'absolute',
    top: '80%',
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 5,
    marginTop: 2,
    maxHeight: 160,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    overflow: 'scroll',
  },
  
  timeDropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    height: 40,
  },
  
  timeDropdownText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.medium,
  },
  
  selectedTimeOption: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: 5,
  },
});

export default ServiceManager;
