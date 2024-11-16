import React from 'react';
import { View, StyleSheet, Platform, SafeAreaView, Text, TouchableOpacity, StatusBar } from 'react-native';
import { List, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

const Settings = ({ navigation }) => {
  const settingsItems = [
    { title: 'Change Password', icon: 'lock-reset', route: 'ChangePassword' },
    // { title: 'Notification Preferences', icon: 'bell-outline', route: 'NotificationPreferences' },
    // { title: 'Privacy Settings', icon: 'shield-account', route: 'PrivacySettings' },
    // { title: 'Language', icon: 'translate', route: 'LanguageSettings' },
    // { title: 'Display & Accessibility', icon: 'palette', route: 'DisplaySettings' },
    // { title: 'Data Usage', icon: 'chart-bar', route: 'DataUsage' },
    // { title: 'About', icon: 'information-outline', route: 'About' },
  ];

  const renderSettingsItems = () => {
    return settingsItems.map((item, index) => (
      <React.Fragment key={index}>
        <List.Item
          title={item.title}
          left={props => 
            Platform.OS === 'web' 
              ? <MaterialCommunityIcons name={item.icon} size={24} color={theme.colors.primary} />
              : <List.Icon {...props} icon={item.icon} />
          }
          onPress={() => navigation.navigate(item.route)}
          style={Platform.OS === 'web' ? styles.webListItem : null}
        />
        {index < settingsItems.length - 1 && <Divider />}
      </React.Fragment>
    ));
  };

  const renderContent = () => (
    <List.Section style={styles.listSection}>
      {renderSettingsItems()}
    </List.Section>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.navigate('More')} style={styles.backButton}>
        <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.primary} />
      </TouchableOpacity>
      <Text style={styles.headerText}>Settings</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <View style={Platform.OS === 'web' ? styles.webContent : styles.content}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  content: {
    flex: 1,
  },
  listSection: {
    backgroundColor: theme.colors.surface,
  },
  webContent: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    padding: 16,
  },
  webListItem: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    marginRight: 16,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
});

export default Settings;
