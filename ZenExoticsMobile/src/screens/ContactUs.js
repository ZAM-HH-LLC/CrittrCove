import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../styles/theme';
import axios from 'axios';
import { API_BASE_URL } from '../config/config';
import BackHeader from '../components/BackHeader';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const inputWidth = Platform.OS === 'web' ? '40%' : '90%';

const ContactUs = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async () => {
    if (!name || !email || !message) {
      setSuccessMessage('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage('');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/users/contact/`, {
        name,
        email,
        message
      });

      if (response.status === 200) {
        setSuccessMessage('Your message has been sent successfully!');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      setSuccessMessage(error.response?.data?.error || 'Failed to send message. Please try again later.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackHeader 
        title="Contact Us" 
        onBackPress={() => navigation.navigate('More')} 
      />
      <View style={styles.container}>
        <Text style={styles.title}>Contact Us</Text>
        <Text style={styles.subtitle}>Get in touch with our support team</Text>
        
        <TextInput
          style={[styles.input, { width: inputWidth }]}
          placeholder="Your Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={[styles.input, { width: inputWidth }]}
          placeholder="Your Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={[styles.input, styles.messageInput, { width: inputWidth }]}
          placeholder="Your Message"
          value={message}
          onChangeText={setMessage}
          multiline
        />
        
        {successMessage ? (
          <Text style={[styles.successMessage, { width: inputWidth }]}>
            {successMessage}
          </Text>
        ) : null}
        
        <TouchableOpacity 
          style={[styles.button, { width: inputWidth }]} 
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </Text>
        </TouchableOpacity>

        <View style={styles.contactInfo}>
          <Text style={styles.contactInfoText}>Or reach us directly:</Text>
          <Text style={styles.contactInfoText}>Email: zam.hh.llc@gmail.com</Text>
          <Text style={styles.contactInfoText}>Phone: 719-510-6341</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: theme.colors.primary,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: theme.colors.text,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  messageInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  contactInfo: {
    marginTop: 30,
    alignItems: 'center',
  },
  contactInfoText: {
    fontSize: 16,
    marginBottom: 5,
    color: theme.colors.text,
  },
  successMessage: {
    color: theme.colors.success,
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 16,
  },
});

export default ContactUs;
