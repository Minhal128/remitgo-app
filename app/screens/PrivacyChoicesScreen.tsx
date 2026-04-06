import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import BottomNavBar from '../../components/BottomNavBar';

const PrivacyChoicesScreen = () => {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.headerIcon} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Choices</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Your Privacy Options</Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>You control your data. Choose how your information is used and shared:</Text>
          <Text style={styles.optionTitle}>• Data Sharing</Text>
          <Text style={styles.optionDesc}>Manage how your data is shared with third parties for analytics and marketing.</Text>
          <Text style={styles.optionTitle}>• Communication Preferences</Text>
          <Text style={styles.optionDesc}>Opt in or out of marketing emails, SMS, and push notifications.</Text>
          <Text style={styles.optionTitle}>• Delete Account</Text>
          <Text style={styles.optionDesc}>Request deletion of your account and all associated data.</Text>
        </View>
      </ScrollView>
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
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#234881',
    marginTop: 18,
    marginBottom: 10,
  },
  infoBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  infoText: {
    color: '#444',
    fontSize: 15,
    marginBottom: 12,
  },
  optionTitle: {
    fontWeight: '700',
    color: '#234881',
    marginTop: 10,
    marginBottom: 2,
  },
  optionDesc: {
    color: '#222',
    fontSize: 14,
    marginBottom: 6,
  },
});

export default PrivacyChoicesScreen; 