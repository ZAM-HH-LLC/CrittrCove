import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

export const ServiceCard = ({ service, onHeartPress, isFavorite }) => {
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
        onPress={() => {/* Add calculate logic */}}
      >
        <Text style={styles.calculateButtonText}>Calculate Cost</Text>
      </TouchableOpacity>
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
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  startingPrice: {
    fontSize: 16,
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
    fontSize: 12,
    color: theme.colors.secondary,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
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
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ServiceCard;