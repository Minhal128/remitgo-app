import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import countriesData from '../../assets/images/countries.json';
import BottomNavBar from '../../components/BottomNavBar';
import CountryFlag from '../../components/CountryFlag';

const ManageScreen = () => {
  const [country, setCountry] = useState({
    name: 'Pakistan',
    alpha2Code: 'PK',
  });
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // Filter countries based on search query
  const filteredCountries = countriesData
    .filter(country => 
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.alpha2Code.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Manage</Text>
        </View>

        {/* Country Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Country</Text>
          <TouchableOpacity style={styles.countryRow} onPress={() => setShowCountryModal(true)}>
            <CountryFlag countryCode={country.alpha2Code} size={24} />
            <Text style={styles.countryName}>{country.name}</Text>
            <Feather name="chevron-right" size={20} color="#bdbdbd" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        </View>

        {/* Country Selection Modal */}
        <Modal
          visible={showCountryModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowCountryModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Country</Text>
                <TouchableOpacity onPress={() => setShowCountryModal(false)}>
                  <Feather name="x" size={22} color="#222" />
                </TouchableOpacity>
              </View>

              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search country..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
                />
              </View>

              {/* Country List */}
              <FlatList
                data={filteredCountries}
                keyExtractor={item => item.alpha2Code}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.countryItem}
                    onPress={() => {
                      setCountry(item);
                      setShowCountryModal(false);
                      setSearchQuery('');
                    }}
                  >
                    <CountryFlag countryCode={item.alpha2Code} size={20} />
                    <Text style={styles.countryItemText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
                style={styles.countryList}
              />
            </View>
          </View>
        </Modal>

        {/* Menu Items */}
        <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/screens/ProfileScreen')}>
          <Feather name="user" size={22} color="#bdbdbd" style={styles.menuIcon} />
          <Text style={styles.menuText}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/screens/SettingsScreen')}>
          <Feather name="settings" size={22} color="#bdbdbd" style={styles.menuIcon} />
          <Text style={styles.menuText}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/screens/MethodScreen')}>
          <Feather name="credit-card" size={22} color="#bdbdbd" style={styles.menuIcon} />
          <Text style={styles.menuText}>Payment methods</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/screens/RedeemOfferScreen')}>
          <Feather name="award" size={22} color="#bdbdbd" style={styles.menuIcon} />
          <Text style={styles.menuText}>Redeem offer</Text>
        </TouchableOpacity>
        
        {/* RemitGo section */}
        <Text style={styles.sectionTitle}>RemitGo</Text>
        <TouchableOpacity style={styles.linkRow} onPress={() => router.push('./PrivacyChoicesScreen')}>
          <Text style={styles.linkText}>Privacy choices</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkRow} onPress={() => router.push('./LegalResourcesScreen')}>
          <Text style={styles.linkText}>Legal resources</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkRow} onPress={() => router.push('./AboutUsScreen')}>
          <Text style={styles.linkText}>About us</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.signOutRow}
          onPress={() => setShowSignOutModal(true)}
        >
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>

        {/* Sign Out Confirmation Modal */}
        <Modal
          visible={showSignOutModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowSignOutModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Sign Out</Text>
              <Text style={styles.modalMessage}>Are you sure you want to sign out?</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]} 
                  onPress={() => setShowSignOutModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.signOutButton]} 
                  onPress={() => {
                    // Handle sign out logic here
                    setShowSignOutModal(false);
                    router.push('/screens/signin');
                  }}
                >
                  <Text style={styles.signOutButtonText}>Sign Out</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
      <BottomNavBar activeTab="manage" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#222',
    marginTop: 18,
    marginBottom: 10,
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f8fa',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  countryName: {
    fontSize: 14,
    color: '#222',
    fontWeight: '500',
    marginLeft: 10,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },
  menuIcon: {
    marginRight: 16,
  },
  menuText: {
    fontSize: 15,
    color: '#222',
    fontWeight: '400',
  },
  linkRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },
  linkText: {
    fontSize: 15,
    color: '#222',
    fontWeight: '400',
  },
  signOutRow: {
    paddingVertical: 14,
  },
  signOutText: {
    fontSize: 15,
    color: '#d32f2f',
    fontWeight: '700',
  },
  versionText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingTop: 10,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  navItem: {
    alignItems: 'center',
  },
  navLabel: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  activeNavLabel: {
    color: '#234881',
    fontWeight: '700',
  },
  sendButtonWrapper: {
    alignItems: 'center',
    marginTop: 10,
  },
  sendButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#234881',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
      },
      default: {
        elevation: 5,
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    margin: 20,
    minWidth: 280,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
      },
      default: {
        elevation: 5,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: '#d32f2f',
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#222',
  },
  countryList: {
    maxHeight: 400,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },
  countryItemText: {
    fontSize: 15,
    color: '#222',
    fontWeight: '400',
    marginLeft: 10,
  },
});

export default ManageScreen; 