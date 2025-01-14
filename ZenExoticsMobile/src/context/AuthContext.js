import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../config/config';
import { Dimensions } from 'react-native';

export const SCREEN_WIDTH = Dimensions.get('window').width;
export const SCREEN_HEIGHT = Dimensions.get('window').height;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isApprovedProfessional, setIsApprovedProfessional] = useState(false);
  const [loading, setLoading] = useState(true);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  const [firstName, setFirstName] = useState('');

  const fetchUserName = async () => {
    try {
      let token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.error('No token found');
        return;
      }
      const response = await axios.get(`${API_BASE_URL}/api/users/v1/get-name/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFirstName(response.data.first_name);
    } catch (error) {
      console.error('Error fetching user name:', error.response ? error.response.data : error.message);
    }
  };

  // Single useEffect for auth state management
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const [token, storedRole, storedApproval] = await AsyncStorage.multiGet([
          'userToken',
          'userRole',
          'isApprovedProfessional'
        ]);

        console.log('login token', token[1]);
        console.log('storedRole', storedRole[1]);
        console.log('storedApproval', storedApproval[1]);
        console.log('isApprovedProfessional', isApprovedProfessional);

        // If we have stored values, use them
        if (token[1]) {
          setIsSignedIn(true);
          setUserRole(storedRole[1] || 'petOwner');
          setIsApprovedProfessional(storedApproval[1] === 'true');
        } else {
          setIsSignedIn(false);
          setUserRole(null);
          setIsApprovedProfessional(false);
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAuthState();
  }, []); // Only run on mount

  useEffect(() => {
    if (isSignedIn) {
      fetchUserName();
    }
  }, [isSignedIn]);

  const getProfessionalStatus = async (token) => {
    try {
      console.log('Checking professional status with token:', token);
      const response = await axios.get(`${API_BASE_URL}/api/professional-status/v1/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Professional status response:', response.data);
      
      const { is_approved } = response.data;
      
      // Set approval status
      setIsApprovedProfessional(is_approved);
      await AsyncStorage.setItem('isApprovedProfessional', String(is_approved));
      
      return {
        isApprovedProfessional: is_approved,
        suggestedRole: is_approved ? 'professional' : 'petOwner'
      };
    } catch (error) {
      console.error('Error getting professional status:', error.response?.data || error);
      return {
        isApprovedProfessional: false,
        suggestedRole: 'petOwner'
      };
    }
  };

  const signIn = async (token, refreshTokenValue) => {
    try {
      await AsyncStorage.multiSet([
        ['userToken', token],
        ['refreshToken', refreshTokenValue],
      ]);
      console.log('sign in token', token);
      setIsSignedIn(true);
      
      // Get professional status and set initial role
      const status = await getProfessionalStatus(token);
      const initialRole = status.suggestedRole;
      
      // Set and store the role
      setUserRole(initialRole);
      await AsyncStorage.setItem('userRole', initialRole);
      
      console.log('Sign in complete with role:', initialRole);
      
      return {
        userRole: initialRole,
        isApprovedProfessional: status.isApprovedProfessional
      };
    } catch (error) {
      console.error('Error during sign in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.multiRemove([
        'userToken', 
        'refreshToken', 
        'userRole', 
        'isApprovedProfessional'
      ]);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
    setIsSignedIn(false);
    setIsApprovedProfessional(false);
    setUserRole(null);
  };

  const switchRole = async () => {
    if (isApprovedProfessional) {
      const newRole = userRole === 'professional' ? 'petOwner' : 'professional';
      console.log('Switching role from', userRole, 'to', newRole);
      
      // Update state first
      setUserRole(newRole);
      
      // Then update AsyncStorage
      try {
        await AsyncStorage.setItem('userRole', newRole);
        console.log('Successfully updated AsyncStorage with new role:', newRole);
      } catch (error) {
        console.error('Error updating role in AsyncStorage:', error);
      }
    } else {
      console.log('User is not an approved professional, cannot switch roles');
    }
  };

  const checkAuthStatus = async () => {
    try {
      const [token, storedRole, storedApproval] = await AsyncStorage.multiGet([
        'userToken',
        'userRole',
        'isApprovedProfessional'
      ]);

      console.log('Checking auth status with stored values:', {
        token: token[1] ? 'exists' : 'missing',
        storedRole: storedRole[1],
        storedApproval: storedApproval[1]
      });

      if (!token[1]) {
        setIsSignedIn(false);
        setUserRole(null);
        setIsApprovedProfessional(false);
        return { isSignedIn: false, userRole: null, isApprovedProfessional: false };
      }

      // Get fresh professional status
      const status = await getProfessionalStatus(token[1]);
      setIsSignedIn(true);

      // If we have a stored role, use it; otherwise use the suggested role
      const currentRole = storedRole[1] || status.suggestedRole;
      setUserRole(currentRole);
      
      return {
        isSignedIn: true,
        userRole: currentRole,
        isApprovedProfessional: status.isApprovedProfessional
      };
    } catch (error) {
      console.error('Error in checkAuthStatus:', error);
      setIsSignedIn(false);
      setUserRole(null);
      setIsApprovedProfessional(false);
      return { isSignedIn: false, userRole: null, isApprovedProfessional: false };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isSignedIn, 
      setIsSignedIn,
      userRole,
      setUserRole,
      isApprovedProfessional, 
      setIsApprovedProfessional,
      loading,
      signIn,
      signOut,
      switchRole,
      screenWidth,
      checkAuthStatus,
      firstName
    }}>
      {children}
    </AuthContext.Provider>
  );
};
