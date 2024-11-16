import React, { useEffect, useState, useContext } from 'react';
import { Platform } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Navigation from './src/components/Navigation';
import { theme } from './src/styles/theme';
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import { API_BASE_URL } from './src/config/config';

// Import all your screen components
import HomeScreen from './src/screens/HomeScreen';
import AboutScreen from './src/screens/AboutScreen';
import ClientProfile from './src/screens/ClientProfile';
import MyProfile from './src/screens/MyProfile';
import SignIn from './src/screens/SignIn';
import SignUp from './src/screens/SignUp';
import ResetPassword from './src/screens/ResetPassword';
import ResetPasswordConfirm from './src/screens/ResetPasswordConfirm';
import Dashboard from './src/screens/Dashboard';
import SearchSitters from './src/screens/SearchSitters';
import SitterDashboard from './src/screens/SitterDashboard';
import BecomeSitter from './src/screens/BecomeSitter';
import MoreScreen from './src/screens/MoreScreen';
import AvailabilitySettings from './src/screens/AvailabilitySettings';
import Messages from './src/screens/Messages';
import MyPets from './src/screens/MyPets';
import ClientHistory from './src/screens/ClientHistory';
import MessageHistory from './src/screens/MessageHistory';
import PaymentMethods from './src/screens/PaymentMethods';
import Settings from './src/screens/Settings';
import PrivacyPolicy from './src/screens/PrivacyPolicy';
import SitterSettings from './src/screens/SitterSettings';
import TermsOfService from './src/screens/TermsOfService';
import HelpFAQ from './src/screens/HelpFAQ';
import ContactUs from './src/screens/ContactUs';
import Clients from './src/screens/Clients';
import SitterProfile from './src/screens/SitterProfile';
import MyContracts from './src/screens/MyContracts';
import ChangePassword from './src/screens/ChangePassword';
import AddPet from './src/screens/AddPet';
import SearchSittersListing from './src/screens/SearchSittersListing';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const screens = [
  { name: 'Home', component: HomeScreen },
  { name: 'About', component: AboutScreen },
  { name: 'ClientProfile', component: ClientProfile },
  { name: 'MyProfile', component: MyProfile },  
  { name: 'SignIn', component: SignIn },
  { name: 'SignUp', component: SignUp },
  { name: 'ResetPassword', component: ResetPassword },
  { name: 'ResetPasswordConfirm', component: ResetPasswordConfirm },
  { name: 'Dashboard', component: Dashboard },
  { name: 'SearchSitters', component: SearchSitters },
  { name: 'SearchSittersListing', component: SearchSittersListing },
  { name: 'ClientHistory', component: ClientHistory },
  { name: 'MessageHistory', component: MessageHistory },
  { name: 'SitterDashboard', component: SitterDashboard },
  { name: 'BecomeSitter', component: BecomeSitter },
  { name: 'More', component: MoreScreen },
  { name: 'Clients', component: Clients },
  { name: 'AvailabilitySettings', component: AvailabilitySettings },
  { name: 'Messages', component: Messages },
  { name: 'MyPets', component: MyPets },
  { name: 'PaymentMethods', component: PaymentMethods },
  { name: 'Settings', component: Settings },
  { name: 'PrivacyPolicy', component: PrivacyPolicy },
  { name: 'SitterSettings', component: SitterSettings },
  { name: 'TermsOfService', component: TermsOfService },
  { name: 'HelpFAQ', component: HelpFAQ },
  { name: 'ContactUs', component: ContactUs },
  { name: 'SitterProfile', component: SitterProfile },
  { name: 'MyContracts', component: MyContracts },
  { name: 'ChangePassword', component: ChangePassword },
  { name: 'AddPet', component: AddPet },
];

const linking = {
  prefixes: [`${API_BASE_URL}`],
  config: {
    screens: {
      ResetPasswordConfirm: 'reset-password/:uid/:token',
      AddPet: {
        path: 'AddPet',
        parse: {
          pet: () => undefined
        }
      },
      SitterProfile: {
        path: 'SitterProfile',
        parse: {
          sitter: (sitter) => undefined
        }
      },
      // Add other screen paths as needed
      '*': '*',
    },
  },
};

function TabNavigator() {
  return (
    <Tab.Navigator tabBar={props => <Navigation {...props} />}>
      {screens.map(screen => (
        <Tab.Screen 
          key={screen.name}
          name={screen.name} 
          component={screen.component} 
          options={{ headerShown: false }} 
        />
      ))}
    </Tab.Navigator>
  );
}

function AppContent() {
  const { checkAuthStatus } = useContext(AuthContext);
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      // Store current route before reload
      window.onbeforeunload = () => {
        const currentPath = window.location.pathname.slice(1) || 'Home';
        sessionStorage.setItem('lastRoute', currentPath);
      };

      // Handle page reload
      const lastRoute = sessionStorage.getItem('lastRoute');
      if (lastRoute) {
        setInitialRoute(lastRoute);
        // Clean URL if needed
        if (window.location.search) {
          window.history.replaceState({}, '', `/${lastRoute}`);
        }
      }
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const { isSignedIn, userRole, isApprovedSitter } = await checkAuthStatus();
      if (isSignedIn) {
        if (userRole === 'sitter' && isApprovedSitter) {
          setInitialRoute('SitterDashboard');
        } else {
          setInitialRoute('Dashboard');
        }
      } else {
        setInitialRoute('Home');
      }
    };
    checkAuth();
  }, []);

  if (initialRoute === null) {
    return null; // or a loading screen
  }

  return (
    <NavigationContainer linking={linking}>
      {Platform.OS === 'web' ? (
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{
            header: ({ navigation }) => <Navigation navigation={navigation} />,
            ...TransitionPresets.SlideFromRightIOS,
          }}
        >
          {screens.map(screen => (
            <Stack.Screen 
              key={screen.name}
              name={screen.name} 
              component={screen.component} 
            />
          ))}
        </Stack.Navigator>
      ) : (
        <TabNavigator />
      )}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PaperProvider theme={theme}>
        <AppContent />
      </PaperProvider>
    </AuthProvider>
  );
}
