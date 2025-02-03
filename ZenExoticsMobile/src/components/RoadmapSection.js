import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Platform } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { AuthContext } from '../context/AuthContext';

const RoadmapSection = () => {
  const theme = useTheme();
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { screenWidth } = useContext(AuthContext);
  const isMobile = screenWidth < 768;

  const roadmapData = [
    {
      id: 1,
    //   number: '01',
      title: 'Prototype Launch',
      description: 'Initial release of CrittrCove webpage and landing page with no signup or app functionality.',
      icon: 'dog',
      color: '#4169E1' // Royal Blue
    },
    {
      id: 2,
    //   number: '02',
      title: 'Launch of MVP',
      description: 'This is when users will be able to sign up and use the app fully for the first time! For a full feature list, please check our blog or discord.',
      icon: 'dragon',
      color: '#9370DB' // Medium Purple
    },
    {
      id: 3,
    //   number: '03',
      title: 'Launch of App',
      description: 'Mobile app release with real-time messaging, notifications, and payment integration. For a full feature list, please check our blog or discord.',
      icon: 'cat',
      color: theme.colors.primary // Royal Blue
    },
    {
      id: 4,
    //   number: '04',
      title: 'Community Features',
      description: 'Adding social features, pet communities, and expert advice forums.',
      icon: 'fish',
      color: '#516C61' // Medium Purple
    }
  ];

  const handleMilestonePress = (milestone) => {
    setSelectedMilestone(milestone);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Our Roadmap</Text>
      
      {isMobile ? (
        // Mobile Layout
        <View style={styles.mobileContainer}>
          {roadmapData.map((milestone, index) => (
            <View key={milestone.id} style={[
              styles.mobileItemContainer,
              index === roadmapData.length - 1 ? { marginBottom: 0 } : null
            ]}>
              <TouchableOpacity
                style={styles.mobileMarker}
                onPress={() => handleMilestonePress(milestone)}
              >
                <View style={[styles.markerContainer, { backgroundColor: milestone.color }]}>
                  <FontAwesome5 name={milestone.icon} size={24} color="white" />
                </View>
              </TouchableOpacity>
              <Text style={styles.mobileMilestoneTitle}>{milestone.title}</Text>
              {index < roadmapData.length - 1 && (
                <View style={styles.mobileDashedLine} />
              )}
            </View>
          ))}
        </View>
      ) : (
        // Web Layout
        <View style={styles.webContainer}>
          <View style={[styles.dashedLine, {
            width: '80%',
            left: '10%'
          }]} />
          {roadmapData.map((milestone, index) => (
            <TouchableOpacity
              key={milestone.id}
              style={[
                styles.webMarker,
                { 
                  left: `${10 + (index * (80 / (roadmapData.length - 1)))}%`,
                }
              ]}
              onPress={() => handleMilestonePress(milestone)}
            >
              <View style={[styles.markerContainer, { backgroundColor: milestone.color }]}>
                <FontAwesome5 name={milestone.icon} size={24} color="white" />
              </View>
              <Text style={styles.webMilestoneTitle}>{milestone.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Modal for milestone details */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedMilestone && (
              <>
                <View style={[styles.modalIconContainer, { backgroundColor: selectedMilestone.color }]}>
                  <Text style={styles.modalNumber}>{selectedMilestone.number}</Text>
                  <FontAwesome5 
                    name={selectedMilestone.icon} 
                    size={40} 
                    color="white"
                  />
                </View>
                <Text style={styles.modalTitle}>{selectedMilestone.title}</Text>
                <Text style={styles.modalDescription}>
                  {selectedMilestone.description}
                </Text>
                <TouchableOpacity
                  style={[styles.closeButton, { backgroundColor: selectedMilestone.color }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    width: '100%',
    maxWidth: 1200,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: 'black',
  },
  mobileContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 20,
  },
  mobileItemContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 80,
    position: 'relative',
  },
  mobileMarker: {
    alignItems: 'center',
    marginBottom: 20,
  },
  mobileMilestoneTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    marginTop: 15,
    textAlign: 'center',
    marginBottom: 30,
  },
  mobileDashedLine: {
    position: 'absolute',
    width: 2,
    height: 60,
    bottom: -50,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#333',
  },
  webContainer: {
    // height: 200,
    position: 'relative',
    marginTop: 20,
    marginBottom: 120,
    width: '100%',
  },
  dashedLine: {
    position: 'absolute',
    height: 2,
    top: 30,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#333',
  },
  webMarker: {
    position: 'absolute',
    alignItems: 'center',
    width: 120,
    transform: [{ translateX: -60 }], // Center the marker
  },
  webMilestoneTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
  },
  markerContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalNumber: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    position: 'absolute',
    top: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: 'black',
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: 'black',
    lineHeight: 24,
  },
  closeButton: {
    padding: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RoadmapSection; 