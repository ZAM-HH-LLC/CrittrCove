import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import ServiceManager from './ServiceManager';
import { theme } from '../styles/theme';
import RecordedPets from './RecordedPets';
import EditableSection from './EditableSection';
import * as ImagePicker from 'expo-image-picker';

const ProfessionalTab = ({ 
  services, 
  setServices, 
  setHasUnsavedChanges,
  getContentWidth,
  pets,
  editMode,
  toggleEditMode
}) => {
  const [professionalPhoto, setProfessionalPhoto] = useState(null);
  const [professionalBio, setProfessionalBio] = useState('');
  const [portfolioPhotos, setPortfolioPhotos] = useState([]);
  const [facilities, setFacilities] = useState('');
  const [skills, setSkills] = useState({
    certifications: [],
    experience: '',
    specialties: [],
  });

  const pickProfessionalPhoto = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfessionalPhoto(result.assets[0].uri);
      setHasUnsavedChanges(true);
    }
  };

  const addPortfolioPhoto = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
      aspect: [4, 3],
      allowsMultipleSelection: true,
      selectionLimit: 10,
    });

    if (!result.canceled) {
      const newPhotos = result.assets.map(asset => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        uri: asset.uri,
        caption: 'New portfolio photo'
      }));
      
      setPortfolioPhotos(prev => [...prev, ...newPhotos]);
      setHasUnsavedChanges(true);
    }
  };

  const renderEditableField = (label, value, onChangeText, section, multiline = false) => {
    return editMode[section] ? (
      <TextInput
        value={value}
        onChangeText={(text) => {
          onChangeText(text);
          setHasUnsavedChanges(true);
        }}
        style={[
          styles.input,
          { width: getContentWidth() },
          multiline && { height: 100, textAlignVertical: 'top' }
        ]}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
      />
    ) : (
      <Text style={[styles.fieldText, { width: getContentWidth() }]}>
        {value || `No ${label.toLowerCase()} provided`}
      </Text>
    );
  };

  return (
    <View style={styles.centeredContent}>
      {/* Professional Photo Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Profile Photo (Professional)</Text>
        </View>
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={pickProfessionalPhoto}>
            {professionalPhoto ? (
              <Image source={{ uri: professionalPhoto }} style={styles.profilePhoto} />
            ) : (
              <View style={[styles.profilePhoto, styles.profilePhotoPlaceholder]}>
                <Ionicons name="person" size={60} color={theme.colors.placeholder} />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Professional Bio Section */}
      <EditableSection
        title="Professional Bio"
        value={professionalBio}
        onChangeText={setProfessionalBio}
        editMode={editMode.professionalBio}
        toggleEditMode={() => toggleEditMode('professionalBio')}
        setHasUnsavedChanges={setHasUnsavedChanges}
        getContentWidth={getContentWidth}
      />

      {/* Services Section */}
      <View style={styles.section}>
        <ServiceManager
          services={services}
          setServices={setServices}
          setHasUnsavedChanges={setHasUnsavedChanges}
        />
      </View>

      {/* Portfolio Photos Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Portfolio Photos</Text>
          <TouchableOpacity onPress={addPortfolioPhoto}>
            <MaterialCommunityIcons 
              name="plus" 
              size={24} 
              color={theme.colors.primary} 
            />
          </TouchableOpacity>
        </View>
        <View style={styles.portfolioGrid}>
          {portfolioPhotos.map((photo) => (
            <TouchableOpacity 
              key={photo.id} 
              style={styles.portfolioCard}
              onPress={() => {
                // Handle photo edit/view
                // Could add modal to edit caption or view full size
              }}
            >
              <View style={styles.portfolioImageContainer}>
                <Image 
                  source={{ uri: photo.uri }} 
                  style={styles.portfolioPhoto} 
                />
              </View>
              <Text style={styles.portfolioCaption}>{photo.caption}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {portfolioPhotos.length === 0 && (
          <Text style={styles.emptyText}>
            No portfolio photos added yet
          </Text>
        )}
      </View>
        
      { /* My Pets Section (Read-Only) */}
      <RecordedPets pets={pets} />

      {/* Home & Facilities Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Home & Facilities</Text>
          <TouchableOpacity onPress={() => toggleEditMode('facilities')}>
            <MaterialCommunityIcons name="pencil" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
        {renderEditableField('Facilities', facilities, setFacilities, 'facilities', true)}
      </View>

      {/* Skills & Experience Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Skills & Experience</Text>
          <TouchableOpacity onPress={() => toggleEditMode('skills')}>
            <MaterialCommunityIcons name="pencil" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
        {renderEditableField('Experience', skills.experience, 
          (text) => setSkills(prev => ({ ...prev, experience: text })), 
          'skills', 
          true
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredContent: {
    width: '100%',
    maxWidth: 600,
    alignItems: 'center',
    alignSelf: 'center',
  },
  section: {
    width: '100%',
    maxWidth: 600,
    marginBottom: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 10,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
    maxWidth: 600,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profilePhotoPlaceholder: {
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  input: {
    width: '100%',
    maxWidth: 600,
    marginBottom: 10,
    backgroundColor: theme.colors.surface,
    padding: 10,
    borderRadius: 5,
  },
  fieldText: {
    width: '100%',
    maxWidth: 600,
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text,
    marginBottom: 10,
  },
  portfolioGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  portfolioCard: {
    width: '48%',
    marginBottom: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
  },
  portfolioImageContainer: {
    aspectRatio: 4/3,
    width: '100%',
  },
  portfolioPhoto: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  portfolioCaption: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.text,
    padding: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.placeholder,
    marginTop: 16,
  },
});

export default ProfessionalTab;