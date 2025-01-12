import React, { useEffect, useState } from 'react';
import { Platform, View, TextInput, StyleSheet } from 'react-native';
import { STRIPE_PUBLISHABLE_KEY } from '@env';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, CardElement, IbanElement } from '@stripe/react-stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

// Only import CardField for native platforms
let CardField = null;
if (Platform.OS !== 'web') {
  // Dynamic import to avoid web compilation issues
  import('@stripe/stripe-react-native').then(module => {
    CardField = module.CardField;
  });
}

const ELEMENT_OPTIONS = {
  supportedCountries: ['US'],
  style: {
    base: {
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4'
      }
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a'
    }
  }
};

const WebPaymentForm = ({ onChange, paymentType }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [bankFields, setBankFields] = useState({
    accountNumber: '',
    routingNumber: ''
  });

  useEffect(() => {
    if (stripe && elements) {
      onChange({
        complete: false,
        stripe,
        elements,
        paymentType
      });
    }
  }, [stripe, elements, paymentType]);

  const handleBankFieldChange = (field, value) => {
    const updatedFields = {
      ...bankFields,
      [field]: value
    };
    setBankFields(updatedFields);

    const isAccountNumberValid = updatedFields.accountNumber.length >= 9;
    const isRoutingNumberValid = updatedFields.routingNumber.length === 9;

    onChange({
      complete: isAccountNumberValid && isRoutingNumberValid,
      value: updatedFields,
      stripe,
      elements,
      paymentType
    });
  };

  return (
    <div style={{ padding: '10px 0' }}>
      {paymentType === 'card' ? (
        <CardElement 
          options={ELEMENT_OPTIONS}
          onChange={(event) => onChange({
            ...event,
            stripe,
            elements,
            paymentType
          })}
        />
      ) : (
        <div>
          <div style={{ 
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '10px' }}>
            {/* <label>Account Number</label> */}
            <input
              className="stripe-input"
              placeholder="Account Number"
              value={bankFields.accountNumber}
              onChange={(e) => handleBankFieldChange('accountNumber', e.target.value)}
              style={{
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                width: '50%',
                marginTop: '5px'
              }}
            />
          </div>
          <div style={{ 
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '10px' }}>
            {/* <label>Routing Number</label> */}
            <input
              className="stripe-input"
              placeholder="Routing Number"
              value={bankFields.routingNumber}
              onChange={(e) => handleBankFieldChange('routingNumber', e.target.value)}
              style={{
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                width: '50%',
                marginTop: '5px'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const NativePaymentElement = ({ onChange, paymentType }) => {
  if (!CardField) {
    return null;
  }

  if (paymentType === 'bank') {
    // For native platforms, use regular inputs for bank accounts
    return (
      <View style={[{ marginRight: 20 }]}>
        <TextInput
          placeholder="Account Number"
          onChangeText={(text) => onChange({
            complete: text.length >= 9,
            value: { accountNumber: text }
          })}
          style={styles.input}
          keyboardType="numeric"
        />
        <TextInput
          placeholder="Routing Number"
          onChangeText={(text) => onChange({
            complete: text.length === 9,
            value: { routingNumber: text }
          })}
          style={styles.input}
          keyboardType="numeric"
        />
      </View>
    );
  }

  return (
    <CardField
      postalCodeEnabled={false}
      onCardChange={onChange}
      style={{
        width: '100%',
        height: 50,
        marginVertical: 10,
      }}
    />
  );
};

export const StripePaymentElement = ({ onChange, paymentType }) => {
  if (Platform.OS === 'web') {
    return (
      <Elements stripe={stripePromise}>
        <WebPaymentForm onChange={onChange} paymentType={paymentType} />
      </Elements>
    );
  }
  return <NativePaymentElement onChange={onChange} paymentType={paymentType} />;
};

const styles = StyleSheet.create({
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    marginVertical: 5,
    paddingHorizontal: 10,
  },
  bankInputsContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  bankInput: {
    marginBottom: 16,
  },
}); 