import React, { useState, useContext, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Dimensions, Alert, ActivityIndicator, Platform, Keyboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { theme } from '../styles/theme';
import CustomButton from '../components/CustomButton';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL } from '../config/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth } = Dimensions.get('window');

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigation = useNavigation();
  const { signIn, setUserRole, setIsApprovedSitter } = useContext(AuthContext);

  const checkSitterStatus = async (token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users/sitter-status/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const { is_sitter, is_approved_sitter } = response.data;
      
      // Update AuthContext
      setUserRole(is_sitter ? 'sitter' : 'petOwner');
      setIsApprovedSitter(is_approved_sitter);

      // Store in AsyncStorage
      await AsyncStorage.setItem('userRole', is_sitter ? 'sitter' : 'petOwner');
      await AsyncStorage.setItem('isApprovedSitter', JSON.stringify(is_approved_sitter));

      return is_approved_sitter;
    } catch (error) {
      console.error('Error checking sitter status:', error);
      
      // Set default values in case of error
      setUserRole('petOwner');
      setIsApprovedSitter(false);
      
      // Store default values in AsyncStorage
      await AsyncStorage.setItem('userRole', 'petOwner');
      await AsyncStorage.setItem('isApprovedSitter', 'false');

      return false;
    }
  };

  const handleLogin = async () => {
    // Dismiss keyboard on mobile platforms
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Keyboard.dismiss();
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/token/`, {
        email: email.toLowerCase(),
        password: password,
      });

      const { access, refresh } = response.data;
      await AsyncStorage.setItem('userToken', access);
      await AsyncStorage.setItem('refreshToken', refresh);
      await signIn(access);
      const isApprovedSitter = await checkSitterStatus(access);

      const destinationScreen = isApprovedSitter ? 'SitterDashboard' : 'Dashboard';
      navigation.navigate(destinationScreen);
    } catch (error) {
      console.error('Login failed', error);
      const errorMessage = error.response && error.response.status === 401
        ? 'Invalid credentials. Please try again.'
        : 'An unexpected error occurred.';

      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        Alert.alert('Login Failed', errorMessage);
      } else {
        setSuccessMessage(`Login Failed: ${errorMessage}`);
      }

      setIsEmailValid(false);
      setIsPasswordValid(false);
    } finally {
      setLoading(false);
    }
  };

  // Add useEffect to handle document-wide keyboard events
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleDocumentKeyPress = (e) => {
        if (e.key === 'Enter') {
          handleLogin();
        }
      };

      document.addEventListener('keydown', handleDocumentKeyPress);

      // Cleanup listener when component unmounts
      return () => {
        document.removeEventListener('keydown', handleDocumentKeyPress);
      };
    }
  }, [email, password]); // Dependencies ensure we have latest state values

  // Keep the existing handleKeyPress for input fields
  const handleKeyPress = (e) => {
    if (Platform.OS === 'web' && e.nativeEvent.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      <TextInput
        style={[styles.input, !isEmailValid && styles.invalidInput]}
        placeholder="Email"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setIsEmailValid(true);
        }}
        autoCapitalize="none"
        onKeyPress={Platform.OS === 'web' ? handleKeyPress : undefined}
      />
      <TextInput
        style={[styles.input, !isPasswordValid && styles.invalidInput]}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setIsPasswordValid(true);
        }}
        onKeyPress={Platform.OS === 'web' ? handleKeyPress : undefined}
      />
      <CustomButton title="Login" onPress={handleLogin} />
      {loading && <ActivityIndicator size="large" color={theme.colors.primary} />}
      {successMessage ? <Text style={styles.message}>{successMessage}</Text> : null}
      <TouchableOpacity onPress={() => navigation.navigate('ResetPassword')}>
        <Text style={styles.link}>Forgot Password?</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.link}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.medium,
    backgroundColor: theme.colors.background,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', // Center the content horizontally
  },
  title: {
    fontSize: theme.fontSizes.large,
    color: theme.colors.primary,
    marginBottom: theme.spacing.medium,
  },
  input: {
    width: screenWidth > 600 ? 600 : '100%',
    maxWidth: 600,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: theme.spacing.small,
    paddingHorizontal: theme.spacing.small,
  },
  invalidInput: {
    borderColor: 'red',
  },
  link: {
    color: theme.colors.primary,
    marginTop: theme.spacing.small,
    textAlign: 'center',
  },
  message: {
    marginTop: theme.spacing.small,
    color: theme.colors.primary,
    fontSize: theme.fontSizes.medium,
  },
});
