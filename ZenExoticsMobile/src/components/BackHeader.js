import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { useNavigation } from '@react-navigation/native';

const BackHeader = ({ 
  title, 
  onBackPress, 
  rightIcon = null, // Optional right icon
  onRightPress = null, // Optional right icon press handler
  customStyles = {} // Optional custom styles
    }) => {
  const navigation = useNavigation();

  return (
    <View style={[styles.header, customStyles]}>
      <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
        <MaterialCommunityIcons 
          name="arrow-left" 
          size={24} 
          color={theme.colors.primary} 
        />
      </TouchableOpacity>
      
      <Text style={styles.headerText}>{title}</Text>
      
      {rightIcon && (
        <TouchableOpacity 
          onPress={onRightPress} 
          style={styles.rightButton}
        >
          <MaterialCommunityIcons 
            name={rightIcon} 
            size={24} 
            color={theme.colors.primary} 
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  backButton: {
    marginRight: 16,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
    flex: 1, // This allows the title to take up remaining space
  },
  rightButton: {
    marginLeft: 16,
  },
});

export default BackHeader;