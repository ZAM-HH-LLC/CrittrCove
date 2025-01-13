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
  const [firstName, setFirstName] = useState('');

  const fetchUserName = async () => {
    try {
      let token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.error('No token found');
        return;
      }
      const response = await axios.get(`${API_BASE_URL}/api/users/get-name/`, {
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

  useEffect(() => {
    if (isSignedIn) {
      fetchUserName();
    }
  }, [isSignedIn]);

  const checkSitterStatus = async (token) => {
    try {
      console.log('Checking professional status with token:', token);
      const response = await axios.get(`${API_BASE_URL}/api/professional-status/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Professional status response:', response.data);
      
      if (response.data) {
        const { is_approved } = response.data;
        
        // Set approval status
        setIsApprovedSitter(is_approved);
        await AsyncStorage.setItem('isApprovedSitter', String(is_approved));
        
        // Always set initial role based on approval status during sign in
        const initialRole = is_approved ? 'sitter' : 'petOwner';
        console.log('Setting initial role to:', initialRole);
        setUserRole(initialRole);
        await AsyncStorage.setItem('userRole', initialRole);

        return {
          isApprovedSitter: is_approved,
          userRole: initialRole
        };
      }
    } catch (error) {
      console.error('Error checking professional status:', error.response?.data || error);
      return null;
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
      
      // Wait for checkSitterStatus to complete and get the result
      const status = await checkSitterStatus(token);
      console.log('Sign in complete with status:', status);
      
      return status; // Return the status so the calling component can navigate appropriately
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
      console.log('User is not an approved sitter, cannot switch roles');
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
        
        console.log('Determined status:', {
          is_approved,
          currentRole: storedRole[1]
        });

        // Update approval status
        setIsSignedIn(true);
        setIsApprovedSitter(is_approved);
        await AsyncStorage.setItem('isApprovedSitter', String(is_approved));
        
        // Always respect the stored role if it exists
        if (storedRole[1]) {
          setUserRole(storedRole[1]);
        }
        
        return {
          isSignedIn: true,
          userRole: storedRole[1],
          isApprovedSitter: is_approved
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
      checkAuthStatus,
      firstName
    }}>
      {children}
    </AuthContext.Provider>
  );
};
