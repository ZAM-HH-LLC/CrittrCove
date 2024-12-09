import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Platform, StatusBar, Dimensions } from 'react-native';
import { Card, Button, IconButton, TextInput, SegmentedButtons, Dialog, Portal, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { theme } from '../styles/theme';
import BackHeader from '../components/BackHeader';
import { useNavigation } from '@react-navigation/native'; 

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAX_WIDTH = 500; // Maximum width for web view

const PaymentMethods = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('pay');
  const [receivePaymentMethods, setReceivePaymentMethods] = useState([]);
  const [payForServicesMethods, setPayForServicesMethods] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmPrimaryDialogVisible, setConfirmPrimaryDialogVisible] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: 'card',
    cardNumber: '',
    expiryDate: '',
    cvc: '',
    accountNumber: '',
    routingNumber: '',
  });
  const { isApprovedSitter } = useContext(AuthContext);
  const [isConfirming, setIsConfirming] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    // Fetch payment methods from backend
    // This is a placeholder. Replace with actual API calls.
    setReceivePaymentMethods([
      { id: '1', type: 'bank', accountNumber: '****1234', routingNumber: '123456789', isPrimary: true },
      { id: '2', type: 'bank', accountNumber: '****5678', routingNumber: '987654321', isPrimary: false },
    ]);
    setPayForServicesMethods([
      { id: '1', type: 'card', last4: '4242', brand: 'Visa', isPrimary: true },
      { id: '2', type: 'bank', accountNumber: '****9012', routingNumber: '123456789', isPrimary: false },
    ]);
  }, []);

  const renderPaymentMethod = (method, isReceivePayment) => (
    <Card key={method.id} style={styles.card}>
      <Card.Content>
        <View style={styles.cardContent}>
          <View style={styles.methodInfo}>
            <Text style={styles.methodType}>
              {method.type === 'card' ? `${method.brand} •••• ${method.last4}` : `Bank Account •••• ${method.accountNumber}`}
            </Text>
            {method.isPrimary && <Text style={styles.primaryLabel}>Primary</Text>}
          </View>
          <View style={styles.cardActions}>
            <IconButton
              icon={() => <MaterialCommunityIcons name="pencil" size={20} color={theme.colors.primary} />}
              onPress={() => handleEditMethod(method, isReceivePayment)}
            />
            <IconButton
              icon={() => <MaterialCommunityIcons name="delete" size={20} color={theme.colors.error} />}
              onPress={() => handleDeleteMethod(method, isReceivePayment)}
            />
          </View>
        </View>
        {!method.isPrimary && (
          <Button 
            onPress={() => handleSetPrimary(method.id, isReceivePayment)}
            style={styles.setPrimaryButton}
          >
            Set as Primary
          </Button>
        )}
      </Card.Content>
    </Card>
  );

  const handleAddMethod = (isReceivePayment) => {
    setNewPaymentMethod({
      type: 'card',
      cardNumber: '',
      expiryDate: '',
      cvc: '',
      accountNumber: '',
      routingNumber: '',
    });
    setModalVisible(true);
  };

  const handleEditMethod = (method, isReceivePayment) => {
    setSelectedMethod(method);
    setNewPaymentMethod({
      type: method.type,
      cardNumber: method.type === 'card' ? `****${method.last4}` : '',
      expiryDate: method.type === 'card' ? method.expiryDate : '',
      cvc: '',
      accountNumber: method.type === 'bank' ? method.accountNumber : '',
      routingNumber: method.type === 'bank' ? method.routingNumber : '',
    });
    setModalVisible(true);
  };

  const handleDeleteMethod = (method, isReceivePayment) => {
    setMethodToDelete({ ...method, isReceivePayment });
    setDeleteError(null);
    setDeleteDialogVisible(true);
  };

  const handleSetPrimary = (id, isReceivePayment) => {
    setSelectedMethod({ id, isReceivePayment });
    setConfirmPrimaryDialogVisible(true);
  };

  const confirmSetPrimary = async () => {
    setIsConfirming(true);
    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update the state to reflect the change
      if (selectedMethod.isReceivePayment) {
        setReceivePaymentMethods(prevMethods =>
          prevMethods.map(method => ({
            ...method,
            isPrimary: method.id === selectedMethod.id
          }))
        );
      } else {
        setPayForServicesMethods(prevMethods =>
          prevMethods.map(method => ({
            ...method,
            isPrimary: method.id === selectedMethod.id
          }))
        );
      }
      
      console.log('Primary payment method updated:', selectedMethod);
    } catch (error) {
      console.error('Failed to update primary payment method:', error);
    } finally {
      setIsConfirming(false);
      setConfirmPrimaryDialogVisible(false);
    }
  };

  const confirmDeleteMethod = async () => {
    if (methodToDelete.isPrimary) {
      setDeleteError("You can't delete the primary payment method. Please add a new payment method and set it as primary before deleting this one.");
      return;
    }

    setIsConfirming(true);
    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update the state to reflect the deletion
      if (methodToDelete.isReceivePayment) {
        setReceivePaymentMethods(prevMethods => prevMethods.filter(method => method.id !== methodToDelete.id));
      } else {
        setPayForServicesMethods(prevMethods => prevMethods.filter(method => method.id !== methodToDelete.id));
      }
      
      console.log('Payment method deleted:', methodToDelete);
      setDeleteDialogVisible(false);
    } catch (error) {
      console.error('Failed to delete payment method:', error);
      setDeleteError('An error occurred while deleting the payment method. Please try again.');
    } finally {
      setIsConfirming(false);
    }
  };

  const renderAddMethodModal = () => (
    <Portal>
      <Dialog visible={modalVisible} onDismiss={() => setModalVisible(false)} style={styles.dialog}>
        <Dialog.Title>Add Payment Method</Dialog.Title>
        <IconButton
          icon={() => <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} />}
          onPress={() => setModalVisible(false)}
          style={styles.closeButton}
        />
        <Dialog.Content>
          <SegmentedButtons
            value={newPaymentMethod.type}
            onValueChange={(value) => setNewPaymentMethod({ ...newPaymentMethod, type: value })}
            buttons={[
              { value: 'card', label: 'Credit Card' },
              { value: 'bank', label: 'Bank Account' },
            ]}
            style={styles.segmentedButtons}
          />
          {newPaymentMethod.type === 'card' ? (
            <>
              <TextInput
                label="Card Number"
                value={newPaymentMethod.cardNumber}
                onChangeText={(text) => setNewPaymentMethod({ ...newPaymentMethod, cardNumber: text })}
                style={styles.input}
              />
              <TextInput
                label="Expiry Date"
                value={newPaymentMethod.expiryDate}
                onChangeText={(text) => setNewPaymentMethod({ ...newPaymentMethod, expiryDate: text })}
                style={styles.input}
              />
              <TextInput
                label="CVC"
                value={newPaymentMethod.cvc}
                onChangeText={(text) => setNewPaymentMethod({ ...newPaymentMethod, cvc: text })}
                style={styles.input}
              />
            </>
          ) : (
            <>
              <TextInput
                label="Account Number"
                value={newPaymentMethod.accountNumber}
                onChangeText={(text) => setNewPaymentMethod({ ...newPaymentMethod, accountNumber: text })}
                style={styles.input}
              />
              <TextInput
                label="Routing Number"
                value={newPaymentMethod.routingNumber}
                onChangeText={(text) => setNewPaymentMethod({ ...newPaymentMethod, routingNumber: text })}
                style={styles.input}
              />
            </>
          )}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setModalVisible(false)}>Cancel</Button>
          <Button onPress={() => {
            // Logic to save new payment method (implement API call later)
            console.log('Save new payment method:', newPaymentMethod);
            setModalVisible(false);
          }}>Save</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  const renderConfirmPrimaryDialog = () => (
    <Portal>
      <Dialog visible={confirmPrimaryDialogVisible} onDismiss={() => setConfirmPrimaryDialogVisible(false)} style={styles.dialog}>
        <Dialog.Title>Confirm Primary Payment Method</Dialog.Title>
        <IconButton
          icon={() => <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} />}
          onPress={() => setConfirmPrimaryDialogVisible(false)}
          style={styles.closeButton}
        />
        <Dialog.Content>
          <Text>Are you sure you want to make this your primary payment method?</Text>
          {isConfirming && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator animating={true} color={theme.colors.primary} />
              <Text style={styles.loadingText}>Updating primary method...</Text>
            </View>
          )}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setConfirmPrimaryDialogVisible(false)} disabled={isConfirming}>Cancel</Button>
          <Button onPress={confirmSetPrimary} disabled={isConfirming}>Confirm</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  const renderDeleteConfirmDialog = () => (
    <Portal>
      <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)} style={styles.dialog}>
        <Dialog.Title>Confirm Delete Payment Method</Dialog.Title>
        <IconButton
          icon={() => <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} />}
          onPress={() => setDeleteDialogVisible(false)}
          style={styles.closeButton}
        />
        <Dialog.Content>
          {deleteError ? (
            <Text style={styles.errorText}>{deleteError}</Text>
          ) : (
            <Text>Are you sure you want to delete this payment method?</Text>
          )}
          {isConfirming && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator animating={true} color={theme.colors.primary} />
              <Text style={styles.loadingText}>Deleting payment method...</Text>
            </View>
          )}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setDeleteDialogVisible(false)} disabled={isConfirming}>Cancel</Button>
          <Button onPress={confirmDeleteMethod} disabled={isConfirming || deleteError}>Confirm</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackHeader 
        title="Payment Methods" 
        onBackPress={() => navigation.navigate('More')} 
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {isApprovedSitter && (
          <SegmentedButtons
            value={activeTab}
            onValueChange={setActiveTab}
            buttons={[
              { value: 'receive', label: 'Receive Payments' },
              { value: 'pay', label: 'Pay for Services' },
            ]}
            style={styles.segmentedButtons}
          />
        )}

        {activeTab === 'receive' && isApprovedSitter && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Receive Payments</Text>
            {receivePaymentMethods.map(method => renderPaymentMethod(method, true))}
            <Button
              icon={() => <MaterialCommunityIcons name="plus" size={20} color={theme.colors.primary} />}
              mode="contained"
              onPress={() => handleAddMethod(true)}
              style={styles.addButton}
            >
              Add Payment Method
            </Button>
          </View>
        )}

        {activeTab === 'pay' && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Pay for Services</Text>
            {payForServicesMethods.map(method => renderPaymentMethod(method, false))}
            <Button
              icon={() => <MaterialCommunityIcons name="plus" size={20} color={theme.colors.primary} />}
              mode="contained"
              onPress={() => handleAddMethod(false)}
              style={styles.addButton}
            >
              Add Payment Method
            </Button>
          </View>
        )}

        {renderAddMethodModal()}
        {renderConfirmPrimaryDialog()}
        {renderDeleteConfirmDialog()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    alignItems: 'center',
  },
  sectionContainer: {
    width: '100%',
    maxWidth: MAX_WIDTH,
    alignSelf: 'center',
  },
  card: {
    marginBottom: 16,
    width: '100%',
  },
  addButton: {
    marginTop: 16,
    width: '100%',
  },
  segmentedButtons: {
    marginBottom: 16,
    maxWidth: MAX_WIDTH,
    alignSelf: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: theme.colors.primary,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  methodInfo: {
    flex: 1,
  },
  methodType: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  primaryLabel: {
    color: theme.colors.primary,
    marginTop: 4,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  setPrimaryButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  dialog: {
    width: Platform.OS === 'web' ? '40%' : '90%',
    alignSelf: 'center',
    maxWidth: 500,
  },
  input: {
    marginBottom: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  loadingText: {
    marginLeft: 8,
  },
  errorText: {
    color: theme.colors.error,
    marginBottom: 16,
  },
  closeButton: {
    position: 'absolute',
    right: 5,
    top: 5,
  },
});

export default PaymentMethods;
