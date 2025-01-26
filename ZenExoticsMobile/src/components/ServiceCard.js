import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { CostCalculationModal } from './CostCalculationModal';
import { mockConversations, mockMessages, createNewConversation } from '../data/mockData';

export const ServiceCard = ({ 
  service, 
  onHeartPress, 
  isFavorite, 
  professionalName,
  professionalId,
  navigation
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleContactPress = () => {
    // Check if conversation already exists
    const existingConversation = mockConversations.find(
      conv => conv.professionalId === professionalId
    );

    if (existingConversation) {
      navigation.replace('MessageHistory', {
        selectedConversation: existingConversation.id,
        professionalName: professionalName,
        professionalId: professionalId
      });
    } else {
      // Create new conversation using the helper function
      const newConversation = createNewConversation(
        professionalId,
        professionalName,
        'current_user_id', // Replace with actual current user ID
        'Me' // Current user name
      );

      // Add new conversation to mockConversations
      mockConversations.unshift(newConversation);

      // Initialize empty messages array for this conversation
      mockMessages[newConversation.id] = [];

      // Navigate directly to MessageHistory
      navigation.replace('MessageHistory', {
        selectedConversation: newConversation.id,
        professionalName: professionalName,
        professionalId: professionalId
      });
    }
    setIsModalVisible(false);
  };

  return (
    <View style={styles.serviceCard}>
      <TouchableOpacity 
        style={styles.heartButton}
        onPress={() => onHeartPress(service.id)}
      >
        <MaterialIcons 
          name={isFavorite ? "favorite" : "favorite-border"} 
          size={24} 
          color={theme.colors.primary} 
        />
      </TouchableOpacity>
      <MaterialCommunityIcons name={service.icon} size={30} color={theme.colors.primary} />
      <Text style={styles.serviceName}>{service.name}</Text>
      <Text style={styles.startingPrice}>Starting at ${service.startingPrice}</Text>
      <View style={styles.animalTypeContainer}>
        {service.animalTypes.map((type, index) => (
          <Text key={index} style={styles.animalType}>{type}</Text>
        ))}
      </View>
      <TouchableOpacity 
        style={styles.calculateButton}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={styles.calculateButtonText}>Calculate Cost</Text>
      </TouchableOpacity>

      <CostCalculationModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        serviceName={service.name}
        additionalRates={service.additionalRates || []}
        professionalName={professionalName}
        professionalId={professionalId}
        onContactPress={handleContactPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  serviceCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginRight: 16,
    width: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  heartButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    zIndex: 1,
  },
  serviceName: {
    fontSize: theme.fontSizes.mediumLarge,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  startingPrice: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.secondary,
    marginBottom: 8,
  },
  animalTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 12,
  },
  animalType: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.secondary,
    backgroundColor: theme.colors.background,
    borderRadius: 12,
  },
  calculateButton: {
    backgroundColor: theme.colors.primary,
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  calculateButtonText: {
    color: theme.colors.surface,
    fontSize: theme.fontSizes.smallMedium,
    fontWeight: '600',
  },
});

export default ServiceCard;