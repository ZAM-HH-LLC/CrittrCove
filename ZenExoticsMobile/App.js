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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNavigationContainerRef } from '@react-navigation/native';

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
import BlogScreen from './src/screens/BlogScreen';
import BlogPost from './src/screens/BlogPost';

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
  { name: 'Blog', component: BlogScreen },
  { name: 'BlogPost', component: BlogPost },
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
      Blog: 'Blog',
      BlogPost: 'BlogPost',
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

export const navigationRef = createNavigationContainerRef();

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

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
  const { checkAuthStatus, is_DEBUG } = useContext(AuthContext);
  const [initialRoute, setInitialRoute] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Run this effect only once on mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // First check auth status
        const authStatus = await checkAuthStatus();
        let route = 'Home'; // Default route

        if (authStatus.isSignedIn) {
          if (is_DEBUG) {
            console.log('Auth status on init:', authStatus);
          }
          route = authStatus.userRole === 'professional' && authStatus.isApprovedProfessional
            ? 'ProfessionalDashboard'
            : 'Dashboard';
        }

        // Check stored route based on platform
        if (Platform.OS === 'web') {
          const storedRoute = sessionStorage.getItem('lastRoute');
          // Only use stored route if user is authenticated and it's not the home page
          if (authStatus.isSignedIn && storedRoute && storedRoute !== 'Home') {
            route = storedRoute;
          }

          // Set up route storage for next reload
          window.onbeforeunload = () => {
            const currentPath = window.location.pathname.slice(1) || route;
            sessionStorage.setItem('lastRoute', currentPath);
          };

          // Clean URL if needed
          if (window.location.search) {
            window.history.replaceState({}, '', `/${route}`);
          }
        } else {
          // For mobile platforms, use AsyncStorage
          const storedRoute = await AsyncStorage.getItem('lastRoute');
          if (authStatus.isSignedIn && storedRoute && storedRoute !== 'Home') {
            route = storedRoute;
          }
          // Store the new route
          await AsyncStorage.setItem('lastRoute', route);
        }

        setInitialRoute(route);
      } catch (error) {
        console.error('Error initializing app:', error);
        setInitialRoute('Home');
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []); // Only run on mount, remove checkAuthStatus from dependencies

  // Handle route changes without triggering auth checks
  useEffect(() => {
    if (!isLoading && initialRoute && Platform.OS !== 'web') {
      AsyncStorage.setItem('lastRoute', initialRoute)
        .catch(error => console.error('Error storing route:', error));
    }
  }, [initialRoute, isLoading]);

  if (isLoading || !initialRoute) {
    return null; // Or a loading spinner component
  }

  return (
    <NavigationContainer 
      ref={navigationRef}
      linking={linking}
      onStateChange={async (state) => {
        if (Platform.OS !== 'web' && state?.routes?.length > 0) {
          const currentRoute = state.routes[state.routes.length - 1].name;
          await AsyncStorage.setItem('lastRoute', currentRoute)
            .catch(error => console.error('Error storing route:', error));
        }
      }}
    >
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
