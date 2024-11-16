import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, SafeAreaView, StatusBar, Dimensions, KeyboardAvoidingView, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { theme } from '../styles/theme';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const mockSitters = [
  {
    id: '1',
    name: 'John Doe',
    profilePicture: 'https://via.placeholder.com/150',
    reviews: 4.5,
    price: 25,
    bio: 'Experienced with all types of pets.',
    location: 'Colorado Springs, CO',
    coordinates: { latitude: 38.8339, longitude: -104.8214 },
    serviceTypes: ['House Sitting', 'Dog Walking'],
    animalTypes: ['dogs', 'cats'],
  },
  {
    id: '2',
    name: 'Jane Smith',
    profilePicture: 'https://via.placeholder.com/150',
    reviews: 4.8,
    price: 30,
    bio: 'Specialized in exotic pets.',
    location: 'Manitou Springs, CO',
    coordinates: { latitude: 38.8597, longitude: -104.9172 },
    serviceTypes: ['House Sitting', 'Drop-ins'],
    animalTypes: ['exotics', 'cats'],
  },
  {
    id: '3',
    name: 'Mike Wilson',
    profilePicture: 'https://via.placeholder.com/150',
    reviews: 4.7,
    price: 28,
    bio: 'Dog trainer with 5 years experience.',
    location: 'Security-Widefield, CO',
    coordinates: { latitude: 38.7478, longitude: -104.7288 },
    serviceTypes: ['Dog Walking', 'Training'],
    animalTypes: ['dogs'],
  },
  {
    id: '4',
    name: 'Sarah Johnson',
    profilePicture: 'https://via.placeholder.com/150',
    reviews: 4.9,
    price: 35,
    bio: 'Veterinary technician, great with medical needs.',
    location: 'Fountain, CO',
    coordinates: { latitude: 38.6822, longitude: -104.7008 },
    serviceTypes: ['House Sitting', 'Drop-ins'],
    animalTypes: ['dogs', 'cats', 'exotics'],
  },
  {
    id: '5',
    name: 'Tom Brown',
    profilePicture: 'https://via.placeholder.com/150',
    reviews: 4.6,
    price: 27,
    bio: 'Experienced with large breeds.',
    location: 'Black Forest, CO',
    coordinates: { latitude: 39.0128, longitude: -104.7008 },
    serviceTypes: ['Dog Walking', 'House Sitting'],
    animalTypes: ['dogs'],
  },
  // Additional sitters further out
  {
    id: '6',
    name: 'Lisa Anderson',
    profilePicture: 'https://via.placeholder.com/150',
    reviews: 4.4,
    price: 32,
    bio: 'Experienced with birds and small animals.',
    location: 'Monument, CO',
    coordinates: { latitude: 39.0917, longitude: -104.8722 },
    serviceTypes: ['House Sitting', 'Drop-ins'],
    animalTypes: ['exotics', 'cats'],
  },
  {
    id: '7',
    name: 'David Clark',
    profilePicture: 'https://via.placeholder.com/150',
    reviews: 4.7,
    price: 29,
    bio: 'Specializing in puppy care and training.',
    location: 'Woodland Park, CO',
    coordinates: { latitude: 38.9939, longitude: -105.0569 },
    serviceTypes: ['Dog Walking', 'Training'],
    animalTypes: ['dogs'],
  },
  {
    id: '8',
    name: 'Emma White',
    profilePicture: 'https://via.placeholder.com/150',
    reviews: 4.8,
    price: 33,
    bio: 'Experienced with senior pets.',
    location: 'Pueblo West, CO',
    coordinates: { latitude: 38.3494, longitude: -104.7224 },
    serviceTypes: ['House Sitting', 'Drop-ins'],
    animalTypes: ['dogs', 'cats'],
  },
  {
    id: '9',
    name: 'James Miller',
    profilePicture: 'https://via.placeholder.com/150',
    reviews: 4.5,
    price: 26,
    bio: 'Great with high-energy dogs.',
    location: 'Castle Rock, CO',
    coordinates: { latitude: 39.3722, longitude: -104.8561 },
    serviceTypes: ['Dog Walking', 'House Sitting'],
    animalTypes: ['dogs'],
  },
  {
    id: '10',
    name: 'Rachel Green',
    profilePicture: 'https://via.placeholder.com/150',
    reviews: 4.9,
    price: 34,
    bio: 'Experienced with reptiles and amphibians.',
    location: 'Palmer Lake, CO',
    coordinates: { latitude: 39.1153, longitude: -104.9158 },
    serviceTypes: ['House Sitting', 'Drop-ins'],
    animalTypes: ['exotics'],
  }
];

