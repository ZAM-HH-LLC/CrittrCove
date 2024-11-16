import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { AuthContext } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appbar, Menu, useTheme } from 'react-native-paper';

export default function Navigation({ navigation }) {
  const [visible, setVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(Dimensions.get('window').width < 900);
  const { colors } = useTheme();
  const { isSignedIn, setIsSignedIn, isApprovedSitter, userRole, signOut } = useContext(AuthContext);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  useEffect(() => {
    const updateLayout = () => {
      setIsMobile(Dimensions.get('window').width < 900);
    };

    const subscription = Dimensions.addEventListener('change', updateLayout);

    return () => {
      subscription?.remove();
    };
  }, []);

  const sittersTitle = Platform.OS === 'web' ? 'Search Sitters' : 'Sitters';

  const handleNavigation = (screenName) => {
    closeMenu();
    navigation.navigate(screenName);
  };

  const renderMenuItems = () => {
    if (!isSignedIn) {
      return [
        { title: 'Home', icon: 'home', onPress: () => handleNavigation('Home') },
        { title: 'Sign In', icon: 'login', onPress: () => handleNavigation('SignIn') },
        { title: 'Sign Up', icon: 'account-plus', onPress: () => handleNavigation('SignUp') },
        { title: 'More', icon: 'dots-horizontal', onPress: () => handleNavigation('More') },
      ];
    } else if (userRole === 'sitter') {
      return [
        { title: 'Dashboard', icon: 'view-dashboard', onPress: () => handleNavigation('SitterDashboard') },
        { title: 'Clients', icon: 'account-group', onPress: () => handleNavigation('Clients') },
        { title: 'Messages', icon: 'message-text', onPress: () => handleNavigation('Messages') },
        { title: 'Availability', icon: 'clock-outline', onPress: () => handleNavigation('AvailabilitySettings') },
        { title: 'More', icon: 'dots-horizontal', onPress: () => handleNavigation('More') },
      ];
    } else {
      return [
        { title: 'Dashboard', icon: 'view-dashboard', onPress: () => handleNavigation('Dashboard') },
        { title: sittersTitle, icon: 'magnify', onPress: () => handleNavigation('SearchSitters') },
        { title: 'Messages', icon: 'message-text', onPress: () => handleNavigation('Messages') },
        { title: 'My Pets', icon: 'paw', onPress: () => handleNavigation('MyPets') },
        { title: 'More', icon: 'dots-horizontal', onPress: () => handleNavigation('More') },
      ];
    }
  };

  const renderMobileNavBar = () => {
    const menuItems = renderMenuItems();
    const itemWidth = Dimensions.get('window').width / menuItems.length;
    return (
      <View style={styles.customNavBar}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.navButton, { width: itemWidth }]}
            onPress={item.onPress}
          >
            <MaterialCommunityIcons 
              name={item.icon} 
              size={24} 
              color={theme.colors.whiteText} 
            />
            <Text style={styles.navText} numberOfLines={2} ellipsizeMode="tail">
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderWebNavItems = () => {
    const menuItems = renderMenuItems();
    return menuItems.map((item, index) => (
      <TouchableOpacity
        key={index}
        style={styles.webNavItem}
        onPress={item.onPress}
      >
        <Text style={styles.webNavText}>{item.title}</Text>
      </TouchableOpacity>
    ));
  };

  return (
    <>
      {Platform.OS === 'web' ? (
        <Appbar.Header style={[styles.header, { backgroundColor: colors.primary }]}>
          <View style={styles.titleContainer}>
            <TouchableOpacity onPress={() => handleNavigation('Home')}>
              <Text style={[styles.title, { color: colors.whiteText }]}>ZenExotics</Text>
            </TouchableOpacity>
          </View>
          {isMobile ? (
            <Menu
              visible={visible}
              onDismiss={closeMenu}
              anchor={
                <Appbar.Action
                  icon={() => <MaterialCommunityIcons name="menu" size={24} color={colors.whiteText} />}
                  onPress={openMenu}
                />
              }
            >
              {renderMenuItems().map((item, index) => (
                <Menu.Item key={index} onPress={item.onPress} title={item.title} />
              ))}
            </Menu>
          ) : (
            <View style={styles.desktopNav}>
              {renderWebNavItems()}
            </View>
          )}
        </Appbar.Header>
      ) : (
        <View style={styles.container}>
          {renderMobileNavBar()}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    // alignItems: 'center',
    // justifyContent: 'center',
    backgroundColor: theme.colors.primary,
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: theme.colors.primary,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'left',
    marginLeft: theme.spacing.medium,
    fontSize: theme.fontSizes.large,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  desktopNav: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  navItem: {
    marginHorizontal: theme.spacing.medium,
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text,
    cursor: 'pointer',
  },
  customNavBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    paddingHorizontal: 5,
  },
  navText: {
    color: theme.colors.whiteText,
    fontSize: theme.fontSizes.small,
    marginTop: 5,
    textAlign: 'center',
  },
  webNavItem: {
    marginHorizontal: theme.spacing.medium,
  },
  webNavText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.whiteText,
  },
});
