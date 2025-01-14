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
import SearchProfessionals from './src/screens/SearchProfessionals';
import ProfessionalDashboard from './src/screens/ProfessionalDashboard';
import BecomeProfessional from './src/screens/BecomeProfessional';
import MoreScreen from './src/screens/MoreScreen';
import AvailabilitySettings from './src/screens/AvailabilitySettings';
// import Messages from './src/screens/Messages';
import MyPets from './src/screens/MyPets';
import ClientHistory from './src/screens/ClientHistory';
import MessageHistory from './src/screens/MessageHistory';
import PaymentMethods from './src/screens/PaymentMethods';
import Settings from './src/screens/Settings';
import PrivacyPolicy from './src/screens/PrivacyPolicy';
import ProfessionalSettings from './src/screens/ProfessionalSettings';
import TermsOfService from './src/screens/TermsOfService';
import HelpFAQ from './src/screens/HelpFAQ';
import ContactUs from './src/screens/ContactUs';
import Clients from './src/screens/Clients';
import ProfessionalProfile from './src/screens/ProfessionalProfile';
import MyContracts from './src/screens/MyContracts';
import ChangePassword from './src/screens/ChangePassword';
import AddPet from './src/screens/AddPet';
import SearchProfessionalsListing from './src/screens/SearchProfessionalsListing';
import MyBookings from './src/screens/MyBookings';
import BookingDetails from './src/screens/BookingDetails';
import ServiceManagerScreen from './src/screens/ServiceManagerScreen';

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
  { name: 'SearchProfessionals', component: SearchProfessionals },
  { name: 'SearchProfessionalsListing', component: SearchProfessionalsListing },
  { name: 'ClientHistory', component: ClientHistory },
  { name: 'MessageHistory', component: MessageHistory },
  // { name: 'Messages', component: Messages },
  { name: 'ProfessionalDashboard', component: ProfessionalDashboard },
  { name: 'BecomeProfessional', component: BecomeProfessional },
  { name: 'More', component: MoreScreen },
  { name: 'Clients', component: Clients },
  { name: 'AvailabilitySettings', component: AvailabilitySettings },
  { name: 'MyPets', component: MyPets },
  { name: 'PaymentMethods', component: PaymentMethods },
  { name: 'Settings', component: Settings },
  { name: 'PrivacyPolicy', component: PrivacyPolicy },
  { name: 'ProfessionalSettings', component: ProfessionalSettings },
  { name: 'TermsOfService', component: TermsOfService },
  { name: 'HelpFAQ', component: HelpFAQ },
  { name: 'ContactUs', component: ContactUs },
  { name: 'ProfessionalProfile', component: ProfessionalProfile },
  { name: 'MyContracts', component: MyContracts },
  { name: 'ChangePassword', component: ChangePassword },
  { name: 'AddPet', component: AddPet },
  { name: 'MyBookings', component: MyBookings },
  { name: 'BookingDetails', component: BookingDetails },
  { name: 'ServiceManager', component: ServiceManagerScreen },
];

const linking = {
  prefixes: [`${API_BASE_URL}`],
  config: {
    initialRouteName: 'Home',
    screens: {
      Home: 'Home',
      About: 'About',
      ClientProfile: 'ClientProfile',
      MyProfile: 'MyProfile',
      SignIn: 'SignIn',
      SignUp: 'SignUp',
      ResetPassword: 'ResetPassword',
      ResetPasswordConfirm: 'reset-password/:uid/:token',
      Dashboard: 'Dashboard',
      SearchProfessionals: 'SearchProfessionals',
      SearchProfessionalsListing: 'SearchProfessionalsListing',
      ClientHistory: 'ClientHistory',
      MessageHistory: {
        path: 'MessageHistory',
        parse: {
          messageId: (messageId) => messageId || null,
          senderName: (senderName) => senderName || 'Unknown User'
        }
      },
      ProfessionalDashboard: 'ProfessionalDashboard',
      BecomeProfessional: 'BecomeProfessional',
      More: 'More',
      Clients: 'Clients',
      AvailabilitySettings: 'AvailabilitySettings',
      MyPets: 'MyPets',
      PaymentMethods: 'PaymentMethods',
      Settings: 'Settings',
      PrivacyPolicy: 'PrivacyPolicy',
      ProfessionalSettings: 'ProfessionalSettings',
      TermsOfService: 'TermsOfService',
      HelpFAQ: 'HelpFAQ',
      ContactUs: 'ContactUs',
      ProfessionalProfile: {
        path: 'ProfessionalProfile',
        parse: {
          professional: (professional) => undefined
        }
      },
      MyContracts: 'MyContracts',
      ChangePassword: 'ChangePassword',
      AddPet: {
        path: 'AddPet',
        parse: {
          pet: () => undefined
        }
      },
      MyBookings: 'MyBookings',
      BookingDetails: 'BookingDetails',
      ServiceManager: 'ServiceManager',
      '*': '*'
    }
  }
};

const globalStyles = `
  input, textarea {
    outline: none;
    -webkit-tap-highlight-color: transparent;
  }
`;

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
  const [initialRoute, setInitialRoute] = useState('Home');

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
      try {
        const authStatus = await checkAuthStatus();
        if (authStatus.isSignedIn) {
          console.log('authStatus', authStatus);
          if (authStatus.userRole === 'professional' && authStatus.isApprovedProfessional) {
            setInitialRoute('ProfessionalDashboard');
          } else {
            setInitialRoute('Dashboard');
          }
        } else {
          setInitialRoute('Home');
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setInitialRoute('Home');
      }
    };
    checkAuth();
  }, [checkAuthStatus]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      // Create and append style element
      const style = document.createElement('style');
      style.textContent = globalStyles;
      document.head.appendChild(style);

      // Cleanup
      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);

  return (
    <NavigationContainer linking={linking}>
      {Platform.OS === 'web' ? (
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{
            headerShown: true,
            header: ({ navigation }) => <Navigation navigation={navigation} />,
            ...TransitionPresets.SlideFromRightIOS,
            presentation: 'card',
            animation: 'slide_from_right'
          }}
        >
          {screens.map(screen => (
            <Stack.Screen 
              key={screen.name}
              name={screen.name} 
              component={screen.component}
              options={{
                headerShown: true,
                animation: 'slide_from_right'
              }}
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
