import React, { useState, useEffect, useContext } from 'react';
import { View, ScrollView, StyleSheet, Platform, SafeAreaView, Dimensions, StatusBar, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, List, Button, useTheme, Appbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { API_BASE_URL } from '../config/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const SitterDashboard = ({ navigation }) => {
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
      if (error.response && error.response.status === 401) {
        const newToken = await refreshToken();
        if (newToken) {
          fetchUserName();
        }
      } else {
        console.error('Error fetching user name:', error.response ? error.response.data : error.message);
      }
    }
  };

  useEffect(() => {
    fetchUserName();
  }, []);

  // TODO: Fetch upcoming bookings from the backend
  const upcomingBookings = [
    { id: '1', client: 'John Doe', pet: 'Max (Dog)', date: '2023-05-15', time: '14:00' },
    { id: '2', client: 'Jane Smith', pet: 'Whiskers (Cat)', date: '2023-05-17', time: '10:00' },
  ];

  // TODO: Fetch client requests from the backend
  const clientRequests = [
    { id: '1', client: 'Alice Johnson', pet: 'Fluffy (Rabbit)', date: '2023-05-20', time: '09:00' },
    { id: '2', client: 'Bob Williams', pet: 'Spike (Iguana)', date: '2023-05-22', time: '16:00' },
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
            <Paragraph>Here's an overview of your upcoming activities.</Paragraph>
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
                  title={`${booking.client} - ${booking.pet}`}
                  description={`${booking.date} at ${booking.time}`}
                  left={(props) => <IconComponent {...props} icon="calendar" name="calendar" />}
                  right={(props) => <IconComponent {...props} icon="chevron-right" name="chevron-right" />}
                />
              </TouchableOpacity>
            ))}
          </Card.Content>
          <Card.Actions>
            <Button onPress={() => navigation.navigate('ManageBookings')}>View All Bookings</Button>
          </Card.Actions>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title>Client Requests</Title>
            {clientRequests.map((request) => (
              <TouchableOpacity
                key={request.id}
                onPress={() => navigation.navigate('RequestDetails', { requestId: request.id })}
              >
                <List.Item
                  title={`${request.client} - ${request.pet}`}
                  description={`${request.date} at ${request.time}`}
                  left={(props) => <IconComponent {...props} icon="account-clock" name="account-clock" />}
                  right={(props) => <IconComponent {...props} icon="chevron-right" name="chevron-right" />}
                />
              </TouchableOpacity>
            ))}
          </Card.Content>
          <Card.Actions>
            <Button onPress={() => navigation.navigate('ClientRequests')}>View All Requests</Button>
          </Card.Actions>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title>Quick Actions</Title>
            <View style={styles.quickActions}>
              <Button 
                icon={Platform.OS === 'web' ? ({ size, color }) => <MaterialCommunityIcons name="clock" size={size} color={color} /> : "clock"}
                mode="outlined" 
                onPress={() => navigation.navigate('AvailabilitySettings')}
                style={styles.quickActionButton}
              >
                {Platform.OS === 'web' ? 'Update Availability' : 'Availability'}
              </Button>
              <Button 
                icon={Platform.OS === 'web' ? ({ size, color }) => <MaterialCommunityIcons name="cash" size={size} color={color} /> : "cash"}
                mode="outlined" 
                onPress={() => navigation.navigate('Earnings')}
                style={styles.quickActionButton}
              >
                {Platform.OS === 'web' ? 'View Earnings' : 'Earnings'}
              </Button>
            </View>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {Platform.OS !== 'web' && <SafeAreaView style={styles.safeArea} />}
      <Appbar.Header>
        <Appbar.Content title="Sitter Dashboard" />
      </Appbar.Header>
      <Content />
    </View>
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 16,
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
});

export default SitterDashboard;
