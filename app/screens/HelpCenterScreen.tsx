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

const HelpCenterScreen = () => {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.headerIcon} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <View style={styles.faqBox}>
          <Text style={styles.faqQ}>How do I use RemitGo?</Text>
          <Text style={styles.faqA}>RemitGo allows you to send and receive money internationally with ease. Simply sign up, add your payment method, and start transferring funds.</Text>
        </View>
        <View style={styles.faqBox}>
          <Text style={styles.faqQ}>How do I contact support?</Text>
          <Text style={styles.faqA}>You can contact our support team via the in-app chat or by emailing support@remitgo.com. We are available 24/7 to assist you.</Text>
        </View>
        <View style={styles.faqBox}>
          <Text style={styles.faqQ}>Is my information secure?</Text>
          <Text style={styles.faqA}>Yes, we use industry-standard encryption and security practices to protect your data and transactions.</Text>
        </View>
        <Text style={styles.sectionTitle}>Contact Us</Text>
        <View style={styles.contactBox}>
          <Text style={styles.contactText}>Email: support@remitgo.com</Text>
          <Text style={styles.contactText}>Phone: +1 800 123 4567</Text>
          <Text style={styles.contactText}>Live Chat: Available in-app 24/7</Text>
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
  faqBox: {
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
  faqQ: {
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
  },
  faqA: {
    color: '#444',
    fontSize: 14,
  },
  contactBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  contactText: {
    color: '#234881',
    fontSize: 15,
    marginBottom: 6,
  },
});

export default HelpCenterScreen; 