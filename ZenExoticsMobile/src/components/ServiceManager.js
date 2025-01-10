import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import AddServiceModal from './AddServiceModal';
import ProfessionalServiceCard from './ProfessionalServiceCard';
import ConfirmationModal from './ConfirmationModal';

const ServiceManager = ({ services, setServices, setHasUnsavedChanges, isProfessionalTab = false }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [collapsedServices, setCollapsedServices] = useState([]);
  const [allCollapsed, setAllCollapsed] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [hoveredButton, setHoveredButton] = useState(null);

  const toggleCollapseAll = () => {
    if (allCollapsed) {
      setCollapsedServices([]);
    } else {
      setCollapsedServices(services.map((_, index) => index));
    }
    setAllCollapsed(!allCollapsed);
  };

  const handleEditService = (index) => {
    const serviceToEdit = { ...services[index], index };
    setEditingService(serviceToEdit);
    setShowModal(true);
  };

  const handleDeleteService = (index) => {
    setServiceToDelete(index);
    setShowDeleteModal(true);
  };

  const handleSaveService = (updatedService) => {
    if (editingService !== null) {
      setServices(prev => 
        prev.map((service, index) => 
          index === editingService.index ? updatedService : service
        )
      );
    } else {
      setServices(prev => [...prev, updatedService]);
    }
    setHasUnsavedChanges(true);
    setEditingService(null);
  };

  const toggleCollapse = (index) => {
    setCollapsedServices((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  const confirmDelete = () => {
    setServices(prevServices => 
      prevServices.filter((_, i) => i !== serviceToDelete)
    );
    setHasUnsavedChanges(true);
    setShowDeleteModal(false);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.serviceListContainer, { paddingHorizontal: isProfessionalTab ? 0 : 20 }]}>
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
                setEditingService(null);
                setShowModal(true);
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
          renderItem={({ item, index }) => (
            <ProfessionalServiceCard
              item={item}
              index={index}
              isCollapsed={collapsedServices.includes(index)}
              onEdit={handleEditService}
              onDelete={handleDeleteService}
              onToggleCollapse={toggleCollapse}
            />
          )}
        />
      </View>
      

      <AddServiceModal
        visible={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingService(null);
        }}
        onSave={handleSaveService}
        initialService={editingService}
        setHasUnsavedChanges={setHasUnsavedChanges}
      />

      <ConfirmationModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        actionText="delete this service"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // padding: 20,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginBottom: 20,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.large,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: 20,
    padding: 8,
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
  serviceListContainer: {
    flex: 1,
    paddingVertical: 0,
  },
});

export default ServiceManager;
