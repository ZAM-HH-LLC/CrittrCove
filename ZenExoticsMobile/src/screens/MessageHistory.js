import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, SafeAreaView, StatusBar, TextInput, Text } from 'react-native';
import { Button, Card, Paragraph, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Import the icon library
import { theme } from '../styles/theme';

const MessageHistory = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { messageId, senderName } = route.params; // Assuming senderName is passed in route params
  const [newMessage, setNewMessage] = useState('');
  const inputRef = useRef(null);

  // Mock data - replace with actual data from your backend
  const [messages, setMessages] = useState([
    { id: '1', sender: 'John Doe', content: 'Hello, how are you?', timestamp: '2023-05-15 14:00' },
    { id: '2', sender: 'Me', content: 'I\'m doing well, thanks! How about you?', timestamp: '2023-05-15 14:05' },
    { id: '3', sender: 'John Doe', content: 'Great! Just wondering about our next appointment.', timestamp: '2023-05-15 14:10' },
  ]);

  const renderMessage = useCallback(({ item }) => (
    <Card style={[styles.messageCard, item.sender === 'Me' ? styles.sentMessage : styles.receivedMessage]}>
      <Card.Content>
        <Paragraph style={styles.sender}>{item.sender === 'Me' ? 'Me' : senderName}</Paragraph>
        <Paragraph>{item.content}</Paragraph>
        <Paragraph style={styles.timestamp}>{item.timestamp}</Paragraph>
      </Card.Content>
    </Card>
  ), []);

  const WebInput = () => {
    const [newMessage, setNewMessage] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, []);

    const handleSend = () => {
      if (newMessage.trim()) {
        const newMsg = {
          id: Date.now().toString(),
          sender: 'Me',
          content: newMessage.trim(),
          timestamp: new Date().toLocaleString(),
        };
        setMessages(prevMessages => [...prevMessages, newMsg]);
        setNewMessage('');
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
        />
        <Button mode="contained" onPress={handleSend}>Send</Button>
      </View>
    );
  };

  const MobileInput = () => {
    const [newMessage, setNewMessage] = useState('');
    const inputRef = useRef(null);

    const handleSend = () => {
      if (newMessage.trim()) {
        const newMsg = {
          id: Date.now().toString(),
          sender: 'Me',
          content: newMessage.trim(),
          timestamp: new Date().toLocaleString(),
        };
        setMessages(prevMessages => [...prevMessages, newMsg]);
        setNewMessage('');
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
        />
        <Button mode="contained" onPress={handleSend}>Send</Button>
      </View>
    );
  };

  const MessageInput = Platform.OS === 'web' ? <WebInput /> : <MobileInput />;
  
  const renderHeader = () => (
    <View style={styles.header}>
      <Button onPress={() => navigation.navigate('Messages')} style={styles.backButton}>
        <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.primary} />
      </Button>
      {console.log(senderName)}
      <Text style={styles.headerText}>{senderName}</Text>
    </View>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
  },
  messageCard: {
    marginBottom: 8,
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
  sender: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: theme.colors.placeholder,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: theme.colors.surface,
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
});

export default MessageHistory;
