// theme.js
import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6A6C51', // Primary color for buttons and header background
    secondary: '#516C61',
    background: '#f6f6f6',
    calendarColor: '#A99E6B', // Olive color for calendar (partially unavailable, available)
    calendarColorYellowBrown: '#8A8C6D', // Yellow-brown color for calendar (booked today, but time is available)
    text: 'black', // Text color for text bodies
    whiteText: 'white', // Text color for headers and buttons
    placeHolderText: '#A9A9A9',
    accent: '#03dac4', // Accent color if needed
    error: '#B00020',
    surface: '#f6f6f6',
    border: '#6A6C51',
    // headerBorder: '#e0e0e0',
    danger: '#A52A2A',
  },
  fontSizes: {
    small: 12,
    medium: 16,
    large: 20,
  },
  spacing: {
    small: 8,
    medium: 16,
    large: 24,
  },
};