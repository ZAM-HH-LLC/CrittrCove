import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, SafeAreaView, StatusBar, TextInput, Text } from 'react-native';
import { Button, Card, Paragraph, useTheme, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Import the icon library
import { theme } from '../styles/theme';
import RequestBookingModal from '../components/RequestBookingModal';
import { mockPets } from '../data/mockData';
import { createBooking } from '../data/mockData';

const MessageHistory = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { messageId = null, senderName = 'Unknown User', services = ['Pet Sitting','Pet Walking', 'Pet Grooming'] } = route?.params || {};
  const [newMessage, setNewMessage] = useState('');
  const inputRef = useRef(null);
  const [isSending, setIsSending] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const IS_CLIENT = false; // This should come from your auth context

  useEffect(() => {
    if (!messageId) {
      navigation.replace('Messages');
    }
  }, [messageId, navigation]);

  // Mock data - replace with actual data from your backend
  const [messages, setMessages] = useState([
    { id: '1', sender: 'John Doe', content: 'Hello, how are you?', timestamp: '2023-05-15 14:00' },
    { id: '2', sender: 'Me', content: 'I\'m doing well, thanks! How about you?', timestamp: '2023-05-15 14:05' },
    { id: '3', sender: 'John Doe', content: 'Great! Just wondering about our next appointment.', timestamp: '2023-05-15 14:10' },
  ]);

  const renderMessage = useCallback(({ item }) => (
    <View style={item.sender === 'Me' ? styles.sentMessageContainer : styles.receivedMessageContainer}>
      <Text style={[
        styles.senderAbove,
        item.sender === 'Me' ? styles.sentSenderName : styles.receivedSenderName
      ]}>
        {item.sender === 'Me' ? 'Me' : senderName}
      </Text>
      <Card style={[styles.messageCard, item.sender === 'Me' ? styles.sentMessage : styles.receivedMessage]}>
        <Card.Content>
          <Paragraph style={item.sender === 'Me' ? styles.sentMessageText : styles.receivedMessageText}>
            {item.content}
          </Paragraph>
        </Card.Content>
      </Card>
      <Text style={[
        styles.timestampBelow,
        item.sender === 'Me' ? styles.sentTimestamp : styles.receivedTimestamp
      ]}>
        {item.timestamp}
      </Text>
    </View>
  ), []);

  const simulateMessageSend = async (messageContent) => {
    try {
      // Simulate API call
      const messageData = {
        messageId: messageId,
        content: messageContent,
        sender: 'Me',
        timestamp: new Date().toISOString(),
        recipientName: senderName
      };

      // Simulated API call
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({ status: 200, data: messageData });
        }, 1000);
      });

      console.log('Message sent:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const WebInput = () => {
    const [newMessage, setNewMessage] = useState('');
    const inputRef = useRef(null);

    const handleSend = async () => {
      if (newMessage.trim() && !isSending) {
        setIsSending(true);
        try {
          await simulateMessageSend(newMessage.trim());
          const newMsg = {
            id: Date.now().toString(),
            sender: 'Me',
            content: newMessage.trim(),
            timestamp: new Date().toLocaleString(),
          };
          setMessages(prevMessages => [...prevMessages, newMsg]);
          setNewMessage('');
        } catch (error) {
          // Handle error (could add error state/toast here)
          console.error('Failed to send message:', error);
        } finally {
          setIsSending(false);
        }
      }
    };

    return (
      <View style={styles.inputContainer}>
        <textarea
          ref={inputRef}
          style={styles.webInput}
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          rows={1}
          disabled={isSending}
        />
        <Button 
          mode="contained" 
          onPress={handleSend} 
          disabled={isSending}
        >
          {isSending ? (
            <ActivityIndicator color={theme.colors.whiteText} size="small" />
          ) : (
            'Send'
          )}
        </Button>
      </View>
    );
  };

  const MobileInput = () => {
    const [newMessage, setNewMessage] = useState('');
    const inputRef = useRef(null);

    const handleSend = async () => {
      if (newMessage.trim() && !isSending) {
        setIsSending(true);
        try {
          await simulateMessageSend(newMessage.trim());
          const newMsg = {
            id: Date.now().toString(),
            sender: 'Me',
            content: newMessage.trim(),
            timestamp: new Date().toLocaleString(),
          };
          setMessages(prevMessages => [...prevMessages, newMsg]);
          setNewMessage('');
        } catch (error) {
          // Handle error (could add error state/toast here)
          console.error('Failed to send message:', error);
        } finally {
          setIsSending(false);
        }
      }
    };

    return (
      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          blurOnSubmit={false}
          editable={!isSending}
        />
        <Button 
          mode="contained" 
          onPress={handleSend}
          disabled={isSending}
        >
          {isSending ? (
            <ActivityIndicator color={theme.colors.primary} size="small" />
          ) : (
            'Send'
          )}
        </Button>
      </View>
    );
  };

  const MessageInput = Platform.OS === 'web' ? <WebInput /> : <MobileInput />;
  
  const handleRequestBooking = async () => {
    if (IS_CLIENT) {
      setShowRequestModal(true);
    } else {
      // For professionals, create a new booking and navigate
      try {
        // Create new booking with minimal info
        const bookingId = await createBooking(
          'client123', // Replace with actual client ID
          'freelancer123', // Replace with actual freelancer ID
          {
            professionalName: senderName,
            clientName: 'Me', // Should come from auth context
            status: 'Pending',
            serviceType: services[0], // Default to first service
          }
        );

        console.log('Created booking with ID:', bookingId);
        
        navigation.navigate('BookingDetails', {
          bookingId: bookingId,
          initialData: null // We don't need initialData since the booking is already created
        });
      } catch (error) {
        console.error('Error creating booking:', error);
        Alert.alert(
          'Error',
          'Unable to create booking. Please try again.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const handleModalSubmit = async (modalData) => {
    try {
      // Create new booking
      const bookingId = await createBooking(
        'client123', // Replace with actual client ID
        'freelancer123', // Replace with actual freelancer ID
        {
          ...modalData,
          professionalName: senderName,
          clientName: 'Me', // Should come from auth context
          status: 'Pending',
        }
      );

      console.log('Created booking with ID:', bookingId);

      setShowRequestModal(false);
      navigation.navigate('BookingDetails', {
        bookingId: bookingId,
        initialData: null // We don't need initialData since the booking is already created
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      Alert.alert(
        'Error',
        'Unable to create booking. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <Button onPress={() => navigation.navigate('Messages')} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.primary} />
        </Button>
        <Text style={styles.headerText}>{senderName} - {services.join(', ')}</Text>
      </View>
      <View style={styles.bookingHeaderContainer}>
        <Button 
          mode="contained"
          style={styles.requestBookingButton}
          labelStyle={styles.requestBookingButtonText}
          onPress={handleRequestBooking}
        >
          Request Booking
        </Button>
      </View>
    </>
  );

  return (
    <SafeAreaView style={[styles.container, Platform.OS === 'android' && styles.androidSafeArea]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === "web" ? 0 : 80}
      >
        {renderHeader()}
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messageList}
        />
        {MessageInput}
      </KeyboardAvoidingView>
      
      <RequestBookingModal
        visible={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSubmit={handleModalSubmit}
        services={services}
        pets={mockPets} // Replace with actual pets from your auth context
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingBottom: 10,
  },
  androidSafeArea: {
    paddingTop: StatusBar.currentHeight,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messageList: {
    padding: 16,
    paddingBottom: 80,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
    backgroundColor: theme.colors.backgroundContrast,
    height: '100%',
  },
  messageCard: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.primary,
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.surface,
  },
  sentMessageContainer: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  receivedMessageContainer: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  senderAbove: {
    fontWeight: 'bold',
    marginBottom: 4,
    fontSize: 12,
  },
  sentSenderName: {
    alignSelf: 'flex-end',
  },
  receivedSenderName: {
    alignSelf: 'flex-start',
  },
  timestampBelow: {
    fontSize: 12,
    color: theme.colors.placeholder,
    marginTop: 4,
  },
  sentTimestamp: {
    alignSelf: 'flex-end',
  },
  receivedTimestamp: {
    alignSelf: 'flex-start',
  },
  sentMessageText: {
    color: theme.colors.whiteText,
  },
  receivedMessageText: {
    color: theme.colors.text,
  },
  inputContainer: {
    flexDirection: 'row',
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
    padding: 8,
    backgroundColor: theme.colors.backgroundContrast,
    borderTopWidth: 1,
    borderTopColor: theme.colors.disabled,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 8,
    paddingVertical: 8,
    maxHeight: 100,
  },
  webInput: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 8,
    paddingVertical: 8,
    maxHeight: 100,
    overflowY: 'auto',
    border: '1px solid #ccc',
    borderRadius: 4,
    outline: 'none',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    resize: 'none',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    justifyContent: 'space-between', // This will help in centering the text
  },
  backButton: {
    marginLeft: -16,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 50, 
    color: theme.colors.primary,
    flex: 1, // This will allow the text to take up available space
    textAlign: 'center', // Center the text within its flex container
  },
  bookingHeaderContainer: {
    width: '100%',
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    padding: 12,
    alignItems: 'center',
  },
  requestBookingButton: {
    maxWidth: 500,
    width: '100%',
    borderRadius: 25, // Makes it more rounded
    height: 45,
    justifyContent: 'center',
  },
  requestBookingButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MessageHistory;
