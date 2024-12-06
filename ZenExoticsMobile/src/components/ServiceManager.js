import React, { useState } from 'react';
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

const ServiceManager = ({ services, setServices, setHasUnsavedChanges }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentService, setCurrentService] = useState(null); // Tracks add/edit mode
  const [collapsedServices, setCollapsedServices] = useState([]); // Tracks collapsed service indices
  const [allCollapsed, setAllCollapsed] = useState(false); // Tracks if all services are collapsed
  const [additionalRates, setAdditionalRates] = useState([]); // Tracks additional rate types

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
        // Editing an existing service
        setServices((prevServices) =>
          prevServices.map((service, index) =>
            index === currentService.index ? updatedService : service
          )
        );
      } else {
        // Adding a new service
        setServices((prevServices) => [...prevServices, updatedService]);
      }

      setCurrentService(null); // Reset the form
      setAdditionalRates([]); // Reset additional rates
      setModalVisible(false);
      setHasUnsavedChanges(true);
    }
  };

  const handleEditService = (index) => {
    const serviceToEdit = { ...services[index], index }; // Include index for editing
    setCurrentService(serviceToEdit);
    setAdditionalRates(serviceToEdit.additionalRates || []); // Load additional rates
    setModalVisible(true);
  };

  const handleDeleteService = (index) => {
    setServices((prevServices) => prevServices.filter((_, i) => i !== index));
    setHasUnsavedChanges(true);
  };

  const toggleCollapse = (index) => {
    if (collapsedServices.includes(index)) {
      setCollapsedServices(collapsedServices.filter((i) => i !== index));
    } else {
      setCollapsedServices([...collapsedServices, index]);
    }
  };

  const toggleCollapseAll = () => {
    if (allCollapsed) {
      setCollapsedServices([]); // Expand all
    } else {
      setCollapsedServices(services.map((_, index) => index)); // Collapse all
    }
    setAllCollapsed(!allCollapsed);
  };

  const addAdditionalRate = () => {
    setAdditionalRates((prevRates) => [...prevRates, { label: '', value: '', description: '' }]);
  };

  const updateAdditionalRate = (index, key, value) => {
    setAdditionalRates((prevRates) =>
      prevRates.map((rate, i) =>
        i === index ? { ...rate, [key]: value } : rate
      )
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
              <TextInput
                style={styles.input}
                placeholder="Service Name"
                value={currentService?.serviceName}
                onChangeText={(text) =>
                  setCurrentService((prev) => ({ ...prev, serviceName: text }))
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Animal Types (comma-separated)"
                value={currentService?.animalTypes}
                onChangeText={(text) =>
                  setCurrentService((prev) => ({ ...prev, animalTypes: text }))
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Puppy Rate"
                keyboardType="numeric"
                value={currentService?.rates?.puppies}
                onChangeText={(value) =>
                  setCurrentService((prev) => ({
                    ...prev,
                    rates: { ...prev.rates, puppies: value },
                  }))
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Adult Rate"
                keyboardType="numeric"
                value={currentService?.rates?.adults}
                onChangeText={(value) =>
                  setCurrentService((prev) => ({
                    ...prev,
                    rates: { ...prev.rates, adults: value },
                  }))
                }
              />
              <TextInput
                style={[styles.input, styles.additionalAnimalRate]} // Add border below
                placeholder="Additional Animal Rate"
                keyboardType="numeric"
                value={currentService?.additionalAnimalRate}
                onChangeText={(value) =>
                  setCurrentService((prev) => ({ ...prev, additionalAnimalRate: value }))
                }
              />
              {additionalRates.map((rate, idx) => (
                <View key={idx} style={styles.additionalRateRow}>
                  <TextInput
                    style={[styles.input, styles.additionalRateInput]}
                    placeholder="Rate Title"
                    value={rate.label}
                    onChangeText={(text) => updateAdditionalRate(idx, 'label', text)}
                  />
                  <TextInput
                    style={[styles.input, styles.additionalRateInput]}
                    placeholder="Rate Amount"
                    keyboardType="numeric"
                    value={rate.value}
                    onChangeText={(value) => updateAdditionalRate(idx, 'value', value)}
                  />
                  <TextInput
                    style={[styles.input, styles.additionalRateInput]}
                    placeholder="Rate Description"
                    value={rate.description}
                    onChangeText={(text) => updateAdditionalRate(idx, 'description', text)}
                  />
                </View>
              ))}
              <TouchableOpacity onPress={addAdditionalRate} style={styles.addRateButton}>
                <Text style={styles.addRateText}>+ Add Additional Rate</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddService}
              >
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
    maxHeight: '40%', // Limit modal height to 80% of the viewport
  },
  modalScroll: {
    flex: 1,
    overflow: 'scroll', // Enable scrolling inside the modal
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
    padding: 10,
    marginBottom: 10,
    backgroundColor: theme.colors.inputBackground,
  },
  additionalAnimalRate: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border, // Adds a border below Additional Animal Rate
    paddingBottom: 10,
    marginBottom: 10,
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
    backgroundColor: theme.colors.primary,
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    marginBottom: 20,
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
