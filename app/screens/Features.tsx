import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Image,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import BottomNavBar from '../../components/BottomNavBar';
import { apiFetch } from '../utils/api';

interface Quote {
  exchangeRate: number;
  fee: number;
  recipientAmount: number;
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  deliverySpeed: string;
}

const FeaturesScreen = () => {
  const [amount, setAmount] = useState('2000');
  const [selectedDelivery, setSelectedDelivery] = useState('express');
  const [quote, setQuote] = useState<Quote | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const data = await apiFetch('/api/v1/fx-rates/quote', {
          method: 'POST',
          body: JSON.stringify({
            amount: Number(amount),
            fromCurrency: 'USD',
            toCurrency: 'PKR',
            deliverySpeed: selectedDelivery
          }),
        });
        
        if (data.success && data.data) {
          setQuote(data.data);
        } else {
          setQuote(null);
        }
      } catch (err) {
        console.error('Quote fetch error:', err);
        setQuote(null);
      }
    };
    
    if (amount && Number(amount) > 0) {
      fetchQuote();
    }
  }, [amount, selectedDelivery]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.headerIcon} onPress={() => {
            if (router.canGoBack && router.canGoBack()) {
              router.back();
            } else {
              router.replace('/screens/WalletScreen');
            }
          }}>
            <Feather name="arrow-left" size={24} color="#222" />
          </TouchableOpacity>
          <View style={styles.logoWrapper}>
            <Image source={require('../../assets/images/logo.jpg')} style={styles.logo} />
          </View>
          <TouchableOpacity style={styles.closeBtn}>
            <Feather name="x" size={24} color="#222" />
          </TouchableOpacity>
        </View>

        {/* Promo Banner */}
        <View style={styles.promoBanner}>
          <Text style={styles.promoBannerText}>
            Get zero fees on transfers of 20,000 PKR or more
          </Text>
        </View>

        {/* Exchange Card */}
        <View style={styles.exchangeCard}>
          <View style={styles.exchangeRow}>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#bbb"
            />
            <View style={styles.currencyBox}>
              <Image source={require('../../assets/images/usd.png')} style={styles.flag} />
              <Text style={styles.currencyCode}>USD</Text>
            </View>
          </View>
          <Text style={styles.exchangeLabel}>You send</Text>
          <View style={styles.divider} />

          <View style={styles.exchangeRow}>
            <Text style={styles.amountOutput}>
              {quote && quote.recipientAmount ? quote.recipientAmount.toLocaleString() : '...'}
            </Text>
            <View style={styles.currencyBox}>
              <Image source={require('../../assets/images/pakistan.png')} style={styles.flag} />
              <Text style={styles.currencyCode}>PKR</Text>
            </View>
          </View>
          <Text style={styles.exchangeLabel}>They receive</Text>
        </View>

        {/* Promo Exchange Rate Bar */}
        <View style={styles.promoRateBar}>
          <MaterialCommunityIcons name="star-four-points-outline" size={18} color="#234881" />
          <Text style={styles.promoRateText}>Promo exchange rate applied</Text>
          <Feather name="info" size={16} color="#234881" style={{ marginLeft: 4 }} />
        </View>

        {/* Delivery Speed Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery speed</Text>
          {/* Express Option */}
          <TouchableOpacity
            style={[
              styles.deliveryOption,
              selectedDelivery === 'express' && styles.deliveryOptionSelected,
            ]}
            onPress={() => setSelectedDelivery('express')}
            activeOpacity={0.85}
          >
            <View style={styles.deliveryOptionHeader}>
              <Text style={styles.deliveryOptionTitle}>Express</Text>
              <View style={styles.radioOuter}>
                {selectedDelivery === 'express' && <View style={styles.radioInner} />}
              </View>
            </View>
            <View style={styles.deliveryOptionRow}>
              <Feather name="zap" size={16} color="#234881" style={{ marginRight: 8 }} />
              <Text style={styles.deliveryOptionText}>Deliver instantly</Text>
            </View>
            <View style={styles.deliveryOptionRow}>
              <Feather name="credit-card" size={16} color="#234881" style={{ marginRight: 8 }} />
              <Text style={styles.deliveryOptionText}>Pay with debit/credit card</Text>
            </View>
            <Text style={styles.deliveryRate}>
              1 USD = {quote && quote.exchangeRate ? quote.exchangeRate.toFixed(2) : '...'} PKR
            </Text>
          </TouchableOpacity>
          {/* Economy Option */}
          <TouchableOpacity
            style={[
              styles.deliveryOption,
              selectedDelivery === 'economy' && styles.deliveryOptionSelected,
            ]}
            onPress={() => setSelectedDelivery('economy')}
            activeOpacity={0.85}
          >
            <View style={styles.deliveryOptionHeader}>
              <Text style={styles.deliveryOptionTitle}>Economy</Text>
              <View style={styles.radioOuter}>
                {selectedDelivery === 'economy' && <View style={styles.radioInner} />}
              </View>
            </View>
            <View style={styles.deliveryOptionRow}>
              <Feather name="clock" size={16} color="#234881" style={{ marginRight: 8 }} />
              <Text style={styles.deliveryOptionText}>Deliver in 3 to 6 days</Text>
            </View>
            <View style={styles.deliveryOptionRow}>
              <Feather name="credit-card" size={16} color="#234881" style={{ marginRight: 8 }} />
              <Text style={styles.deliveryOptionText}>Pay with debit/credit card</Text>
            </View>
            <Text style={styles.deliveryRate}>
              1 USD = <Text style={{ color: '#234881', fontWeight: 'bold' }}>
                {quote && quote.exchangeRate ? quote.exchangeRate.toFixed(2) : 'Loading...'} PKR
              </Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Pricing Summary */}
        <View style={styles.pricingCard}>
          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>Earliest delivery</Text>
            <Text style={styles.pricingValue}>Instant</Text>
          </View>
          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>Fee</Text>
            <Text style={styles.pricingValue}>
              {quote && quote.fee ? quote.fee.toFixed(2) : 'Loading...'} USD
            </Text>
          </View>
          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>You send</Text>
            <Text style={styles.pricingValue}>{quote && quote.amount ? quote.amount.toFixed(2) : 'Loading...'} USD</Text>
          </View>
          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>Recipient gets</Text>
            <Text style={styles.pricingValue}>
              {quote && quote.recipientAmount ? quote.recipientAmount.toFixed(2) : 'Loading...'} PKR
            </Text>
          </View>
          <View style={[styles.pricingRow, styles.pricingRowTotal]}>
            <Text style={styles.pricingLabelTotal}>Delivery</Text>
            <Text style={styles.pricingValueTotal}>
              {quote && quote.deliverySpeed ? quote.deliverySpeed : 'Loading...'}
            </Text>
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity style={styles.continueBtn} onPress={() => router.push('/screens/MethodScreen')}>
          <Text style={styles.continueBtnText}>Continue</Text>
        </TouchableOpacity>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>New customer offer applied: <Text style={{ fontWeight: '400', color: '#222' }}>zero fees and a promotional exchange rate for the first 1000 USD of this transfer. Standard rate applies to the remainder of this transfer.</Text></Text>
          <Text style={styles.infoText}>
            Transfer speed: <Text style={{ fontWeight: '400', color: '#222' }}>is an estimate dependent on payment method, delivery method, transaction review, and system availability of RemitGo and our partners.</Text>
          </Text>
          <Text style={styles.infoText}>
            Speed may not be available on this screen but it's always estimated in the Transfer Summary before you send.
          </Text>
        </View>

        {/* Footer Navigation */}
        {/* <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem}>
            <Feather name="home" size={24} color="#7f8c8d" />
            <Text style={styles.navLabel}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Feather name="users" size={24} color="#7f8c8d" />
            <Text style={styles.navLabel}>Recipients</Text>
          </TouchableOpacity>
          <View style={styles.sendButtonWrapper}>
            <TouchableOpacity style={styles.sendButton}>
              <Feather name="send" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.sendLabel}>Send</Text>
          </View>
          <TouchableOpacity style={styles.navItem}>
            <Feather name="gift" size={24} color="#7f8c8d" />
            <Text style={styles.navLabel}>Rewards</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Feather name="grid" size={24} color="#7f8c8d" />
            <Text style={styles.navLabel}>Manage</Text>
          </TouchableOpacity>
        </View> */}
      </ScrollView>
      <BottomNavBar activeTab="send" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContent: { paddingBottom: 32 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 16,
    paddingHorizontal: 16,
    position: 'relative',
  },
  headerIcon: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
    zIndex: 10,
  },
  logoWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignSelf: 'center',
  },
  closeBtn: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 8,
    zIndex: 10,
  },
  promoBanner: {
    backgroundColor: '#e3f2fd',
    marginHorizontal: 16,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  promoBannerText: {
    color: '#1976d2',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  exchangeCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.08)',
      },
      default: {
        elevation: 2,
      },
    }),
  },
  exchangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amountInput: {
    fontSize: 28,
    fontWeight: '600',
    color: '#222',
    flex: 1,
    marginRight: 12,
  },
  amountOutput: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
    flex: 1,
    marginRight: 12,
  },
  currencyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  flag: {
    width: 24,
    height: 18,
    borderRadius: 3,
    marginRight: 6,
    resizeMode: 'contain',
  },
  currencyCode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  exchangeLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
    marginBottom: 6,
    marginLeft: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 8,
    borderRadius: 1,
  },
  promoRateBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4ff',
    marginHorizontal: 16,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  promoRateText: {
    color: '#234881',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 16,
  },
  deliveryOption: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  deliveryOptionSelected: {
    borderColor: '#234881',
    backgroundColor: '#f0f4ff',
  },
  deliveryOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  deliveryOptionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#234881',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#234881',
  },
  deliveryOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  deliveryOptionText: {
    fontSize: 14,
    color: '#222',
  },
  deliveryRate: {
    fontSize: 13,
    color: '#222',
    marginTop: 6,
    fontWeight: '500',
  },
  pricingCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.08)',
      },
      default: {
        elevation: 2,
      },
    }),
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  pricingLabel: {
    fontSize: 14,
    color: '#666',
  },
  pricingValue: {
    fontSize: 14,
    color: '#222',
    fontWeight: '500',
  },
  pricingValueDiscount: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '500',
  },
  pricingRowTotal: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
    marginTop: 6,
  },
  pricingLabelTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },
  pricingValueTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },
  continueBtn: {
    backgroundColor: '#234881',
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  continueBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  infoSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 18,
    marginBottom: 32,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.08)',
      },
      default: {
        elevation: 2,
      },
    }),
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#234881',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 13,
    color: '#222',
    marginBottom: 8,
    fontWeight: '500',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    marginTop: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navLabel: {
    fontSize: 10,
    color: '#7f8c8d',
    fontWeight: '500',
    marginTop: 2,
  },
  sendButtonWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
    top: -24,
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
      },
    }),
    zIndex: 10,
  },
  sendLabel: {
    marginTop: 4,
    fontSize: 12,
    color: '#234881',
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default FeaturesScreen;