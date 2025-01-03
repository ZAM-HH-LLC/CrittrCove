import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, TextInput, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Dropdown from 'react-native-element-dropdown/src/components/Dropdown';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme } from '../styles/theme';
import Slider from '@react-native-community/slider';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import DatePicker from '../components/DatePicker';
import { debounce } from 'lodash';
import MultiSelect from 'react-native-element-dropdown/src/components/MultiSelect';

const LocationInput = ({ value, onChange, suggestions, onSuggestionSelect }) => {
  const locationInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedFetch = useCallback(
    debounce(async (text) => {
      if (text.length < 1) return;
      
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${text}&countrycodes=us&limit=5`,
          {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'ZenExotics Mobile App'
            }
          }
        );
        const data = await response.json();
        const suggestions = data.map(item => ({
          display_name: item.display_name,
          lat: item.lat,
          lon: item.lon
        }));
        onSuggestionSelect(suggestions);
      } catch (error) {
        console.error('Error fetching locations:', error);
        onSuggestionSelect([]);
      }
    }, 300),
    [onSuggestionSelect]
  );

  return (
    <View style={[styles.locationInputWrapper, { zIndex: 2 }]}>
      <TextInput
        ref={locationInputRef}
        style={styles.locationInput}
        placeholder="Enter city, state, or zip"
        value={value}
        onChangeText={(text) => {
          onChange(text);
          if (text.length < 1) {
            onSuggestionSelect([]);
          } else {
            debouncedFetch(text);
          }
        }}
      />
      {suggestions.length > 0 && (
        <View style={styles.suggestionsWrapper}>
          <ScrollView 
            style={styles.suggestionsContainer}
            keyboardShouldPersistTaps="always"
            nestedScrollEnabled={true}
          >
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionItem}
                onPress={() => {
                  onChange(suggestion.display_name);
                  onSuggestionSelect([]);
                }}
              >
                <Text>{suggestion.display_name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const SearchRefiner = ({ onFiltersChange }) => {
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    animalType: '',
    service: '',
    startDate: new Date(),
    endDate: new Date(),
    selectedPets: [],
    minRate: 0,
    maxRate: 250
  });
  const [location, setLocation] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedAnimalTypes, setSelectedAnimalTypes] = useState([]);

  const categories = [
    { label: 'Pet Sitting', value: 'pet-sitting' },
    { label: 'Dog Walking', value: 'dog-walking' },
    { label: 'Dog Day Care', value: 'dog-daycare' },
    { label: 'House Sitting', value: 'house-sitting' },
    { label: 'Drop-In Visits', value: 'drop-in' }
  ];

  const animalTypes = [
    { label: 'Dogs', value: 'dog' },
    { label: 'Cats', value: 'cat' },
    { label: 'Birds', value: 'bird' },
    { label: 'Small Animals', value: 'small-animal' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const renderPriceRange = () => (
    <View style={styles.section}>
      <Text style={styles.label}>Rate Range</Text>
      <View style={styles.priceRangeContainer}>
        <Text>${filters.minRate}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={250}
          step={5}
          value={filters.maxRate}
          onValueChange={(value) => handleFilterChange('maxRate', value)}
          minimumTrackTintColor={theme.colors.primary}
          maximumTrackTintColor={theme.colors.border}
        />
        <Text>${filters.maxRate}</Text>
      </View>
    </View>
  );

  const renderLocationInput = () => (
    <View style={[styles.section, { zIndex: 2 }]}>
      <Text style={styles.label}>Location</Text>
      <LocationInput
        value={location}
        onChange={setLocation}
        suggestions={locationSuggestions}
        onSuggestionSelect={setLocationSuggestions}
      />
    </View>
  );

  const renderDatePickers = () => (
    <View style={styles.section}>
      <Text style={styles.label}>Dates</Text>
      <View style={styles.datePickersContainer}>
        <View style={styles.datePickerWrapper}>
          <Text style={styles.dateLabel}>Start Date</Text>
          <DatePicker
            value={filters.startDate}
            onChange={(date) => handleFilterChange('startDate', date)}
          />
        </View>
        <View style={styles.datePickerWrapper}>
          <Text style={styles.dateLabel}>End Date</Text>
          <DatePicker
            value={filters.endDate}
            onChange={(date) => handleFilterChange('endDate', date)}
          />
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Refine Search</Text>
      
      {renderLocationInput()}

      <View style={styles.section}>
        <Text style={styles.label}>Service Categories</Text>
        <MultiSelect
          style={styles.dropdown}
          data={categories}
          labelField="label"
          valueField="value"
          value={selectedServices}
          onChange={items => {
            setSelectedServices(items);
            handleFilterChange('services', items);
          }}
          placeholder="Select services"
          selectedTextStyle={styles.selectedText}
          placeholderStyle={styles.placeholderText}
          selectedStyle={styles.selectedItem}
          iconStyle={styles.dropdownIcon}
          activeColor={theme.colors.background}
          itemContainerStyle={styles.itemContainer}
          itemTextStyle={styles.itemText}
          containerStyle={styles.dropdownContainer}
          renderItem={(item, selected) => (
            <View style={[
              styles.dropdownItem,
              selected && styles.dropdownItemSelected
            ]}>
              <Text style={[
                styles.dropdownItemText,
                selected && styles.dropdownItemTextSelected
              ]}>
                {item.label}
              </Text>
            </View>
          )}
          renderSelectedItem={(item, unSelect) => (
            <TouchableOpacity 
              style={styles.selectedChip} 
              onPress={() => {
                unSelect && unSelect(item);
                const newItems = selectedServices.filter(i => i !== item.value);
                setSelectedServices(newItems);
                handleFilterChange('services', newItems);
              }}
            >
              <Text style={styles.selectedChipText}>{item.label}</Text>
              <MaterialCommunityIcons name="close" size={18} color="#000" />
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Animal Types</Text>
        <MultiSelect
          style={styles.dropdown}
          data={animalTypes}
          labelField="label"
          valueField="value"
          value={selectedAnimalTypes}
          onChange={items => {
            setSelectedAnimalTypes(items);
            handleFilterChange('animalTypes', items);
          }}
          placeholder="Select animal types"
          selectedTextStyle={styles.selectedText}
          placeholderStyle={styles.placeholderText}
          selectedStyle={styles.selectedItem}
          iconStyle={styles.dropdownIcon}
          activeColor={theme.colors.whiteText}
          itemContainerStyle={styles.itemContainer}
          itemTextStyle={styles.itemText}
          containerStyle={styles.dropdownContainer}
          renderItem={(item, selected) => (
            <View style={[
              styles.dropdownItem,
              selected && styles.dropdownItemSelected
            ]}>
              <Text style={[
                styles.dropdownItemText,
                selected && styles.dropdownItemTextSelected
              ]}>
                {item.label}
              </Text>
            </View>
          )}
          renderSelectedItem={(item, unSelect) => (
            <TouchableOpacity 
              style={styles.selectedChip} 
              onPress={() => {
                unSelect && unSelect(item);
                const newItems = selectedAnimalTypes.filter(i => i !== item.value);
                setSelectedAnimalTypes(newItems);
                handleFilterChange('animalTypes', newItems);
              }}
            >
              <Text style={styles.selectedChipText}>{item.label}</Text>
              <MaterialCommunityIcons name="close" size={18} color="#000" />
            </TouchableOpacity>
          )}
        />
      </View>

      {renderDatePickers()}

      {renderPriceRange()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.medium,
    backgroundColor: theme.colors.background,
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
    height: '100%',
  },
  title: {
    fontSize: theme.fontSizes.large,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.large,
  },
  section: {
    marginBottom: theme.spacing.large,
  },
  label: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
  },
  dropdown: {
    height: 50,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    padding: theme.spacing.small,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  datePickerContainer: {
    flexDirection: 'column',
    gap: theme.spacing.small,
  },
  datePickerWrapper: {
    maxWidth: 200,
  },
  dateLabel: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.text,
    marginBottom: 4,
  },
  dateInput: {
    flex: 1,
    height: 50,
    backgroundColor: theme.colors.inputBackground,
    borderRadius: 8,
    padding: theme.spacing.small,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  rateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.small,
  },
  rateInput: {
    flex: 1,
    height: 50,
    backgroundColor: theme.colors.inputBackground,
    borderRadius: 8,
    padding: theme.spacing.small,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  priceRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.small,
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 10,
  },
  locationInputWrapper: {
    position: 'relative',
    marginBottom: theme.spacing.small,
  },
  locationInput: {
    height: 40,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: theme.spacing.small,
    backgroundColor: theme.colors.background,
  },
  suggestionsWrapper: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    maxHeight: 200,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    zIndex: 1000,
  },
  suggestionsContainer: {
    flex: 1,
  },
  suggestionItem: {
    padding: theme.spacing.small,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  datePickersContainer: {
    flexDirection: 'column',
    gap: theme.spacing.small,
  },
  selectedText: {
    fontSize: theme.fontSizes.large,
    color: '#000000',
    fontWeight: '1200',
  },
  placeholderText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.placeholderText,
  },
  selectedItem: {
    borderRadius: 8,
    backgroundColor: theme.colors.background,
    borderWidth: 8,
    borderColor: theme.colors.primary,
  },
  dropdownIcon: {
    width: 20,
    height: 20,
  },
  itemContainer: {
    padding: theme.spacing.small,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  itemText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text,
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 8,
    padding: theme.spacing.small,
    marginRight: theme.spacing.small,
    marginBottom: theme.spacing.small,
  },
  selectedChipText: {
    fontSize: theme.fontSizes.medium,
    color: '#000000',
    marginRight: theme.spacing.small,
  },
  dropdownItem: {
    padding: theme.spacing.small,
  },
  dropdownItemSelected: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 4,
    margin: 2,
  },
  dropdownItemText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text,
  },
  dropdownItemTextSelected: {
    color: theme.colors.text,
    fontWeight: '500',
  },
  dropdownContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});

export default SearchRefiner;