import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Dimensions } from 'react-native';
import { Card, Button, IconButton, TextInput, SegmentedButtons, Dialog, Portal, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { theme } from '../styles/theme';
import BackHeader from '../components/BackHeader';
import { useNavigation } from '@react-navigation/native'; 
import CrossPlatformView from '../components/CrossPlatformView';
import axios from 'axios';
import { createPaymentMethod } from '../utils/StripeService';
import { StripeCardElement } from '../components/StripeCardElement';
import { CardElement } from '@stripe/react-stripe-js';
import { StripePaymentElement } from '../components/StripeCardElement';

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
  const stripe = Platform.OS !== 'web' ? stripeModule()?.useStripe() : null;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cardComplete, setCardComplete] = useState(false);
  const [cardElement, setCardElement] = useState(null);
  const [stripeElement, setStripeElement] = useState(null);
  const [bankAccountComplete, setBankAccountComplete] = useState({
    accountNumber: false,
    routingNumber: false
  });
  const [verificationModalVisible, setVerificationModalVisible] = useState(false);
  const [verificationAmounts, setVerificationAmounts] = useState({
    first: '',
    second: ''
  });
  const [verifyingMethod, setVerifyingMethod] = useState(null);

  useEffect(() => {
    // Fetch payment methods from backend
    // This is a placeholder. Replace with actual API calls.
    setReceivePaymentMethods([
      { id: '1', type: 'bank', accountNumber: '****1234', routingNumber: '123456789', isPrimary: true, is_verified: true },
      { id: '2', type: 'bank', accountNumber: '****5678', routingNumber: '987654321', isPrimary: false, is_verified: true },
    ]);
    setPayForServicesMethods([
      { id: '1', type: 'card', last4: '4242', brand: 'Visa', isPrimary: true, is_verified: true },
      { id: '2', type: 'bank', accountNumber: '****9012', routingNumber: '123456789', isPrimary: false, is_verified: true },
    ]);
  }, []);

  const renderPaymentMethod = (method, isReceivePayment) => (
    <Card key={method.id} style={styles.card}>
      <Card.Content>
        <View style={styles.cardContent}>
          <View style={styles.methodInfo}>
            <Text style={styles.methodType}>
              {method.type === 'card' 
                ? `${method.brand} •••• ${method.last4}` 
                : `Bank Account ${method.accountNumber || '•••• undefined'}`}
            </Text>
            {method.bankName && <Text style={styles.bankName}>{method.bankName}</Text>}
            {method.isPrimary && <Text style={styles.primaryLabel}>Primary</Text>}
            {!method.is_verified && (
              <Text style={styles.verificationNeeded}>
                {method.type === 'card' 
                  ? 'Card Verification In Progress'
                  : 'Bank Account Verification Required'}
              </Text>
            )}
          </View>
          <View style={styles.cardActions}>
            {!method.is_verified && method.type === 'bank' && (
              <Button
                onPress={() => handleVerifyBankAccount(method)}
                mode="contained"
              >
                Verify
              </Button>
            )}
            {method.is_verified && (
              <>
                <IconButton
                  icon={() => <MaterialCommunityIcons name="pencil" size={20} color={theme.colors.primary} />}
                  onPress={() => handleEditMethod(method, isReceivePayment)}
                />
                <IconButton
                  icon={() => <MaterialCommunityIcons name="delete" size={20} color={theme.colors.error} />}
                  onPress={() => handleDeleteMethod(method, isReceivePayment)}
                />
              </>
            )}
          </View>
        </View>
        {!method.isPrimary && method.is_verified && (
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

  const handleAddMethod = async (isReceivePayment) => {
    setError(null);
    setSelectedMethod({ isReceivePayment });
    setNewPaymentMethod({
      type: isReceivePayment ? 'bank' : 'card',
      cardNumber: '',
      expiryDate: '',
      cvc: '',
      accountNumber: '',
      routingNumber: '',
    });
    setModalVisible(true);
  };

  const handleEditMethod = (method, isReceivePayment) => {
    setError('');
    setSelectedMethod({ ...method, isReceivePayment });
    setNewPaymentMethod({
      type: method.type,
      cardNumber: '',
      expiryDate: '',
      cvc: '',
      accountNumber: method.accountNumber || '',
      routingNumber: method.routingNumber || '',
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
        <Dialog.Title>
          {selectedMethod?.isReceivePayment ? 'Add Bank Account' : 'Add Payment Method'}
        </Dialog.Title>
        <IconButton
          icon={() => <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} />}
          onPress={() => setModalVisible(false)}
          style={styles.closeButton}
        />
        <Dialog.Content>
          {!selectedMethod?.isReceivePayment && (
            <SegmentedButtons
              value={newPaymentMethod.type}
              onValueChange={(value) => setNewPaymentMethod({ ...newPaymentMethod, type: value })}
              buttons={[
                { value: 'card', label: 'Credit Card' },
                { value: 'bank', label: 'Bank Account' },
              ]}
              style={styles.segmentedButtons}
            />
          )}
          <StripePaymentElement 
            onChange={handlePaymentChange}
            paymentType={newPaymentMethod.type}
          />
          {error && <Text style={styles.errorText}>{error}</Text>}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setModalVisible(false)} disabled={loading}>Cancel</Button>
          <Button 
            onPress={handleSavePaymentMethod} 
            disabled={loading || (newPaymentMethod.type === 'card' && !cardComplete)}
            loading={loading}
          >
            Save
          </Button>
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

  const handleVerifyBankAccount = (method) => {
    setVerifyingMethod(method);
    setVerificationAmounts({ first: '', second: '' });
    setVerificationModalVisible(true);
    setError(null);
  };

  const renderVerificationModal = () => (
    <Portal>
      <Dialog visible={verificationModalVisible} onDismiss={() => setVerificationModalVisible(false)} style={styles.dialog}>
        <Dialog.Title>Verify Bank Account</Dialog.Title>
        <IconButton
          icon={() => <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} />}
          onPress={() => setVerificationModalVisible(false)}
          style={styles.closeButton}
        />
        <Dialog.Content>
          <Text style={styles.verificationText}>
            A deposit will be made to your bank account in 1-2 business days of adding your bank account. Please enter the two small deposit amounts that were made to your account:
          </Text>
          <View style={styles.amountsContainer}>
            <TextInput
              label="First Amount (cents)"
              value={verificationAmounts.first}
              onChangeText={(text) => setVerificationAmounts(prev => ({ ...prev, first: text }))}
              keyboardType="numeric"
              style={styles.amountInput}
              mode="outlined"
              placeholder="32"
            />
            <TextInput
              label="Second Amount (cents)"
              value={verificationAmounts.second}
              onChangeText={(text) => setVerificationAmounts(prev => ({ ...prev, second: text }))}
              keyboardType="numeric"
              style={styles.amountInput}
              mode="outlined"
              placeholder="45"
            />
          </View>
          {error && <Text style={styles.errorText}>{error}</Text>}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setVerificationModalVisible(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onPress={handleVerificationSubmit}
            loading={loading}
            disabled={loading || !verificationAmounts.first || !verificationAmounts.second}
          >
            Verify
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  const handleVerificationSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!verifyingMethod) {
        throw new Error('Missing required verification data');
      }

      const firstAmount = parseInt(verificationAmounts.first);
      const secondAmount = parseInt(verificationAmounts.second);

      if ([firstAmount, secondAmount].some(amount => isNaN(amount) || amount < 1 || amount > 99)) {
        throw new Error('Please enter valid amounts between 1 and 99 cents');
      }

      // Simulate backend API call
      const simulateBackendVerification = () => new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate success for amounts 32 and 45, fail for others
          if (firstAmount === 12 && secondAmount === 12) {
            resolve({ success: true });
          } else {
            reject(new Error('The amounts entered do not match our records. Please verify the amounts and try again.'));
          }
        }, 1000);
      });

      const result = await simulateBackendVerification();

      // Update the UI if verification succeeds
      const updateMethod = (methods) =>
        methods.map(m =>
          m.id === verifyingMethod.id
            ? { ...m, is_verified: true }
            : m
        );

      setReceivePaymentMethods(prev => updateMethod(prev));
      setPayForServicesMethods(prev => updateMethod(prev));

      setVerificationModalVisible(false);
      setVerifyingMethod(null);
      setVerificationAmounts({ first: '', second: '' });
      setError('Bank account successfully verified!');
    } catch (err) {
      console.error('Verification error:', err);
      setError(err.message || 'Failed to verify bank account. Please check the amounts and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Add card verification handler
  const handleVerifyCard = async (method) => {
    setLoading(true);
    setError(null);

    try {
      // Create a SetupIntent on your backend
      const setupIntent = await axios.post('/api/create-setup-intent', {
        payment_method_id: method.id
      });

      // Confirm the SetupIntent with Stripe
      const result = await cardElement.stripe.confirmCardSetup(
        setupIntent.client_secret,
        {
          payment_method: method.id
        }
      );

      console.log('Card verification result:', result);

      if (result.error) {
        throw new Error(result.error.message);
      }

      // Update the payment method status in your lists
      const updateMethod = (methods) =>
        methods.map(m =>
          m.id === method.id
            ? { ...m, status: 'verified', verificationNeeded: false }
            : m
        );

      setReceivePaymentMethods(prev => updateMethod(prev));
      setPayForServicesMethods(prev => updateMethod(prev));

      setError('Card successfully verified!');
    } catch (err) {
      console.error('Card verification error:', err);
      setError(err.message || 'Failed to verify card');
    } finally {
      setLoading(false);
    }
  };

  // Add these functions back after handleAddMethod
  const handlePaymentChange = (event) => {
    console.log('Payment change event:', event);
    if (Platform.OS === 'web') {
      if (newPaymentMethod.type === 'card') {
        setCardComplete(event.complete);
      } else {
        // For bank accounts, track both fields
        if (event.value) {
          setBankAccountComplete(prev => ({
            ...prev,
            accountNumber: event.value.accountNumber?.length >= 9 || prev.accountNumber,
            routingNumber: event.value.routingNumber?.length === 9 || prev.routingNumber
          }));
        }
        setCardComplete(bankAccountComplete.accountNumber && bankAccountComplete.routingNumber);
      }

      setCardElement({
        stripe: event.stripe,
        elements: event.elements,
        complete: event.complete,
        paymentType: newPaymentMethod.type,
        value: event.value
      });

      // Update newPaymentMethod state if it's a bank account
      if (newPaymentMethod.type === 'bank' && event.value) {
        setNewPaymentMethod(prev => ({
          ...prev,
          accountNumber: event.value.accountNumber || prev.accountNumber,
          routingNumber: event.value.routingNumber || prev.routingNumber,
        }));
      }
    } else {
      setCardComplete(event.complete);
      setCardElement(event);
    }
  };

  const handleSavePaymentMethod = async () => {
    if (newPaymentMethod.type === 'card') {
      if (!cardComplete) {
        setError('Please complete card details');
        return;
      }
    } else if (newPaymentMethod.type === 'bank') {
      if (!bankAccountComplete.accountNumber || !bankAccountComplete.routingNumber) {
        setError('Please complete both account number and routing number');
        return;
      }
    }
    
    setLoading(true);
    setError(null);
    
    try {
      if (Platform.OS === 'web') {
        if (!cardElement.stripe || !cardElement.elements) {
          throw new Error('Stripe not initialized');
        }

        let result;
        if (newPaymentMethod.type === 'card') {
          // Handle credit card
          result = await cardElement.stripe.createPaymentMethod({
            type: 'card',
            card: cardElement.elements.getElement(CardElement),
          });

          console.log('Card payment method result:', result);

          if (result.error) {
            throw new Error(result.error.message);
          }

          const paymentMethodData = {
            id: result.paymentMethod.id,
            type: 'card',
            last4: result.paymentMethod.card.last4,
            brand: result.paymentMethod.card.brand,
            is_verified: false
          };

          // Only add to payForServicesMethods since cards can't be used for receiving
          setPayForServicesMethods(prev => [...prev, paymentMethodData]);
        } else {
          // Handle bank account
          result = await cardElement.stripe.createToken('bank_account', {
            country: 'US',
            currency: 'usd',
            routing_number: cardElement.value.routingNumber,
            account_number: cardElement.value.accountNumber,
            account_holder_type: 'individual',
          });
          
          console.log('Bank token creation result:', result);

          if (result.error || !result.token) {
            throw new Error(result.error?.message || 'Invalid routing number. Please check and try again.');
          }

          const paymentMethodData = {
            id: result.token.id,
            type: 'bank',
            accountNumber: `****${result.token.bank_account.last4}`,
            routingNumber: cardElement.value.routingNumber,
            bankName: result.token.bank_account.bank_name,
            is_verified: false
          };

          // Update the appropriate list based on where it was added
          if (selectedMethod?.isReceivePayment) {
            setReceivePaymentMethods(prev => [...prev, paymentMethodData]);
          } else {
            setPayForServicesMethods(prev => [...prev, paymentMethodData]);
          }

          setError(
            'Bank account added but requires verification. Two small deposits will be made to your account in 1-2 business days. ' +
            'Please check your account and return to verify the amounts.'
          );
        }

        setModalVisible(false);
      } else {
        // Native platform handling
        const { paymentMethod, error } = await createPaymentMethod({
          type: newPaymentMethod.type,
          card: cardElement,
          is_receive_payment: selectedMethod?.isReceivePayment || false,
        });

        if (error) {
          throw new Error(error.message);
        }

        // Update the appropriate list
        if (selectedMethod?.isReceivePayment) {
          setReceivePaymentMethods(prev => [...prev, paymentMethod]);
        } else {
          setPayForServicesMethods(prev => [...prev, paymentMethod]);
        }
      }

      setModalVisible(false);
    } catch (err) {
      console.error('Payment method error:', err);
      setError(err.message || 'Failed to save payment method');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CrossPlatformView fullWidthHeader={true}>
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
              { 
                value: 'receive', 
                label: 'Receive Payments',
                style: { minWidth: 150 }
              },
              { 
                value: 'pay', 
                label: 'Pay for Services',
                style: { minWidth: 150 }
              },
            ]}
            style={[styles.segmentedButtons, { width: '100%' }]}
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
              Add Bank Account
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
        {renderVerificationModal()}
      </ScrollView>
    </CrossPlatformView>
  );
};

const styles = StyleSheet.create({
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
    minHeight: 40,
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
    width: '90%',
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
    marginBottom: 10,
  },
  closeButton: {
    position: 'absolute',
    right: 5,
    top: 5,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bankName: {
    fontSize: 14,
    color: theme.colors.secondary,
    marginTop: 4,
  },
  verificationNeeded: {
    color: theme.colors.error,
    fontSize: 12,
    marginTop: 4,
  },
  amountsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 16,
  },
  amountInput: {
    width: '48%',
  },
  verificationText: {
    marginBottom: 8,
    fontSize: 14,
  },
});

export default PaymentMethods;
