import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import BottomNavBar from '../../components/BottomNavBar';
import { apiFetch } from '../utils/api';

const ReferFriendsScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [referralLink, setReferralLink] = useState('');
  const [error, setError] = useState('');

  const handleGenerateLink = async () => {
    setLoading(true);
    setError('');
    try {
      // Replace with your backend endpoint
      const res = await apiFetch('/referral/generate-link');
      setReferralLink(res.link);
    } catch (err) {
      setError('Failed to generate referral link.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!referralLink) return;
    try {
      await Share.share({
        message: `Join RemitGo and get rewards! Use my referral link: ${referralLink}`,
      });
    } catch (err) {
      setError('Failed to share link.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.headerIcon} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Refer Friends</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.infoText}>Invite your friends and earn rewards when they join RemitGo using your referral link!</Text>
        <TouchableOpacity style={styles.generateButton} onPress={handleGenerateLink} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.generateButtonText}>Generate Referral Link</Text>}
        </TouchableOpacity>
        {referralLink ? (
          <View style={styles.linkBox}>
            <Text style={styles.linkText}>{referralLink}</Text>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Feather name="share-2" size={18} color="#fff" />
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        ) : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
      <BottomNavBar activeTab="manage" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  headerIcon: {
    padding: 8,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  infoText: {
    fontSize: 16,
    color: '#234881',
    textAlign: 'center',
    marginBottom: 24,
  },
  generateButton: {
    backgroundColor: '#234881',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginBottom: 24,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  linkBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  linkText: {
    color: '#234881',
    fontSize: 15,
    marginBottom: 8,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#234881',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginTop: 8,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 15,
    marginLeft: 8,
  },
  errorText: {
    color: '#e74c3c',
    marginTop: 12,
    fontSize: 14,
  },
});

export default ReferFriendsScreen; 