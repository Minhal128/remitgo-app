import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BottomNavBar from '../../components/BottomNavBar';

const PaymentSuccessScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [countdown, setCountdown] = useState(5);
  
  // Get transfer details from params
  const transferId = params.transferId as string;
  const amount = params.amount as string;
  const recipientName = params.recipientName as string;
  const status = params.status as string;

  // Auto-redirect to WalletScreen after countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Automatically redirect to WalletScreen
      router.replace('/screens/WalletScreen');
    }
  }, [countdown, router]);

  // Format current date
  const getCurrentDate = () => {
    const now = new Date();
    const day = now.getDate();
    const month = now.toLocaleDateString('en-US', { month: 'long' });
    const year = now.getFullYear();
    return `${day} ${month} ${year}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon} onPress={() => router.replace('/screens/WalletScreen')}>
          <Feather name="arrow-left" size={24} color="#222" />
        </TouchableOpacity>
        <Image source={require('../../assets/images/logo.jpg')} style={styles.logo} />
        <TouchableOpacity style={styles.headerIcon} onPress={() => router.replace('/screens/WalletScreen')}>
          <Feather name="x" size={24} color="#222" />
        </TouchableOpacity>
      </View>
      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBg}>
          <View style={styles.progressBarFill} />
        </View>
      </View>
      <View style={styles.contentWrapper}>
        <Image source={require('../../assets/images/payment_success.png')} style={styles.successImage} />
        <Text style={styles.title}>Transfer Successful!</Text>
        <Text style={styles.message}>
          Congratulations! You have successfully{"\n"}
          transferred {amount || '2000'} USD to {recipientName || 'Recipient'}{"\n"}
          on {getCurrentDate()}
        </Text>
        
        {/* Countdown and Auto-redirect Info */}
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownText}>
            Redirecting to Wallet in {countdown} seconds...
          </Text>
        </View>
        
        <TouchableOpacity style={styles.doneBtn} onPress={() => router.replace('/screens/WalletScreen')}>
          <Text style={styles.doneBtnText}>Go to Wallet Now</Text>
        </TouchableOpacity>
      </View>
      <BottomNavBar activeTab="send" />
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
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignSelf: 'center',
  },
  progressBarContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  progressBarBg: {
    width: '100%',
    height: 4,
    backgroundColor: '#e5e5e5',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    width: '100%',
    height: 4,
    backgroundColor: '#234881',
    borderRadius: 2,
  },
  contentWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  successImage: {
    width: 180,
    height: 180,
    marginBottom: 32,
    marginTop: 8,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 18,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#222',
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 36,
    lineHeight: 22,
  },
  doneBtn: {
    backgroundColor: '#234881',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
    marginTop: 0,
    marginBottom: 16,
  },
  doneBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  countdownContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  countdownText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default PaymentSuccessScreen; 