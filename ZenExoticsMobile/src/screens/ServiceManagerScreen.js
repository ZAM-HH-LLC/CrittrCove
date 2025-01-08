import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import ServiceManager from '../components/ServiceManager';
import { theme } from '../styles/theme';
import { DEFAULT_SERVICES } from '../data/mockData';
import CrossPlatformView from '../components/CrossPlatformView';
import BackHeader from '../components/BackHeader';

const ServiceManagerScreen = () => {
  const navigation = useNavigation();
  const [services, setServices] = useState([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showServiceModal, setShowServiceModal] = useState(false);

  // Simulate fetching services from an API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setServices(DEFAULT_SERVICES);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching services:', error);
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleAddServices = () => {
    setShowServiceModal(true);
  };

  if (isLoading) {
    return (
      <CrossPlatformView fullWidthHeader={true}>
        <BackHeader 
          title="Service Manager" 
          onBackPress={() => navigation.navigate('More')} 
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </CrossPlatformView>
    );
  }

  return (
    <CrossPlatformView fullWidthHeader={true}>
      <BackHeader 
        title="Service Manager" 
        onBackPress={() => navigation.navigate('More')} 
      />
      {services.length > 0 ? (
        <ServiceManager
          services={services}
          setServices={setServices}
          setHasUnsavedChanges={setHasUnsavedChanges}
          showModal={showServiceModal}
          setShowModal={setShowServiceModal}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No services yet</Text>
          <Button 
            mode="contained" 
            onPress={handleAddServices}
            style={styles.addButton}
          >
            Add Services
          </Button>
        </View>
      )}
    </CrossPlatformView>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: theme.colors.text,
    marginBottom: 20,
  },
  addButton: {
    paddingHorizontal: 20,
  },
});

export default ServiceManagerScreen; 