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

const LegalResourcesScreen = () => {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.headerIcon} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Legal Resources</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Legal Documents</Text>
        <View style={styles.infoBox}>
          <Text style={styles.optionTitle}>• Terms of Service</Text>
          <Text style={styles.optionDesc}>Read our terms and conditions for using RemitGo.</Text>
          <Text style={styles.optionTitle}>• Privacy Policy</Text>
          <Text style={styles.optionDesc}>Learn how we protect your data and privacy.</Text>
          <Text style={styles.optionTitle}>• Compliance</Text>
          <Text style={styles.optionDesc}>RemitGo complies with all relevant financial regulations and standards.</Text>
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

export default LegalResourcesScreen; 