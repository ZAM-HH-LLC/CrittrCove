import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, SafeAreaView, StatusBar, TextInput, Text, TouchableOpacity } from 'react-native';
import { Button, Card, Paragraph, useTheme, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Import the icon library
import { theme } from '../styles/theme';
import RequestBookingModal from '../components/RequestBookingModal';
import { mockPets } from '../data/mockData';
import { createBooking } from '../data/mockData';

const MessageHistory = ({ navigation }) => {
  const { colors } = useTheme();
  const [messages, setMessages] = useState([
    { id: '1', sender: 'John Doe', content: 'Hello, how are you?', timestamp: '2023-05-15 14:00' },
    { id: '2', sender: 'Me', content: 'I\'m doing well, thanks! How about you?', timestamp: '2023-05-15 14:05' },
    { id: '3', sender: 'John Doe', content: 'Great! Just wondering about our next appointment.', timestamp: '2023-05-15 14:10' },
  ]);
  
  const [isSending, setIsSending] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const IS_CLIENT = false; // This should come from your auth context

  const renderMessage = useCallback(({ item }) => (
    <View style={item.sender === 'Me' ? styles.sentMessageContainer : styles.receivedMessageContainer}>
      <Text style={[
        styles.senderAbove,
        item.sender === 'Me' ? styles.sentSenderName : styles.receivedSenderName
      ]}>
        {item.sender}
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
      const messageData = {
        content: messageContent,
        sender: 'Me',
        timestamp: new Date().toISOString(),
      };

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
    const [message, setMessage] = useState('');
    const inputRef = useRef(null);

    const handleSend = async () => {
      if (message.trim() && !isSending) {
        setIsSending(true);
        try {
          await simulateMessageSend(message.trim());
          const newMsg = {
            id: Date.now().toString(),
            sender: 'Me',
            content: message.trim(),
            timestamp: new Date().toLocaleString(),
          };
          setMessages(prevMessages => [...prevMessages, newMsg]);
          setMessage('');
        } catch (error) {
          console.error('Failed to send message:', error);
        } finally {
          setIsSending(false);
        }
      }
    };

    return (
      <View style={styles.inputInnerContainer}>
        <textarea
          ref={inputRef}
          style={styles.webInput}
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={1}
          disabled={isSending}
        />
        <Button 
          mode="contained" 
          onPress={handleSend} 
          disabled={isSending}
          style={styles.sendButton}
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
    const [message, setMessage] = useState('');
    const inputRef = useRef(null);

    const handleSend = async () => {
      if (message.trim() && !isSending) {
        setIsSending(true);
        try {
          await simulateMessageSend(message.trim());
          const newMsg = {
            id: Date.now().toString(),
            sender: 'Me',
            content: message.trim(),
            timestamp: new Date().toLocaleString(),
          };
          setMessages(prevMessages => [...prevMessages, newMsg]);
          setMessage('');
        } catch (error) {
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
          value={message}
          onChangeText={setMessage}
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
      try {
        const bookingId = await createBooking(
          'client123',
          'freelancer123',
          {
            professionalName: 'Professional Name',
            clientName: 'Me',
            status: 'Pending',
            serviceType: 'Pet Sitting',
          }
        );

        console.log('Created booking with ID:', bookingId);
        
        navigation.navigate('BookingDetails', {
          bookingId: bookingId,
          initialData: null
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
      const bookingId = await createBooking(
        'client123',
        'freelancer123',
        {
          ...modalData,
          professionalName: 'Professional Name',
          clientName: 'Me',
          status: 'Pending',
        }
      );

      console.log('Created booking with ID:', bookingId);

      setShowRequestModal(false);
      navigation.navigate('BookingDetails', {
        bookingId: bookingId,
        initialData: null
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

  // Add new state for conversations list
  const [conversations, setConversations] = useState([
    { 
      id: '1', 
      name: 'John Doe', 
      lastMessage: 'Hello, how are you?', 
      timestamp: '2023-05-15 14:00',
      bookingStatus: 'Pending', // Can be: null, 'Pending', 'Confirmed', 'Completed'
      unread: true
    },
    { 
      id: '2', 
      name: 'Mary J', 
      lastMessage: 'See you tomorrow!', 
      timestamp: '2023-05-15 13:30',
      bookingStatus: 'Confirmed',
      unread: false
    },
    { 
      id: '3', 
      name: 'Bitch', 
      lastMessage: 'Thanks for the update', 
      timestamp: '2023-05-14 15:20',
      bookingStatus: null,
      unread: false
    },
  ]);
  const [selectedConversation, setSelectedConversation] = useState('1');

  // Add new header component
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>Conversations</Text>
      <Button 
        mode="text" 
        onPress={() => {/* Handle filter */}}
        style={styles.filterButton}
      >
        Filter
      </Button>
    </View>
  );

  // Add conversation list component
  const renderConversationList = () => (
    <View style={styles.conversationListContainer}>
      {conversations.map((conv) => (
        <TouchableOpacity
          key={conv.id}
          style={[
            styles.conversationItem,
            selectedConversation === conv.id && styles.selectedConversation
          ]}
          onPress={() => setSelectedConversation(conv.id)}
        >
          <View style={styles.conversationContent}>
            <View style={styles.conversationHeader}>
              <Text style={styles.conversationName}>{conv.name}</Text>
              <Text style={styles.conversationTime}>{conv.timestamp}</Text>
            </View>
            <Text 
              style={[
                styles.conversationLastMessage,
                conv.unread && styles.unreadMessage
              ]} 
              numberOfLines={1}
            >
              {conv.lastMessage}
            </Text>
            {conv.bookingStatus ? (
              <View style={styles.bookingStatusContainer}>
                <Text style={styles.bookingStatus}>{conv.bookingStatus}</Text>
              </View>
            ) : (
              <Button 
                mode="outlined" 
                onPress={() => handleRequestBooking(conv.id)}
                style={styles.requestBookingButton}
                labelStyle={styles.requestBookingLabel}
              >
                Request Booking
              </Button>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Update the message section to have a fixed input bar
  const renderMessageSection = () => (
    <View style={styles.messageSection}>
      <View style={styles.messagesContainer}>
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messageList}
          inverted={false}
          showsVerticalScrollIndicator={true}
        />
      </View>
      <View style={styles.inputWrapper}>
        <TouchableOpacity style={styles.attachButton}>
          <MaterialCommunityIcons name="plus" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <View style={styles.inputContainer}>
          {Platform.OS === 'web' ? <WebInput /> : <MobileInput />}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <View style={styles.contentContainer}>
        {renderConversationList()}
        {renderMessageSection()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: 50,
    // paddingBottom: 0,
    paddingRight: 100,
    paddingLeft: 100,
    // maxWidth: 1200,
    // alignSelf: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  filterButton: {
    marginLeft: 'auto',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  conversationListContainer: {
    width: '30%',
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  conversationItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  selectedConversation: {
    backgroundColor: theme.colors.primary + '20',
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  conversationName: {
    fontSize: 16,
  },
  messageSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    height: '100%',
  },
  messagesContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  messageList: {
    padding: 16,
    paddingBottom: 80, // Add padding to prevent messages from being hidden behind input
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  attachButton: {
    padding: 8,
  },
  messageInput: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
  },
  sendButton: {
    borderRadius: 20,
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
    // maxWidth: 600,
    // alignSelf: 'center',
    width: '100%',
    padding: 8,
    // backgroundColor: theme.colors.backgroundContrast,
    // borderTopWidth: 1,
    // borderTopColor: theme.colors.disabled,
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
    backgroundColor: 'transparent',
    paddingVertical: 8,
    maxHeight: 100,
    minHeight: 40,
    overflowY: 'auto',
    border: 'none',
    outline: 'none',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    resize: 'none',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationTime: {
    fontSize: 12,
    color: theme.colors.placeholder,
  },
  conversationLastMessage: {
    fontSize: 14,
    color: theme.colors.placeholder,
    marginBottom: 8,
  },
  unreadMessage: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  bookingStatusContainer: {
    backgroundColor: theme.colors.primary + '20',
    padding: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  bookingStatus: {
    fontSize: 12,
    color: theme.colors.primary,
  },
  requestBookingButton: {
    marginTop: 4,
    height: 28,
    alignSelf: 'flex-start',
  },
  requestBookingLabel: {
    fontSize: 12,
    marginVertical: 0,
  },
  messageListContainer: {
    flex: 1,
  },
  inputWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 8,
    zIndex: 1,
  },
  inputInnerContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    paddingLeft: 16,
    marginRight: 8,
  },
  attachButton: {
    padding: 8,
    marginRight: 8,
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    marginLeft: 8,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
  },
});

export default MessageHistory;
