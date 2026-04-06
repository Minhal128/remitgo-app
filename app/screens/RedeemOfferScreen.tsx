import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { apiFetch } from '../utils/api';
import BottomNavBar from '../../components/BottomNavBar';
import { IconSymbol } from '../../components/ui/IconSymbol';

const RedeemOfferScreen = () => {
  const [loading, setLoading] = useState(false);
  const [redeemed, setRedeemed] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [wallet, setWallet] = useState<any>(null);
  const router = useRouter();

  // Fetch wallet on mount
  React.useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await apiFetch('/wallet/get-by-user');
        setWallet(res);
      } catch (err) {
        setWallet(null);
      }
    };
    fetchWallet();
  }, []);

  const handleClaim = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch('/wallet/redeem-offer', { method: 'POST' });
      setSuccess(true);
      setRedeemed(true);
      // Fetch updated wallet
      const updated = await apiFetch('/wallet/get-by-user');
      setWallet(updated);
    } catch (err: any) {
      let errorMsg = 'Failed to redeem offer';
      if (typeof err === 'string') {
        errorMsg = err;
      } else if (err && typeof err.message === 'string') {
        try {
          const parsed = JSON.parse(err.message);
          if (parsed && typeof parsed.message === 'string') {
            errorMsg = parsed.message;
          } else {
            errorMsg = err.message;
          }
        } catch {
          errorMsg = err.message;
        }
      }
      // Only show if not generic server error
      if (errorMsg !== 'Server error' && errorMsg !== '{"message":"Server error"}') {
        setError(errorMsg);
      } else {
        setError('');
      }
      if (errorMsg.includes('already redeemed')) {
        setRedeemed(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Arrow */}
      <TouchableOpacity style={styles.backArrow} onPress={() => router.back()}>
        <IconSymbol name={"chevron.right"} size={28} color="#234881" style={{ transform: [{ scaleX: -1 }] }} />
      </TouchableOpacity>
      {/* Removed Wallet Balance */}
      <View style={styles.windowBar}>
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
      <Text style={styles.giftTitle}>THANK YOU WE HAVE A SPECIAL GIFT FOR YOU</Text>
      <Text style={styles.cashbackTitle}>Get Cashback</Text>
      <Text style={styles.infoText}>Here's your cashback code... but hurry! It expires in 24 hours</Text>
      <View style={styles.couponBox}>
        <Text style={styles.couponText}>$10 CASHBACK</Text>
      </View>
      <Text style={styles.redeemText}>
        Please redeem this cashback on any product within the next 24 hours to receive an instant $10 credited to your wallet.
      </Text>
      {success && <Text style={styles.success}>Successfully Redeemed!</Text>}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity
        style={[styles.claimBtn, (redeemed || loading) && styles.disabledBtn]}
        onPress={async () => {
          await handleClaim();
        }}
        disabled={redeemed || loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.claimBtnText}>{redeemed ? 'Already Claimed' : 'Claim it'}</Text>}
      </TouchableOpacity>
      {/* Bottom Navigation Bar */}
      <BottomNavBar activeTab="rewards" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    paddingTop: 48,
  },backArrow: {
    position: 'absolute',
    top: 36,
    left: 16,
    zIndex: 10,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
  shadowRadius: 4,
    elevation: 2,
  },balanceCard: {
    backgroundColor: '#234881',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 18,
    alignSelf: 'stretch',
  },
  balanceLabel: {
    color: 'white',
    fontSize: 14,
    marginBottom: 4,
  },balanceAmount: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
  },
  windowBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    alignSelf: 'flex-start',
    marginLeft: 2,
  },dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFB74D',
    marginRight: 6,
  },
  giftTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 0.5,
  },cashbackTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#234881',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 1.2,
  },
  infoText: {
    fontSize: 13,
    color: '#222',
    marginBottom: 16,
    textAlign: 'center',
  },couponBox: {
    borderWidth: 2,
    borderColor: '#bdbdbd',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 18,
    paddingHorizontal: 36,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  couponText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    letterSpacing: 2,
    textAlign: 'center',
  },redeemText: {
    fontSize: 12,
    color: '#222',
    marginBottom: 18,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  claimBtn: {
    backgroundColor: '#234881',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 48,
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 8,
  },claimBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  disabledBtn: {
    backgroundColor: '#bdbdbd',
  },success: {
    color: '#27ae60',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  error: {
    color: '#d32f2f',
    fontSize: 15,
    marginBottom: 8,
    textAlign: 'center',
  },});

export default RedeemOfferScreen; 