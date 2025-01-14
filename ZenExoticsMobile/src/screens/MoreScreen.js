import React, { useContext } from 'react';
import { View, StyleSheet, Alert, Platform, SafeAreaView, StatusBar } from 'react-native';
import { List, Divider, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { AuthContext } from '../context/AuthContext';

const MoreScreen = ({ navigation }) => {
  const { isSignedIn, isApprovedProfessional, userRole, switchRole, signOut } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      await signOut();
      Alert.alert('Logged Out', 'You have been successfully logged out.');
      navigation.navigate('Home');
    } catch (error) {
      console.error('Logout failed', error);
      Alert.alert('Logout Failed', 'An error occurred while logging out.');
    }
  };

  const handleSwitchRole = async () => {
    if (isApprovedProfessional) {
      const newRole = userRole === 'professional' ? 'petOwner' : 'professional';
      console.log('Current role:', userRole);
      console.log('Switching to:', newRole);
      
      await switchRole();
      
      // Add a small delay to ensure state is updated before navigation
      setTimeout(() => {
        console.log('Navigating to:', newRole === 'professional' ? 'ProfessionalDashboard' : 'Dashboard');
        navigation.navigate(newRole === 'professional' ? 'ProfessionalDashboard' : 'Dashboard');
      }, 0);
    } else {
      Alert.alert('Not Approved', 'You are not approved as a professional yet.');
      navigation.navigate('BecomeProfessional');
    }
  };

  const menuItems = {
    notSignedIn: [
      { title: 'Privacy Policy', icon: 'shield-account', route: 'PrivacyPolicy' },
      { title: 'Terms of Service', icon: 'file-document', route: 'TermsOfService' },
      // ADD after MVP is released
    //   { title: 'Help/FAQ', icon: 'help-circle', route: 'HelpFAQ' },
    //   { title: 'Contact Us', icon: 'email', route: 'ContactUs' },
    //   { title: 'Settings', icon: 'cog', route: 'Settings' },
    ],
    petOwner: [
      { title: 'Profile', icon: 'account', route: 'MyProfile' },
      { title: 'My Bookings', icon: 'calendar-clock', route: 'MyBookings' },
      { title: 'Payment Methods', icon: 'credit-card', route: 'PaymentMethods' },
      { title: 'Become a Professional', icon: 'account-tie', route: 'BecomeProfessional' },
      { title: 'Settings', icon: 'cog', route: 'Settings' },
      { title: 'Privacy Policy', icon: 'shield-account', route: 'PrivacyPolicy' },
      { title: 'Terms of Service', icon: 'file-document', route: 'TermsOfService' },
      { title: 'Contact Us', icon: 'email', route: 'ContactUs' },
    ],
    professional: [
      { title: 'Profile', icon: 'account', route: 'MyProfile' },
      { title: 'My Services', icon: 'briefcase-outline', route: 'ServiceManager' },
      { title: 'My Bookings', icon: 'calendar-clock', route: 'MyBookings' },
      { title: 'My Pets', icon: 'paw', route: 'MyPets' },
      { title: 'Payment Methods', icon: 'credit-card', route: 'PaymentMethods' },
      { title: 'Settings', icon: 'cog', route: 'Settings' },
      { title: 'Privacy Policy', icon: 'shield-account', route: 'PrivacyPolicy' },
      { title: 'Terms of Service', icon: 'file-document', route: 'TermsOfService' },
      { title: 'Contact Us', icon: 'email', route: 'ContactUs' },
    ],
  };

  const renderMenuItems = () => {
    let items;
    if (!isSignedIn) {
      items = menuItems.notSignedIn;
    } else if (userRole === 'professional') {
      items = menuItems.professional;
    } else {
      items = menuItems.petOwner;
    }

    return items.map((item, index) => (
      <List.Item
        key={index}
        title={item.title}
        left={props => 
          Platform.OS === 'web' 
            ? <MaterialCommunityIcons name={item.icon} size={24} color={theme.colors.primary} />
            : <List.Icon {...props} icon={item.icon} />}
        onPress={() => navigation.navigate(item.route)}
        style={Platform.OS === 'web' ? styles.webListItem : null}
      />
    ));
  };

  const renderWebView = () => (
    <View style={styles.webContainer}>
      <View style={styles.webContent}>
        <List.Section style={styles.webListSection}>
          {renderMenuItems()}
        </List.Section>
        {isSignedIn && isApprovedProfessional && (
          <View style={styles.webButtonContainer}>
            <Button mode="outlined" onPress={handleSwitchRole} style={styles.webButton}>
              Switch to {userRole === 'professional' ? 'Pet Owner' : 'Professional'} Mode
            </Button>
          </View>
        )}
        {isSignedIn && (
          <View style={styles.webButtonContainer}>
            <Button mode="contained" onPress={handleLogout} style={[styles.webButton, styles.logoutButton]}>
              Log Out
            </Button>
          </View>
        )}
      </View>
    </View>
  );

  const renderMobileView = () => (
    <SafeAreaView style={styles.container}>
      <List.Section>
        {renderMenuItems()}
      </List.Section>
      {isSignedIn && isApprovedProfessional && (
        <View style={styles.switchRoleButtonContainer}>
          <Button mode="outlined" onPress={handleSwitchRole} style={styles.switchRoleButton}>
            Switch to {userRole === 'professional' ? 'Pet Owner' : 'Professional'} Mode
          </Button>
        </View>
      )}
      {isSignedIn && (
        <View style={styles.logoutButtonContainer}>
          <Button mode="contained" onPress={handleLogout} style={styles.logoutButton}>
            Log Out
          </Button>
        </View>
      )}
    </SafeAreaView>
  );

  return Platform.OS === 'web' ? renderWebView() : renderMobileView();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  logoutButtonContainer: {
    padding: 16,
  },
  logoutButton: {
    backgroundColor: theme.colors.error,
  },
  switchRoleButtonContainer: {
    padding: 16,
  },
  switchRoleButton: {
    borderColor: theme.colors.primary,
  },
  // Web-specific styles
  webContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webContent: {
    width: '100%',
    maxWidth: 600,
    padding: 16,
  },
  webListSection: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    marginBottom: 16,
  },
  webListItem: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  webButtonContainer: {
    marginBottom: 16,
  },
  webButton: {
    width: '100%',
  },
});

export default MoreScreen;
