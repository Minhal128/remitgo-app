import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Image,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import BottomNavBar from '../../components/BottomNavBar';
import { apiFetch } from '../utils/api';

const PayWithCardScreen = () => {
  const [activeTab, setActiveTab] = useState('Send');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [error, setError] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Hardcoded billing address
  const billingAddress = {
    street: '4167 North Marshall Way',
    city: 'Scottsdale',
    state: 'AZ',
    country: 'US',
    postalCode: '85251'
  };

  // Card number input handler
  const handleCardNumberChange = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    
    // Limit to 16 digits (standard card length)
    if (cleaned.length > 16) return;
    
    // Format with spaces every 4 digits
    let formatted = '';
    for (let i = 0; i < cleaned.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += ' ';
      }
      formatted += cleaned[i];
    }
    
    setCardNumber(formatted);
  };

  // CVC input handler
  const handleCvcChange = (text: string) => {
    // Only allow digits
    const cleaned = text.replace(/[^0-9]/g, '');
    setCvc(cleaned);
  };

  // Expiry input handler
  const handleExpiryChange = (text: string) => {
    // Only allow digits and slash
    let cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length > 4) cleaned = cleaned.slice(0, 4);
    let formatted = '';
    if (cleaned.length <= 2) {
      formatted = cleaned;
    } else {
      formatted = `${cleaned.slice(0, 2)} / ${cleaned.slice(2)}`;
    }
    setExpiry(formatted);
  };

  // Detect card type
  const detectCardType = (number: string) => {
    const cleaned = number.replace(/\s/g, '');
    if (/^4/.test(cleaned)) return 'visa';
    if (/^5[1-5]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    if (/^6/.test(cleaned)) return 'discover';
    return 'other';
  };

  const handleSubmit = async () => {
    // Validation
    const cleanedCardNumber = cardNumber.replace(/\s/g, '');
    if (!cleanedCardNumber || cleanedCardNumber.length < 15 || cleanedCardNumber.length > 19) {
      setError('Please enter a valid card number (15-19 digits).');
      setShowErrorModal(true);
      return;
    }
    if (!/^\d+$/.test(cleanedCardNumber)) {
      setError('Card number must contain only digits.');
      setShowErrorModal(true);
      return;
    }
    
    // Additional validation to ensure cardNumber is not empty
    if (!cardNumber || cardNumber.trim() === '') {
      setError('Please enter a card number.');
      setShowErrorModal(true);
      return;
    }
    if (!expiry || !/^\d{2}\s*\/\s*\d{2}$/.test(expiry)) {
      setError('Please enter a valid expiration date (MM / YY).');
      setShowErrorModal(true);
      return;
    }
    if (!cvc || cvc.length < 3 || cvc.length > 4) {
      setError('Please enter a valid security code (3-4 digits).');
      setShowErrorModal(true);
      return;
    }
    if (!/^\d+$/.test(cvc)) {
      setError('Security code must contain only digits.');
      setShowErrorModal(true);
      return;
    }
    if (!cardName) {
      setError('Please enter the name as it appears on card.');
      setShowErrorModal(true);
      return;
    }

    setIsLoading(true);
    try {
      // Format expiry date
      const formattedExpiry = expiry.replace(/\s*\/\s*/g, '/');
      
      // Debug: Log the data being sent
      const cardData = {
        cardHolderName: cardName,
        cardNumber: cardNumber.replace(/\s/g, ''), // This will be processed by dLocal
        expiryDate: formattedExpiry,
        cvv: cvc,
        billingAddress,
        isDefault: true
      };
      
      console.log('Submitting card data:', cardData);
      console.log('Original cardNumber:', cardNumber);
      console.log('Cleaned cardNumber:', cardNumber.replace(/\s/g, ''));

      await apiFetch('/card/cards', {
        method: 'POST',
        body: JSON.stringify(cardData),
      });

      router.push('/screens/MoneyTransferScreen');
    } catch (err) {
      setError('Failed to save card. Please try again.');
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#222" />
        </TouchableOpacity>
        <Image source={require('../../assets/images/logo.jpg')} style={styles.logo} />
        <TouchableOpacity style={styles.headerIcon} onPress={() => router.back()}>
          <Feather name="x" size={24} color="#222" />
        </TouchableOpacity>
      </View>
      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBg}>
          <View style={styles.progressBarFill} />
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Pay with card</Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoBoxText}>Debit cards have no extra fees. Credit cards have an extra 2% fee.</Text>
        </View>
        <View style={styles.cardLabelRow}>
          <Text style={styles.label}>Card number</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image source={require('../../assets/images/visa_card.png')} style={styles.cardIcon} />
            <Image source={require('../../assets/images/master_card.png')} style={styles.cardIcon} />
          </View>
        </View>
        <View style={styles.inputWithIconRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="e.g, 1234 5678 1032 8612"
            placeholderTextColor="#999"
            value={cardNumber}
            onChangeText={handleCardNumberChange}
            keyboardType="number-pad"
            maxLength={19}
            autoComplete="cc-number"
            textContentType="creditCardNumber"
          />
          <TouchableOpacity style={styles.inputIconBtn}>
            <Feather name="copy" size={20} color="#999" />
          </TouchableOpacity>
        </View>
        <Text style={styles.helperText}>Enter 16 digits with automatic spacing</Text>
        <View style={styles.rowInputs}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>Expiration date</Text>
            <TextInput
              style={styles.input}
              placeholder="MM  /  YY"
              placeholderTextColor="#999"
              value={expiry}
              onChangeText={handleExpiryChange}
              keyboardType="number-pad"
              maxLength={7}
            />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={styles.label}>Security code</Text>
              <Feather name="info" size={18} color="#999" style={{ marginLeft: 4 }} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="e.g, CVC"
              placeholderTextColor="#999"
              value={cvc}
              onChangeText={handleCvcChange}
              keyboardType="number-pad"
              maxLength={4}
            />
          </View>
        </View>
        <Text style={styles.label}>Your name as it appears on card</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g, Card Holder Name"
          placeholderTextColor="#999"
          value={cardName}
          onChangeText={setCardName}
        />
        <TouchableOpacity onPress={() => router.push('/screens/MoneyTransferScreen')}>
          <Text style={styles.linkText}>Pay with Bank Account instead</Text>
        </TouchableOpacity>
        <Text style={styles.billingTitle}>Billing address</Text>
        <Text style={styles.addressText}>
          {billingAddress.street}{"\n"}
          {billingAddress.city}, {billingAddress.state} {billingAddress.postalCode}
        </Text>
        <TouchableOpacity 
          style={[styles.nextBtn, isLoading && styles.nextBtnDisabled]} 
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.nextBtnText}>{isLoading ? 'Saving...' : 'Next'}</Text>
        </TouchableOpacity>
        <Modal
          visible={showErrorModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowErrorModal(false)}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <View style={{ backgroundColor: '#fff', padding: 24, borderRadius: 12, alignItems: 'center', minWidth: 220 }}>
              <Feather name="alert-circle" size={40} color="#d32f2f" style={{ marginBottom: 10 }} />
              <Text style={{ color: '#d32f2f', fontSize: 16, marginBottom: 12, textAlign: 'center' }}>{error}</Text>
              <TouchableOpacity onPress={() => setShowErrorModal(false)} style={{ marginTop: 8 }}>
                <Text style={{ color: '#234881', fontWeight: '700', fontSize: 15 }}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
      {/* Bottom Navigation */}
      <BottomNavBar activeTab="recipients" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#fff',
  },
  headerIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },logo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignSelf: 'center',
  },
  progressBarContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },progressBarBg: {
    width: '100%',
    height: 4,
    backgroundColor: '#e5e5e5',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    width: '80%',
    height: 4,
    backgroundColor: '#234881',
    borderRadius: 2,
  },scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120, // Increased padding to prevent overlap with BottomNavBar
    paddingTop: 0,
    flexGrow: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 18,
    textAlign: 'left',
    marginTop: 0,
  },infoBox: {
    backgroundColor: '#f2f6fb',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 22,
  },
  infoBoxText: {
    fontSize: 14,
    color: '#234881',
    fontWeight: '400',
    textAlign: 'left',
  },cardLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardIcon: {
    width: 32,
    height: 20,
    marginLeft: 4,
    resizeMode: 'contain',
  },inputWithIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bdbdbd',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 18,
    paddingHorizontal: 0,
    paddingVertical: 0,
    height: 48,
  },
  inputIconBtn: {
    paddingHorizontal: 12,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },rowInputs: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    color: '#222',
    fontWeight: '400',
    marginBottom: 8,
    marginTop: 0,
    textAlign: 'left',
  },input: {
    borderWidth: 1,
    borderColor: '#bdbdbd',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#222',
    marginBottom: 0,
    backgroundColor: '#fff',
    textAlign: 'left',
    fontWeight: '400',
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    marginBottom: 18,
    textAlign: 'left',
  },
  linkText: {
    color: '#234881',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginBottom: 0,
    marginTop: 18,
  },
  billingTitle: {
    fontSize: 15,
    color: '#222',
    fontWeight: '700',
    marginTop: 28,
    marginBottom: 10,
    textAlign: 'left',
  },
  addressText: {
    fontSize: 14,
    color: '#222',
    fontWeight: '400',
    marginTop: 10,
    marginBottom: 24,
    textAlign: 'left',
  },
  nextBtn: {
    backgroundColor: '#234881',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 16,
  },
  nextBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  nextBtnDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingTop: 10,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  navItem: {
    alignItems: 'center',
  },
  navLabel: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  activeNavLabel: {
    color: '#234881',
    fontWeight: '700',
  },
  sendButtonWrapper: {
    alignItems: 'center',
    marginTop: 10,
  },
  sendButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#234881',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
      },
      default: {
        elevation: 5,
        zIndex: 10,
      },
    }),
  },
  sendLabel: {
    marginTop: 4,
    fontSize: 12,
    color: '#234881',
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default PayWithCardScreen; 