import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../config/config';
import { Dimensions, Platform } from 'react-native';
import { navigate } from '../../App';

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

  // SET TO "true" FOR NO API CALLS
  const [is_prototype, setIsPrototype] = useState(true);

  // Separate screen width handling from auth
  useEffect(() => {
    const handleDimensionsChange = ({ window }) => {
      setScreenWidth(window.width);
    };

    const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

    return () => {
      if (subscription?.remove) {
        subscription.remove();
      }
    };
  }, []); // No dependencies needed for dimension changes

  // Handle initial auth state separately
  useEffect(() => {
    const loadInitialAuth = async () => {
      try {
        if (is_prototype) {
          // In prototype mode, set default professional state
          setIsSignedIn(true);
          setUserRole('professional');
          setIsApprovedProfessional(true);
          await AsyncStorage.multiSet([
            ['userRole', 'professional'],
            ['isApprovedProfessional', 'true']
          ]);
          return;
        }

        const authStatus = await checkAuthStatus();
        if (authStatus.isSignedIn) {
          await fetchUserName();
        }
      } finally {
        setLoading(false);
      }
    };

    loadInitialAuth();
  }, []); // Only run on mount

  const fetchUserName = async () => {
    if (is_prototype) {
      // In prototype mode, set a default name
      setFirstName('John');
      return;
    }
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

        // If we have stored values, use them
        if (token[1]) {

          setIsSignedIn(true);
          setUserRole(storedRole[1] || 'petOwner');
          setIsApprovedProfessional(storedApproval[1] === 'true');
          console.log('Initial auth state set:', {
            role: storedRole[1] || 'petOwner',
            isApproved: storedApproval[1] === 'true'
          });
        } else {
          console.log('No token found, setting to signed out state');
          setIsSignedIn(false);
          setUserRole(null);
          setIsApprovedProfessional(false);
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
      } finally {
        setLoading(false);
        console.log('Finished loadAuthState');
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
      const response = await axios.get(`${API_BASE_URL}/api/professional-status/v1/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Professional status response:', response.data);
      
      const { is_approved } = response.data;
      
      // Set approval status only
      setIsApprovedProfessional(is_approved);
      await AsyncStorage.setItem('isApprovedProfessional', String(is_approved));
      
      // Just return the status without modifying roles
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

      console.log('MBA sign in token', token, 'refreshToken', refreshTokenValue);
      setIsSignedIn(true);
      
      if (is_prototype) {
        // In prototype mode, set default values without API calls
        const initialRole = 'professional';
        setUserRole(initialRole);
        await AsyncStorage.setItem('userRole', initialRole);
        setIsApprovedProfessional(true);
        return {
          userRole: initialRole,
          isApprovedProfessional: true
        };
      }
      
      // Get professional status and set initial role
      const status = await getProfessionalStatus(token);

      const initialRole = status.suggestedRole;
      
      // Set and store the role
      setUserRole(initialRole);
      await AsyncStorage.setItem('userRole', initialRole);
      

      
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
    // Ensure state updates are processed before navigation
    setTimeout(() => {
      navigate('SignIn');
    }, 0);
  };

  const switchRole = async () => {
    if (isApprovedProfessional) {
      const newRole = userRole === 'professional' ? 'petOwner' : 'professional';

      
      // Update state first
      setUserRole(newRole);
      
      // Then update AsyncStorage
      try {

        await AsyncStorage.setItem('userRole', newRole);
        
        // Verify the role was stored correctly
        const storedRole = await AsyncStorage.getItem('userRole');

        

      } catch (error) {
        console.error('Error updating role in AsyncStorage:', error);
      }
    } else {
      console.log('User is not an approved professional, cannot switch roles');
    }
  };

  const validateToken = async (token) => {
    try {
      if (is_prototype) {
        // In prototype mode, always return true for token validation
        console.log('Prototype mode: Mock token validation successful');
        return true;
      }

      const response = await axios.post(`${API_BASE_URL}/api/token/verify/`, {
        token: token
      });

      return true;
    } catch (error) {
      console.log('Token validation error:', error.response?.status);
      return false;
    }
  };

  const refreshUserToken = async (refreshToken) => {
    try {
      if (is_prototype) {
        // In prototype mode, return a mock token
        console.log('Prototype mode: Returning mock refreshed token');
        const mockNewToken = 'mock_refreshed_token';
        await AsyncStorage.setItem('userToken', mockNewToken);
        return mockNewToken;
      }

      const response = await axios.post(`${API_BASE_URL}/api/token/refresh/`, {
        refresh: refreshToken
      });
      const newToken = response.data.access;
      await AsyncStorage.setItem('userToken', newToken);

      return newToken;
    } catch (error) {
      console.error('Error refreshing token:', error.response?.status);
      return null;
    }
  };

  const checkAuthStatus = async () => {
    try {
      if (is_prototype) {
        // In prototype mode, check if we have any token (mock or real)
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          console.log('Prototype mode: No token found - signing out');
          await signOut();
          return { isSignedIn: false, userRole: null, isApprovedProfessional: false };
        }

        // In prototype mode, always consider the token valid
        console.log('Prototype mode: Token found - staying signed in');
        setIsSignedIn(true);
        const storedRole = await AsyncStorage.getItem('userRole') || 'petOwner';
        setUserRole(storedRole);
        setIsApprovedProfessional(true);
        return {
          isSignedIn: true,
          userRole: storedRole,
          isApprovedProfessional: true
        };
      }

      const [token, refreshToken, storedRole, storedApproval] = await AsyncStorage.multiGet([
        'userToken',
        'refreshToken',
        'userRole',
        'isApprovedProfessional'
      ]);

      if (!token[1] && !refreshToken[1]) {
        console.log('No tokens found - signing out');
        await signOut(); // This will handle both clearing state and navigation
        return { isSignedIn: false, userRole: null, isApprovedProfessional: false };
      }

      // First try to validate current token
      let currentToken = token[1];
      let isValid = false;
      
      if (currentToken) {
        isValid = await validateToken(currentToken);
      }

      // If current token is invalid but we have refresh token, try to refresh
      if (!isValid && refreshToken[1]) {
        const newToken = await refreshUserToken(refreshToken[1]);
        if (newToken) {
          currentToken = newToken;
          isValid = true;
        }
      }

      if (!isValid) {
        console.log('No valid token available - signing out');
        await signOut();
        return { isSignedIn: false, userRole: null, isApprovedProfessional: false };
      }

      // At this point we have a valid token
      console.log('Token validation successful, checking professional status with token:', currentToken);
      const status = await getProfessionalStatus(currentToken);
      console.log('Professional status check result:', status);
      
      setIsSignedIn(true);
      setIsApprovedProfessional(status.isApprovedProfessional);

      // Check if we're on the SearchProfessionalsListing screen
      let currentPath = '';
      if (Platform.OS === 'web') {
        currentPath = window.location.pathname.slice(1);
      } else {
        currentPath = await AsyncStorage.getItem('currentRoute');
      }

      // If on SearchProfessionalsListing, force petOwner role but don't store it
      if (currentPath === 'SearchProfessionalsListing') {

        setUserRole('petOwner');
        return {
          isSignedIn: true,
          userRole: 'petOwner',
          isApprovedProfessional: status.isApprovedProfessional
        };
      }

      // For all other cases, use the stored role if it exists
      if (storedRole[1]) {
        const role = storedRole[1];

        setUserRole(role);
        return {
          isSignedIn: true,
          userRole: role,
          isApprovedProfessional: status.isApprovedProfessional
        };
      }

      // Only set a new role if we don't have one stored (first login)

      const newRole = status.suggestedRole || 'petOwner';

      setUserRole(newRole);
      await AsyncStorage.setItem('userRole', newRole);
      
      return {
        isSignedIn: true,
        userRole: newRole,
        isApprovedProfessional: status.isApprovedProfessional
      };
    } catch (error) {
      console.error('Error in checkAuthStatus:', error);
      await signOut();
      return { isSignedIn: false, userRole: null, isApprovedProfessional: false };
    } finally {
      console.log('=== Ending checkAuthStatus ===');
    }
  };

  // Add useEffect to persist role changes
  useEffect(() => {
    if (is_prototype && isSignedIn) {
      AsyncStorage.setItem('userRole', userRole || 'professional');
      AsyncStorage.setItem('isApprovedProfessional', String(isApprovedProfessional));
    }
  }, [is_prototype, isSignedIn, userRole, isApprovedProfessional]);

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
      firstName,
      is_prototype,
      setIsPrototype
    }}>
      {children}
    </AuthContext.Provider>
  );
};
