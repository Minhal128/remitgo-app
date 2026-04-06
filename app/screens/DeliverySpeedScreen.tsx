import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BottomNavBar from '../../components/BottomNavBar';

const DeliverySpeedScreen = () => {
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
      pathname: '/screens/SelectBankScreen',
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
          <View style={[styles.progressBarFill, { width: '80%' }]} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Promotional Banner */}
        <View style={styles.promoBanner}>
          <Text style={styles.promoText}>Get zero fees on transfers of 20,000 PKR or more</Text>
        </View>

        {/* Transfer Details Box */}
        <View style={styles.transferBox}>
          <View style={styles.transferRow}>
            <View style={styles.amountSection}>
              <Text style={styles.amount}>2000</Text>
              <Text style={styles.amountLabel}>You send</Text>
            </View>
            <View style={styles.currencySection}>
              <Image source={require('../../assets/images/usd.png')} style={styles.flag} />
              <Text style={styles.currency}>USD</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.transferRow}>
            <View style={styles.amountSection}>
              <Text style={styles.amount}>558,386.57</Text>
              <Text style={styles.amountLabel}>They receive</Text>
            </View>
            <View style={styles.currencySection}>
              <View style={styles.flagPlaceholder} />
              <Text style={styles.currency}>PKR</Text>
            </View>
          </View>
        </View>

        {/* Promo Exchange Rate Banner */}
        <View style={styles.promoRateBanner}>
          <Feather name="zap" size={16} color="#7C3AED" />
          <Text style={styles.promoRateText}>Promo exchange rate applied</Text>
          <TouchableOpacity>
            <Feather name="info" size={16} color="#7C3AED" />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <Text style={styles.title}>Delivery speed</Text>

        {/* Express Option (Selected) */}
        <TouchableOpacity 
          style={[styles.speedOption, styles.selectedSpeed]}
          onPress={() => setSelectedSpeed('express')}
        >
          <View style={styles.speedContent}>
            <View style={styles.speedLeft}>
              <Feather name="zap" size={20} color="#234881" />
              <View style={styles.speedTexts}>
                <Text style={styles.speedTitle}>Deliver instantly</Text>
                <Text style={styles.speedSubtitle}>Pay with debit/credit card</Text>
              </View>
            </View>
            <View style={styles.speedRight}>
              <View style={styles.radioButton}>
                <View style={styles.radioButtonInner} />
              </View>
              <View style={styles.exchangeRate}>
                <Text style={styles.rateLabel}>1 USD =</Text>
                <View style={styles.rateValues}>
                  <Text style={styles.oldRate}>270.85</Text>
                  <Text style={styles.newRate}>272.14 PKR</Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Economy Option */}
        <TouchableOpacity 
          style={styles.speedOption}
          onPress={() => setSelectedSpeed('economy')}
        >
          <View style={styles.speedContent}>
            <View style={styles.speedLeft}>
              <Feather name="clock" size={20} color="#6B7280" />
              <View style={styles.speedTexts}>
                <Text style={styles.speedTitle}>Deliver in 3 to 6 days</Text>
                <Text style={styles.speedSubtitle}>Pay with debit/credit card</Text>
              </View>
            </View>
            <View style={styles.speedRight}>
              <View style={[styles.radioButton, styles.radioButtonUnselected]}>
                {selectedSpeed === 'economy' && <View style={styles.radioButtonInner} />}
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Continue Button */}
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavBar activeTab="send" />
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
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 24,
  },
  promoText: {
    color: '#1E40AF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  transferBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
      },
      default: {
        elevation: 4,
      },
    }),
  },
  transferRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  amountSection: {
    flex: 1,
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  amountLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  currencySection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagPlaceholder: {
    width: 24,
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginRight: 8,
  },
  currency: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  flag: {
    width: 24,
    height: 16,
    borderRadius: 2,
    marginRight: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  promoRateBanner: {
    backgroundColor: '#F3E8FF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  promoRateText: {
    color: '#7C3AED',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    marginLeft: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
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
        elevation: 4,
      },
    }),
  },
  selectedSpeed: {
    borderColor: '#234881',
    backgroundColor: '#F8FAFC',
  },
  speedContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  speedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  speedTexts: {
    marginLeft: 12,
  },
  speedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  speedSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  speedRight: {
    alignItems: 'flex-end',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#234881',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  radioButtonUnselected: {
    borderColor: '#D1D5DB',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#234881',
  },
  exchangeRate: {
    alignItems: 'flex-end',
  },
  rateLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  rateValues: {
    alignItems: 'flex-end',
  },
  oldRate: {
    fontSize: 12,
    color: '#6B7280',
    textDecorationLine: 'line-through',
  },
  newRate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
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
        elevation: 8,
      },
    }),
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default DeliverySpeedScreen;
