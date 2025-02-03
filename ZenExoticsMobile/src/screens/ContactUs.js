import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { theme } from '../styles/theme';
import BackHeader from '../components/BackHeader';
import CrossPlatformView from '../components/CrossPlatformView';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { API_BASE_URL } from '../config/config';
import { AuthContext } from '../context/AuthContext';
import { useForm, ValidationError } from '@formspree/react';

const { width } = Dimensions.get('window');
const inputWidth = Platform.OS === 'web' ? 600 : '90%';
const contentMaxWidth = Platform.OS === 'web' ? '800px' : '100%';

const ContactUs = () => {
  const navigation = useNavigation();
  const { is_prototype } = useContext(AuthContext);
  const [state, handleFormspreeSubmit] = useForm("mkgobpro");
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

    if (is_prototype) {
      // Use Formspree in prototype mode
      try {
        await handleFormspreeSubmit({
          name,
          email,
          message
        });
        
        if (state.succeeded) {
          setSuccessMessage('Your message has been sent successfully!');
          setName('');
          setEmail('');
          setMessage('');
        }
      } catch (error) {
        setSuccessMessage('Failed to send message. Please try again later.');
        console.error(error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Use backend API in production mode
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
    }
  };

  // Show success message from either Formspree or backend
  if (is_prototype && state.succeeded) {
    return (
      <CrossPlatformView fullWidthHeader={true} contentWidth={contentMaxWidth}>
        <BackHeader title="Contact Us" onBackPress={() => navigation.navigate('More')} />
        <View style={styles.container}>
          <View style={styles.contentWrapper}>
            <Text style={[styles.title, { color: theme.colors.primary }]}>
              Thanks for reaching out!
            </Text>
            <Text style={styles.successMessage}>
              We'll get back to you soon.
            </Text>
          </View>
        </View>
      </CrossPlatformView>
    );
  }

  return (
    <CrossPlatformView 
      fullWidthHeader={true}
      contentWidth={contentMaxWidth}
    >
      <BackHeader 
        title="Contact Us" 
        onBackPress={() => navigation.navigate('More')} 
      />
      <View style={styles.container}>
        <View style={styles.contentWrapper}>
          <Text style={styles.title}>Contact Us</Text>
          <Text style={styles.subtitle}>Get in touch with our support team</Text>
          
          <TextInput
            style={[styles.input, { width: inputWidth }]}
            placeholder="Your Name"
            value={name}
            onChangeText={setName}
            name="name"
          />
          {is_prototype && <ValidationError prefix="Name" field="name" errors={state.errors} />}
          
          <TextInput
            style={[styles.input, { width: inputWidth }]}
            placeholder="Your Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            name="email"
            autoCapitalize="none"
          />
          {is_prototype && <ValidationError prefix="Email" field="email" errors={state.errors} />}
          
          <TextInput
            style={[styles.input, styles.messageInput, { width: inputWidth }]}
            placeholder="Your Message"
            value={message}
            onChangeText={setMessage}
            multiline
            name="message"
          />
          {is_prototype && <ValidationError prefix="Message" field="message" errors={state.errors} />}
          
          {successMessage ? (
            <Text style={[styles.successMessage, { width: inputWidth }]}>
              {successMessage}
            </Text>
          ) : null}
          
          <TouchableOpacity 
            style={[styles.button, { width: inputWidth }]} 
            onPress={handleSubmit}
            disabled={isSubmitting || (is_prototype && state.submitting)}
          >
            <Text style={styles.buttonText}>
              {isSubmitting || (is_prototype && state.submitting) ? 'Sending...' : 'Send Message'}
            </Text>
          </TouchableOpacity>

          <View style={styles.contactInfo}>
            <Text style={styles.contactInfoText}>Or reach us directly:</Text>
            <Text style={styles.contactInfoText}>Email: zam.hh.llc@gmail.com</Text>
            <Text style={styles.contactInfoText}>Phone: 719-510-6341</Text>
          </View>
        </View>
      </View>
    </CrossPlatformView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    // marginBottom: 20,
  },
  contentWrapper: {
    width: '100%',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: Platform.OS === 'web' ? 600 : '100%',
  },
  title: {
    fontSize: theme.fontSizes.largeLarge,
    fontWeight: 'bold',
    marginBottom: 10,
    color: theme.colors.primary,
  },
  subtitle: {
    fontSize: theme.fontSizes.medium,
    marginBottom: 20,
    color: theme.colors.text,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: 5,
    borderColor: theme.colors.border,
    borderWidth: 1,
    padding: 10,
    marginBottom: 15,
    fontSize: theme.fontSizes.medium,
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
    color: theme.colors.whiteText,
    fontSize: theme.fontSizes.mediumLarge,
    fontWeight: 'bold',
  },
  contactInfo: {
    marginTop: 30,
    alignItems: 'center',
  },
  contactInfoText: {
    fontSize: theme.fontSizes.medium,
    marginBottom: 5,
    color: theme.colors.text,
  },
  successMessage: {
    color: theme.colors.success,
    textAlign: 'center',
    marginBottom: 10,
    fontSize: theme.fontSizes.medium,
  },
});

export default ContactUs;
