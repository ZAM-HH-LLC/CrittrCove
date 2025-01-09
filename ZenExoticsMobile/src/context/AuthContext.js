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

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        const response = await axios.get(`${API_BASE_URL}/api/users/sitter-status/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const { 
          is_sitter, 
          is_approved_sitter,
          approved_dog_sitting,
          approved_cat_sitting,
          approved_exotics_sitting 
        } = response.data;
        
        setIsSignedIn(true);
        setUserRole(is_sitter ? 'sitter' : 'petOwner');
        setIsApprovedSitter(is_approved_sitter);
        
        return { 
          isSignedIn: true, 
          userRole: is_sitter ? 'sitter' : 'petOwner', 
          isApprovedSitter: is_approved_sitter 
        };
      }
    } catch (error) {
      console.error('Error checking auth status:', error.response?.data || error.message);
    }
    return { isSignedIn: false, userRole: null, isApprovedSitter: false };
  };

  const checkSitterStatus = async (token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users/sitter-status/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Sitter status check response:', response.data);  // Debug log
      
      setIsApprovedSitter(response.data.is_approved_sitter);
      setUserRole(response.data.is_sitter ? 'sitter' : 'petOwner');
    } catch (error) {
      console.error('Error checking sitter status:', error.response?.data || error.message);
      setIsApprovedSitter(false);
      setUserRole('petOwner');
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    const updateScreenWidth = () => {
      setScreenWidth(Dimensions.get('window').width);
    };

    Dimensions.addEventListener('change', updateScreenWidth);

    return () => {
      // For older React Native versions:
      // Dimensions.removeEventListener('change', updateScreenWidth);
      
      // For newer React Native versions:
      // The event listener cleanup is handled automatically
    };
  }, []);

  const signIn = async (token) => {
    await AsyncStorage.setItem('userToken', token);
    setIsSignedIn(true);
    await checkSitterStatus(token);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('userToken');
    setIsSignedIn(false);
    setIsApprovedSitter(false);
    setUserRole(null);
  };

  const switchRole = async () => {
    if (isApprovedSitter) {
      const newRole = userRole === 'sitter' ? 'petOwner' : 'sitter';
      setUserRole(newRole);
      // Persist the role in AsyncStorage
      await AsyncStorage.setItem('userRole', newRole);
    }
  };

  // Add this useEffect to load the persisted role on app start
  useEffect(() => {
    const loadPersistedRole = async () => {
      try {
        const persistedRole = await AsyncStorage.getItem('userRole');
        if (persistedRole) {
          setUserRole(persistedRole);
        }
      } catch (error) {
        console.error('Error loading persisted role:', error);
      }
    };

    loadPersistedRole();
  }, []);

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
      checkAuthStatus,
      switchRole,
      screenWidth
    }}>
      {children}
    </AuthContext.Provider>
  );
};
