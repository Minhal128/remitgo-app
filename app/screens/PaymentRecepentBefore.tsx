import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const PaymentRecepentBefore = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedSpeed, setSelectedSpeed] = useState('express');

  const transferParams = {
    recipientId: params.recipientId as string,
    amount: params.amount as string,
    fromCurrency: params.fromCurrency as string,
    toCurrency: params.toCurrency as string
  };

  const handleContinue = () => {
    router.push({
      pathname: '/screens/DeliverySpeedScreen',
      params: transferParams
    });
  };

  const handleBack = () => {
    router.back();
  };

  const handleClose = () => {
    router.push('/screens/MoneyTransferScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon} onPress={handleBack}>
          <Feather name="arrow-left" size={24} color="#222" />
        </TouchableOpacity>
        <Image source={require('../../assets/images/logo.jpg')} style={styles.logo} />
        <TouchableOpacity style={styles.headerIcon} onPress={handleClose}>
          <Feather name="x" size={24} color="#222" />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: '60%' }]} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Promotional Banner */}
        <View style={styles.promoBanner}>
          <Text style={styles.promoText}>
            Get zero fees on transfers of 20,000 PKR or more
          </Text>
        </View>

        {/* Transfer Details Card */}
        <View style={styles.transferCard}>
          <View style={styles.amountRow}>
            <View style={styles.amountSection}>
              <View style={styles.currencyRow}>
                <Text style={styles.amount}>2000</Text>
                <Image source={require('../../assets/images/usd.png')} style={styles.flag} />
                <Text style={styles.currency}>USD</Text>
              </View>
              <Text style={styles.amountLabel}>You send</Text>
            </View>
            <View style={styles.amountSection}>
              <View style={styles.currencyRow}>
                <Text style={styles.amount}>558,386.57</Text>
                <Image source={require('../../assets/images/pakistan.png')} style={styles.flag} />
                <Text style={styles.currency}>PKR</Text>
              </View>
              <Text style={styles.amountLabel}>They receive</Text>
            </View>
          </View>
        </View>

        {/* Promo Rate Banner */}
        <View style={styles.promoRateBanner}>
          <Feather name="zap" size={16} color="#8B5CF6" />
          <Text style={styles.promoRateText}>Promo exchange rate applied</Text>
          <TouchableOpacity style={styles.infoIcon}>
            <Feather name="info" size={16} color="#8B5CF6" />
          </TouchableOpacity>
        </View>

        {/* Delivery Speed Section */}
        <Text style={styles.sectionTitle}>Delivery speed</Text>

        {/* Express Option */}
        <TouchableOpacity 
          style={[styles.speedOption, selectedSpeed === 'express' && styles.selectedSpeed]}
          onPress={() => setSelectedSpeed('express')}
        >
          <View style={styles.speedContent}>
            <View style={styles.speedHeader}>
              <Text style={styles.speedTitle}>Express</Text>
              <View style={[styles.radioButton, selectedSpeed === 'express' && styles.radioButtonSelected]}>
                {selectedSpeed === 'express' && <View style={styles.radioButtonInner} />}
              </View>
            </View>
            
            <View style={styles.speedFeatures}>
              <View style={styles.featureRow}>
                <Feather name="zap" size={16} color="#6B7280" />
                <Text style={styles.featureText}>Deliver instantly</Text>
              </View>
              <View style={styles.featureRow}>
                <Feather name="credit-card" size={16} color="#6B7280" />
                <Text style={styles.featureText}>Pay with debit/credit card</Text>
              </View>
            </View>
            
            <Text style={styles.exchangeRate}>
              1 USD = <Text style={styles.strikethrough}>270.85</Text> 272.14 PKR
            </Text>
          </View>
        </TouchableOpacity>

        {/* Economy Option */}
        <TouchableOpacity 
          style={[styles.speedOption, selectedSpeed === 'economy' && styles.selectedSpeed]}
          onPress={() => setSelectedSpeed('economy')}
        >
          <View style={styles.speedContent}>
            <View style={styles.speedHeader}>
              <Text style={styles.speedTitle}>Economy</Text>
              <View style={[styles.radioButton, selectedSpeed === 'economy' && styles.radioButtonSelected]}>
                {selectedSpeed === 'economy' && <View style={styles.radioButtonInner} />}
              </View>
            </View>
            
            <View style={styles.speedFeatures}>
              <View style={styles.featureRow}>
                <Feather name="clock" size={16} color="#6B7280" />
                <Text style={styles.featureText}>Deliver in 3 to 6 days</Text>
              </View>
              <View style={styles.featureRow}>
                <Feather name="credit-card" size={16} color="#6B7280" />
                <Text style={styles.featureText}>Pay with debit/credit card</Text>
              </View>
            </View>
            
            <Text style={styles.exchangeRate}>
              1 USD = <Text style={styles.strikethrough}>270.85</Text> 272.14 PKR
            </Text>
          </View>
        </TouchableOpacity>

        {/* Summary of Charges */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Earliest delivery</Text>
            <Text style={styles.summaryValue}>Instant</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Fee</Text>
            <Text style={styles.summaryValue}>1.99 USD</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Fee discount</Text>
            <Text style={[styles.summaryValue, styles.discountText]}>-1.99 USD</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>2,000 USD</Text>
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>

        {/* Informational Text */}
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            New customer offer applied: zero fees and a promotional exchange rate for the first 1000 USD of this transfer. Standard rate applies to the remainder of this transfer.
          </Text>
          <Text style={styles.infoText}>
            Transfer speed: is an estimate dependent on payment method, delivery method, transaction review, and system availability of RemitGo and our partners.
          </Text>
          <Text style={styles.infoText}>
            Speed may not be available on this screen but it's always estimated in the Transfer Summary before you send.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="home" size={24} color="#6B7280" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="file-text" size={24} color="#6B7280" />
          <Text style={styles.navText}>Recipients</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <View style={styles.activeNavIcon}>
            <Feather name="send" size={24} color="#FFFFFF" />
          </View>
          <Text style={[styles.navText, styles.activeNavText]}>Send</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="gift" size={24} color="#6B7280" />
          <Text style={styles.navText}>Rewards</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="grid" size={24} color="#6B7280" />
          <Text style={styles.navText}>Manage</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
  },
  headerIcon: {
    padding: 8,
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  progressBarContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  progressBarFill: {
    height: 4,
    backgroundColor: '#234881',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  promoBanner: {
    backgroundColor: '#DBEAFE',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  promoText: {
    color: '#1E40AF',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  transferCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
      },
      default: {
        elevation: 5,
      },
    }),
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amountSection: {
    alignItems: 'center',
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginRight: 8,
  },
  flag: {
    width: 20,
    height: 15,
    marginRight: 8,
    borderRadius: 2,
  },
  currency: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  amountLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  promoRateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  promoRateText: {
    flex: 1,
    marginLeft: 8,
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '500',
  },
  infoIcon: {
    padding: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  speedOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
      },
      default: {
        elevation: 5,
      },
    }),
  },
  selectedSpeed: {
    borderColor: '#234881',
    backgroundColor: '#F8FAFC',
  },
  speedContent: {
    flex: 1,
  },
  speedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  speedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#234881',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#234881',
  },
  speedFeatures: {
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  exchangeRate: {
    fontSize: 14,
    color: '#6B7280',
  },
  strikethrough: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
      },
      default: {
        elevation: 5,
      },
    }),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  discountText: {
    color: '#10B981',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    textDecorationLine: 'underline',
  },
  continueButton: {
    backgroundColor: '#234881',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 24,
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
      },
      default: {
        elevation: 5,
      },
    }),
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  infoSection: {
    marginBottom: 100,
  },
  infoText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 12,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeNavItem: {
    // Active state styling
  },
  activeNavIcon: {
    backgroundColor: '#234881',
    borderRadius: 20,
    padding: 8,
    marginBottom: 4,
  },
  navText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  activeNavText: {
    color: '#234881',
    fontWeight: '600',
  },
});

export default PaymentRecepentBefore;