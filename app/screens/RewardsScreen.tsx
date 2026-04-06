import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Share,
  ActivityIndicator,
  Alert,
  Clipboard,
  Modal,
  Platform
} from 'react-native';
import BottomNavBar from '../../components/BottomNavBar';
import { apiFetch } from '../utils/api';

const faqs = [
  { q: 'How do referrals work?', a: 'You get a reward when your friend completes their first transfer.' },
  { q: 'How do I use my rewards?', a: 'Rewards are automatically applied to your next eligible transfer.' },
  { q: "Why haven't I received my rewards?", a: 'Rewards are credited after your referral completes a qualifying transfer.' },
];

export default function RewardsScreen() {
  const [openIndex, setOpenIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [referralLink, setReferralLink] = useState('');
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  // Handler for Invite Now
  const handleInviteNow = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/referral');
      const link = data.referralLink;
      if (!link) throw new Error('No referral link received');
      setReferralLink(link);
      setModalVisible(true);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to generate referral link.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    setCopying(true);
    Clipboard.setString(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    setCopying(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerIcon} onPress={() => {
            if (router.canGoBack && router.canGoBack()) {
              router.back();
            } else {
              router.replace('/screens/WalletScreen');
            }
          }}>
            <Feather name="arrow-left" size={20} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Rewards</Text>
          <TouchableOpacity>
            <Feather name="info" size={20} color="#222" />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* On first transfer card */}
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>On first transfer</Text>
              <View style={styles.bulletRow}><Feather name="check-circle" size={16} color="#234881" style={{ marginRight: 6 }} /><Text style={styles.bulletText}>Special exchange rate</Text></View>
              <View style={styles.bulletRow}><Feather name="check-circle" size={16} color="#234881" style={{ marginRight: 6 }} /><Text style={styles.bulletText}>Fee-free transfer</Text></View>
              <Text style={styles.cardNote}>Offer subject to change. Terms and conditions apply.</Text>
            </View>
            <Image source={require('../../assets/images/transfer.png')} style={styles.cardImage} />
          </View>
          {/* Successful referrals card */}
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Successful referrals</Text>
              <Text style={styles.referralCount}>0</Text>
              <Text style={styles.referralLabel}>Total</Text>
              <Text style={styles.cardNote}>Offer subject to change. Terms and conditions apply.</Text>
            </View>
            <Image source={require('../../assets/images/successful.png')} style={styles.cardImage} />
          </View>
          {/* Invite friends */}
          <View style={styles.inviteSection}>
            <Text style={styles.inviteTitle}>Invite friends to earn rewards</Text>
            <Text style={styles.inviteDesc}>Get a zero fee transfer for every friend who you refer!</Text>
            <TouchableOpacity style={styles.inviteBtn} onPress={handleInviteNow} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.inviteBtnText}>Invite now</Text>
              )}
            </TouchableOpacity>
          </View>
          {/* FAQ Accordion */}
          <Text style={styles.faqTitle}>Tell me more</Text>
          <View style={styles.faqSection}>
            {faqs.map((faq, i) => (
              <View key={i} style={styles.faqItem}>
                <TouchableOpacity style={styles.faqHeader} onPress={() => setOpenIndex(openIndex === i ? -1 : i)}>
                  <Text style={styles.faqQ}>{faq.q}</Text>
                  <Feather name={openIndex === i ? 'chevron-up' : 'chevron-down'} size={20} color="#222" />
                </TouchableOpacity>
                {openIndex === i && <Text style={styles.faqA}>{faq.a}</Text>}
              </View>
            ))}
          </View>
        </ScrollView>
        <BottomNavBar activeTab="rewards" />
      </View>
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Your Referral Link</Text>
            <Text style={styles.modalLink}>{referralLink}</Text>
            <TouchableOpacity style={styles.copyButton} onPress={handleCopy} disabled={copying}>
              <Text style={styles.copyButtonText}>{copied ? 'Copied!' : copying ? 'Copying...' : 'Copy'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f8fa',
  },container: {
    flex: 1,
    backgroundColor: '#f7f8fa',
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: '#f7f8fa',
    borderBottomWidth: 0,
    minHeight: 48,
  },headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  headerIcon: {
    padding: 5,
  },scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    paddingTop: 0,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f1f3',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222',
    marginBottom: 10,
  },bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  bulletText: {
    fontSize: 13,
    color: '#222',
    fontWeight: '400',
  },cardNote: {
    fontSize: 10,
    color: '#888',
    marginTop: 8,
    fontWeight: '400',
  },
  cardImage: {
    width: 70,
    height: 70,
    marginLeft: 16,
    resizeMode: 'contain',
    alignSelf: 'flex-end',
  },referralCount: {
    fontSize: 22,
    fontWeight: '700',
    color: '#234881',
    marginTop: 2,
    marginBottom: 0,
  },
  referralLabel: {
    fontSize: 12,
    color: '#222',
    fontWeight: '400',
    marginBottom: 2,
  },  inviteSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f1f3',
    alignItems: 'center',
  },inviteTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222',
    marginTop: 0,
    marginBottom: 6,
    textAlign: 'center',
  },
  inviteDesc: {
    fontSize: 13,
    color: '#222',
    fontWeight: '400',
    marginBottom: 14,
    textAlign: 'center',
  },inviteBtn: {
    backgroundColor: '#234881',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
    marginTop: 0,
    marginBottom: 0,
  },
  inviteBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },faqTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222',
    marginTop: 8,
    marginBottom: 6,
    paddingLeft: 2,
  },
  faqSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingTop: 2,
    paddingBottom: 2,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f1f3',
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#ececec',
    paddingVertical: 0,
    marginBottom: 0,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 2,
  },
  faqQ: {
    fontSize: 15,
    color: '#222',
    fontWeight: '500',
  },
  faqA: {
    fontSize: 13,
    color: '#222',
    fontWeight: '400',
    marginBottom: 8,
    marginLeft: 2,
    marginRight: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '85%',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#234881',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalLink: {
    fontSize: 14,
    color: '#222',
    marginBottom: 18,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  closeButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#f0f1f3',
  },
  closeButtonText: {
    color: '#234881',
    fontWeight: '600',
    fontSize: 15,
  },
  copyButton: {
    backgroundColor: '#234881',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginBottom: 8,
  },
  copyButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
}); 