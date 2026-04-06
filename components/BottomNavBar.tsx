import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';


type BottomNavBarTab = 'wallet' | 'recipients' | 'send' | 'rewards' | 'manage';
interface BottomNavBarProps {
  activeTab: BottomNavBarTab;
  onSendPress?: () => void; // Add custom send handler
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onSendPress }) => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.tab} onPress={() => router.replace('/screens/WalletScreen')}>
        <Feather name="home" size={24} color={activeTab === 'wallet' ? '#234881' : '#222'} />
        <Text style={[styles.label, activeTab === 'wallet' && styles.activeLabel]}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.tab} onPress={() => router.replace('/screens/RecipientsScreen')}>
        <Feather name="users" size={24} color={activeTab === 'recipients' ? '#234881' : '#222'} />
        <Text style={[styles.label, activeTab === 'recipients' && styles.activeLabel]}>Recipients</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.sendButton} onPress={onSendPress || (() => router.replace('/screens/HomePage'))}>
        <Feather name="send" size={32} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.tab} onPress={() => router.replace('/screens/RewardsScreen')}>
        <MaterialCommunityIcons name="gift-outline" size={24} color={activeTab === 'rewards' ? '#234881' : '#222'} />
        <Text style={[styles.label, activeTab === 'rewards' && styles.activeLabel]}>Rewards</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.tab} onPress={() => router.replace('/screens/ManageScreen')}>
        <Feather name="grid" size={24} color={activeTab === 'manage' ? '#234881' : '#222'} />
        <Text style={[styles.label, activeTab === 'manage' && styles.activeLabel]}>Manage</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 72,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'space-around',
    ...Platform.select({
      web: {
        boxShadow: '0px -2px 8px rgba(0, 0, 0, 0.06)',
      },
      default: {
        elevation: 8,
      },
    }),
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#222',
    marginTop: 2,
    fontWeight: '400',
  },
  activeLabel: {
    color: '#234881',
    fontWeight: '700',
  },
  sendButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#234881',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -32,
    borderWidth: 4,
    borderColor: '#fff',
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 8px rgba(35, 72, 129, 0.18)',
      },
      default: {
        elevation: 8,
      },
    }),
  },
});

export default BottomNavBar; 