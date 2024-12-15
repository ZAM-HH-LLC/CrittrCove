import React, { useState, useEffect, useContext } from 'react';
import { View, ScrollView, StyleSheet, Platform, SafeAreaView, Dimensions, StatusBar, TouchableOpacity, Text } from 'react-native';
import { Card, Title, Paragraph, List, Button, useTheme, Appbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { API_BASE_URL } from '../config/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';
import CrossPlatformView from '../components/CrossPlatformView';
import { theme } from '../styles/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const Dashboard = ({ navigation }) => {
  const { colors } = useTheme();
  const [firstName, setFirstName] = useState('');
  const { signOut } = useContext(AuthContext);

  const refreshToken = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      const response = await axios.post(`${API_BASE_URL}/api/token/refresh/`, {
        refresh: refreshToken,
      });
      const { access } = response.data;
      await AsyncStorage.setItem('userToken', access);
      return access;
    } catch (error) {
      console.error('Error refreshing token:', error);
      await signOut();
      navigation.navigate('SignIn');
    }
  };

  const fetchUserData = async () => {
    try {
      let token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.error('No token found');
        return;
      }
      const response = await axios.get(`${API_BASE_URL}/api/users/get-info/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFirstName(response.data.first_name);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        const newToken = await refreshToken();
        if (newToken) {
          fetchUserData();
        }
      } else {
        console.error('Error fetching user data:', error.response ? error.response.data : error.message);
      }
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Mock data - replace with actual API calls
  const upcomingBookings = [
    { id: '1', sitter: 'Jane Doe', pet: 'Max (Dog)', date: '2023-05-15', time: '14:00' },
    { id: '2', sitter: 'John Smith', pet: 'Whiskers (Cat)', date: '2023-05-17', time: '10:00' },
  ];

  const IconComponent = Platform.OS === 'web'
    ? ({ name, ...props }) => <MaterialCommunityIcons name={name} {...props} />
    : List.Icon;

  const Content = () => (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
      <View style={styles.cardContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <Title>Welcome back, {firstName}!</Title>
            <Paragraph>Here's an overview of your upcoming pet care services.</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title>Upcoming Bookings</Title>
            {upcomingBookings.map((booking) => (
              <TouchableOpacity
                key={booking.id}
                onPress={() => navigation.navigate('BookingDetails', { bookingId: booking.id })}
              >
                <List.Item
                  title={`${booking.pet} with ${booking.sitter}`}
                  description={`${booking.date} at ${booking.time}`}
                  left={(props) => <IconComponent {...props} icon="calendar" name="calendar" />}
                  right={(props) => <IconComponent {...props} icon="chevron-right" name="chevron-right" />}
                />
              </TouchableOpacity>
            ))}
          </Card.Content>
          <Card.Actions>
            <Button onPress={() => navigation.navigate('MyBookings')}>View All Bookings</Button>
          </Card.Actions>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title>Quick Actions</Title>
            <View style={styles.quickActions}>
              <Button 
                icon={Platform.OS === 'web' ? ({ size, color }) => <MaterialCommunityIcons name="magnify" size={size} color={color} /> : "magnify"}
                mode="outlined" 
                onPress={() => navigation.navigate('SearchSitters')}
                style={styles.quickActionButton}
              >
                Find a Sitter
              </Button>
              <Button 
                icon={Platform.OS === 'web' ? ({ size, color }) => <MaterialCommunityIcons name="paw" size={size} color={color} /> : "paw"}
                mode="outlined" 
                onPress={() => navigation.navigate('MyPets')}
                style={styles.quickActionButton}
              >
                My Pets
              </Button>
            </View>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );

  return (
    <CrossPlatformView fullWidthHeader={true}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
      </View>
      <Content />
    </CrossPlatformView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  safeArea: {
    flex: 0,
    backgroundColor: '#f0f0f0',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: Platform.OS === 'web' ? 0 : 80,
    paddingTop: 16,
  },
  cardContainer: {
    maxWidth: Platform.OS === 'web' ? 800 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  card: {
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  quickActionButton: {
    marginVertical: Platform.OS === 'web' ? 0 : 8,
    marginHorizontal: Platform.OS === 'web' ? 4 : 0,
  },
  header: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: Platform.OS === 'web' ? undefined : 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: theme.colors.text,
  },
});

export default Dashboard;