const SearchSitters = ({ navigation }) => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [location, setLocation] = useState({ country: 'USA', state: '', city: 'Colorado Springs' });
  const [animalType, setAnimalType] = useState('');
  const [exoticType, setExoticType] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [petCount, setPetCount] = useState({ dogs: 0, cats: 0, exotics: 0 });
  const [repeatService, setRepeatService] = useState('');
  const [showServicePicker, setShowServicePicker] = useState(false);
  const [showAnimalTypePicker, setShowAnimalTypePicker] = useState(false);
  const [showRepeatServicePicker, setShowRepeatServicePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      let userLocation;
      
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        userLocation = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
      } else {
        userLocation = {
          latitude: 38.8339,
          longitude: -104.8214,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
      }

      const searchParams = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        location: userLocation,
        animalType,
        exoticType,
        serviceType,
        petCount,
        repeatService,
        initialSitters: mockSitters.filter(sitter => 
          (!serviceType || sitter.serviceTypes.includes(serviceType)) &&
          (!animalType || sitter.animalTypes.includes(animalType))
        )
      };

      // Store data based on platform
      if (Platform.OS === 'web') {
        sessionStorage.setItem('searchParams', JSON.stringify(searchParams));
      } else {
        await AsyncStorage.setItem('searchParams', JSON.stringify(searchParams));
      }

      navigation.navigate('SearchSittersListing');
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get location. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (setter) => (event, date) => {
    if (Platform.OS !== 'web') {
      setter(date || new Date());
    }
  };

  const renderDatePicker = (date, setDate, showPicker, setShowPicker, label) => {
    if (Platform.OS === 'web') {
      return (
        <View style={styles.datePickerContainer}>
          <Text>{label}:</Text>
          <input
            type="date"
            value={date.toISOString().split('T')[0]}
            onChange={(e) => setDate(new Date(e.target.value))}
            style={styles.webDatePicker}
          />
        </View>
      );
    } else {
      return (
        <View>
          <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.filterButton}>
            <Text style={styles.filterText}>{label}: {date.toDateString()}</Text>
          </TouchableOpacity>
          {showPicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowPicker(false);
                if (selectedDate) setDate(selectedDate);
              }}
              style={styles.datePicker}
            />
          )}
        </View>
      );
    }
  };

  const renderPicker = (selectedValue, setSelectedValue, showPicker, setShowPicker, label, options) => (
    <View>
      <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.filterButton}>
        <Text style={styles.filterText}>{label}: {selectedValue || 'Select'}</Text>
      </TouchableOpacity>
      {showPicker && (
        <Picker
          selectedValue={selectedValue}
          onValueChange={(itemValue) => {
            setSelectedValue(itemValue);
            setShowPicker(false);
          }}
          style={styles.picker}
        >
          {options.map((option, index) => (
            <Picker.Item key={index} label={option.label} value={option.value} />
          ))}
        </Picker>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Search Sitters</Text>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.filtersContainer}>
            {renderPicker(serviceType, setServiceType, showServicePicker, setShowServicePicker, 'Service Type', [
              { label: 'Select Service Type', value: '' },
              { label: 'House Sitting', value: 'House Sitting' },
              { label: 'Dog Walking', value: 'Dog Walking' },
              { label: 'Drop-ins', value: 'Drop-ins' },
              { label: 'Boarding', value: 'Boarding' },
              { label: 'Day Care', value: 'Day Care' },
              { label: 'Training', value: 'Training' },
            ])}

            <View style={styles.petCountContainer}>
              <Text style={styles.label}>Number of Pets:</Text>
              {['dogs', 'cats', 'exotics'].map((type) => (
                <View key={type} style={styles.petCounter}>
                  <Text style={styles.petType}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
                  <View style={styles.counterControls}>
                    <TouchableOpacity onPress={() => setPetCount({ ...petCount, [type]: Math.max(0, petCount[type] - 1) })}>
                      <MaterialCommunityIcons name="minus-circle" size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.petCount}>{petCount[type]}</Text>
                    <TouchableOpacity onPress={() => setPetCount({ ...petCount, [type]: petCount[type] + 1 })}>
                      <MaterialCommunityIcons name="plus-circle" size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            {animalType === 'exotic' && (
              <TextInput
                style={styles.filterInput}
                placeholder="Type of Exotic Pet"
                value={exoticType}
                onChangeText={setExoticType}
              />
            )}

            {renderDatePicker(startDate, setStartDate, showStartDatePicker, setShowStartDatePicker, 'Start Date')}
            {renderDatePicker(endDate, setEndDate, showEndDatePicker, setShowEndDatePicker, 'End Date')}

            {renderPicker(repeatService, setRepeatService, showRepeatServicePicker, setShowRepeatServicePicker, 'One-time or Repeat?', [
              { label: 'One-time or Repeat?', value: '' },
              { label: 'One-time', value: 'One-time' },
              { label: 'Repeat Weekly', value: 'Repeat Weekly' },
            ])}

            <TouchableOpacity 
              style={[styles.searchButton, isLoading && styles.searchButtonDisabled]} 
              onPress={handleSearch}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.searchButtonText}>Search</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    width: Platform.OS === 'web' && Dimensions.get('window').width > 600 ? '40%' : '90%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: theme.fontSizes.large,
    color: theme.colors.text,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  filtersContainer: {
    padding: 16,
  },
  picker: {
    marginBottom: 10,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: theme.colors.inputBackground,
  },
  filterInput: {
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: theme.colors.inputBackground,
  },
  filterButton: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 5,
    backgroundColor: theme.colors.inputBackground,
  },
  filterText: {
    color: theme.colors.text,
  },
  petCountContainer: {
    marginBottom: 20,
  },
  petCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  petType: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text,
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  petCount: {
    marginHorizontal: 10,
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text,
  },
  searchButton: {
    backgroundColor: theme.colors.primary,
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: theme.fontSizes.medium,
  },
  datePickerContainer: {
    marginBottom: 10,
  },
  webDatePicker: {
    padding: 5,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 5,
    width: '100%',
  },
});

export default SearchSitters;
