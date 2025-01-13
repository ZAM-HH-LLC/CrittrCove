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
  const [isApprovedSitter, setIsApprovedSitter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);

  // Single useEffect for auth state management
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const [token, storedRole, storedApproval] = await AsyncStorage.multiGet([
          'userToken',
          'userRole',
          'isApprovedSitter'
        ]);

        console.log('login token', token[1]);
        console.log('storedRole', storedRole[1]);
        console.log('storedApproval', storedApproval[1]);
        console.log('isApprovedSitter', isApprovedSitter);

        // If we have stored values, use them
        if (token[1]) {
          setIsSignedIn(true);
          setUserRole(storedRole[1] || 'petOwner');
          setIsApprovedSitter(storedApproval[1] === 'true');
        } else {
          setIsSignedIn(false);
          setUserRole(null);
          setIsApprovedSitter(false);
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAuthState();
  }, []); // Only run on mount

  const checkSitterStatus = async (token) => {
    try {
      console.log('Checking professional status with token:', token);
      const response = await axios.get(`${API_BASE_URL}/api/professional-status/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Professional status response:', response.data);
      
      if (response.data) {
        const { is_approved } = response.data;
        
        // Use is_approved to determine if they're a professional
        const isProfessional = is_approved;
        
        console.log('Professional status check:', {
          isProfessional,
          is_approved,
          responseData: response.data
        });
        
        setUserRole(isProfessional ? 'sitter' : 'petOwner');
        setIsApprovedSitter(isProfessional);
        
        // Update storage
        await AsyncStorage.multiSet([
          ['userRole', isProfessional ? 'sitter' : 'petOwner'],
          ['isApprovedSitter', String(isProfessional)]
        ]);

        console.log('Updated storage with:', {
          userRole: isProfessional ? 'sitter' : 'petOwner',
          isApprovedSitter: isProfessional
        });
      }
    } catch (error) {
      console.error('Error checking professional status:', error.response?.data || error);
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
      await checkSitterStatus(token);
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
        'isApprovedSitter'
      ]);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
    setIsSignedIn(false);
    setIsApprovedSitter(false);
    setUserRole(null);
  };

  const switchRole = async () => {
    if (isApprovedSitter) {
      const newRole = userRole === 'sitter' ? 'petOwner' : 'sitter';
      setUserRole(newRole);
      await AsyncStorage.setItem('userRole', newRole);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const [token, storedRole, storedApproval] = await AsyncStorage.multiGet([
        'userToken',
        'userRole',
        'isApprovedSitter'
      ]);

      console.log('Checking auth status with stored values:', {
        token: token[1] ? 'exists' : 'missing',
        storedRole: storedRole[1],
        storedApproval: storedApproval[1]
      });

      if (!token[1]) {
        setIsSignedIn(false);
        setUserRole(null);
        setIsApprovedSitter(false);
        return { isSignedIn: false, userRole: null, isApprovedSitter: false };
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/api/professional-status/`, {
          headers: { Authorization: `Bearer ${token[1]}` }
        });
        
        console.log('Fresh professional status:', response.data);
        
        const { is_approved } = response.data;
        const isProfessional = is_approved;
        
        console.log('Determined status:', {
          isProfessional,
          is_approved
        });

        // Update state immediately
        setIsSignedIn(true);
        setUserRole(isProfessional ? 'sitter' : 'petOwner');
        setIsApprovedSitter(isProfessional);

        // Update AsyncStorage
        await AsyncStorage.multiSet([
          ['userRole', isProfessional ? 'sitter' : 'petOwner'],
          ['isApprovedSitter', String(isProfessional)]
        ]);
        
        return {
          isSignedIn: true,
          userRole: isProfessional ? 'sitter' : 'petOwner',
          isApprovedSitter: isProfessional
        };
      } catch (error) {
        console.error('Error getting fresh professional status:', error.response?.data || error);
        console.log('Falling back to stored values:', {
          storedRole: storedRole[1],
          storedApproval: storedApproval[1]
        });
        
        // Update state with stored values
        setIsSignedIn(true);
        setUserRole(storedRole[1] || 'petOwner');
        setIsApprovedSitter(storedApproval[1] === 'true');
        
        return {
          isSignedIn: true,
          userRole: storedRole[1] || 'petOwner',
          isApprovedSitter: storedApproval[1] === 'true'
        };
      }
    } catch (error) {
      console.error('Error in checkAuthStatus:', error);
      setIsSignedIn(false);
      setUserRole(null);
      setIsApprovedSitter(false);
      return { isSignedIn: false, userRole: null, isApprovedSitter: false };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isSignedIn, 
      setIsSignedIn,
      userRole,
      setUserRole,
      isApprovedSitter, 
      setIsApprovedSitter,
      loading,
      signIn,
      signOut,
      switchRole,
      screenWidth,
      checkAuthStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
};
