import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import BottomNavBar from '../../components/BottomNavBar';
import { useRouter } from 'expo-router';

const AboutUsScreen = () => {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.headerIcon} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Us</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Our Story</Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>RemitGo was founded with a mission to make international money transfers fast, secure, and affordable for everyone. Our team is passionate about financial inclusion and innovation.</Text>
          <Text style={styles.infoText}>We believe in transparency, customer service, and leveraging technology to empower our users worldwide.</Text>
        </View>
        <Text style={styles.sectionTitle}>Our Values</Text>
        <View style={styles.infoBox}>
          <Text style={styles.optionTitle}>• Security</Text>
          <Text style={styles.optionDesc}>Your data and money are protected with industry-leading security measures.</Text>
          <Text style={styles.optionTitle}>• Innovation</Text>
          <Text style={styles.optionDesc}>We constantly improve our platform to offer the best experience.</Text>
          <Text style={styles.optionTitle}>• Customer Focus</Text>
          <Text style={styles.optionDesc}>We listen to your feedback and put your needs first.</Text>
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
    ...Platform.select({
      web: {
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.06)',
      },
      default: {
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
        elevation: 1,
      },
    }),
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

export default AboutUsScreen; 