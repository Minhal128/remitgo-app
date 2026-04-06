import { Feather } from '@expo/vector-icons';
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
  TouchableOpacity,
  View,
} from 'react-native';
import BottomNavBar from '../../components/BottomNavBar';
import { apiFetch } from '../utils/api';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
  },
  flagIconLarge: {
    width: 40,
    height: 30,
    marginRight: 16,
    marginLeft: 4,
    resizeMode: 'contain',
  },
  headerContentCenteredWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  headerContentCentered: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  rateInfoCentered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rateLabelCentered: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
    marginBottom: 2,
    textAlign: 'center',
  },
  rateValueCentered: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    textAlign: 'center',
  },
  rateHighlight: {
    color: '#234881',
    fontWeight: 'bold',
    fontSize: 18,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  offerCard: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    marginBottom: 16,
  },
  giftIcon: {
    width: 48,
    height: 48,
    tintColor: '#234881',
  },
  chatIcon: {
    width: 48,
    height: 48,
    tintColor: '#234881',
  },
  planeIcon: {
    width: 48,
    height: 48,
    tintColor: '#234881',
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  offerDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingBottom: 32,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 56, // Space above bottom nav and floating button
    width: '100%',
  },
  getStartedButton: {
    backgroundColor: '#234881',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navIcon: {
    width: 24,
    height: 24,
    marginBottom: 4,
    tintColor: '#7f8c8d',
  },
  navLabel: {
    fontSize: 10,
    color: '#7f8c8d',
    fontWeight: '500',
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
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
      },
      default: {
        elevation: 6,
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

const TransferApp = () => {
  const router = useRouter();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiFetch('/user/profile');
        setProfile(data);
      } catch (err) {
        // Optionally show error
      }
    };
    fetchProfile();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Image
            source={require('../../assets/images/pakistan.png')}
            style={styles.flagIconLarge}
          />
          <View style={styles.headerContentCenteredWrapper}>
            <View style={styles.headerContentCentered}>
              <Feather name="edit-2" size={16} color="#234881" style={{ marginLeft: 8, marginBottom: 2 }} />
              <View style={styles.rateInfoCentered}>
                <Text style={styles.rateLabelCentered}>OUR BEST RATE</Text>
                <Text style={styles.rateValueCentered}>1 USD = <Text style={styles.rateHighlight}>272.20 PKR</Text></Text>
              </View>
            </View>
          </View>
        </View>
      </View>
      {/* Main Content Scrollable */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.mainContent}>
          {/* First Offer Card */}
          <View style={styles.offerCard}>
            <View style={styles.iconContainer}>
              <Image
                source={require('../../assets/images/gift.png')}
                style={styles.giftIcon}
              />
            </View>
            <Text style={styles.offerTitle}>New customer offer</Text>
            <Text style={styles.offerDescription}>
              Get started now with a special offer on your first transfer
            </Text>
          </View>
          {/* Second Offer Card */}
          <View style={styles.offerCard}>
            <View style={styles.iconContainer}>
              <Image
                source={require('../../assets/images/call.png')}
                style={styles.chatIcon}
              />
            </View>
            <Text style={styles.offerTitle}>New customer offer</Text>
            <Text style={styles.offerDescription}>
              Have questions? Chat or talk to our team 24/7.
            </Text>
          </View>
          {/* Third Offer Card */}
          <View style={styles.offerCard}>
            <View style={styles.iconContainer}>
              <Image
                source={require('../../assets/images/filled_send.png')}
                style={styles.planeIcon}
              />
            </View>
            <Text style={styles.offerTitle}>New customer offer</Text>
            <Text style={styles.offerDescription}>
              Need to change details? You can edit active transfer here in the app
            </Text>
          </View>
          {/* Get Started Button - centered, with margin at bottom */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.getStartedButton} onPress={() => router.push('/screens/Features')}>
              <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      {/* Bottom Navigation */}
      <BottomNavBar activeTab="wallet" />
    </SafeAreaView>
  );
};

export default TransferApp;