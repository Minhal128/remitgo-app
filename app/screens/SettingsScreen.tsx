import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View, Modal, FlatList, TextInput } from 'react-native';
import BottomNavBar from '../../components/BottomNavBar';
import countriesData from '../../assets/images/countries.json';
import CountryFlag from '../../components/CountryFlag';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = () => {
  const router = useRouter();
  const [country, setCountry] = React.useState({ name: 'Pakistan', alpha2Code: 'PK' });
  const [showCountryModal, setShowCountryModal] = React.useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileActivity, setProfileActivity] = useState(true);
  const [appNotifications, setAppNotifications] = useState(true);
  const [emails, setEmails] = useState(true);
  const [textMessages, setTextMessages] = useState(false);
  const [biometric, setBiometric] = useState(true);

  // Load country from AsyncStorage on mount
  React.useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('selectedCountry');
      if (stored) setCountry(JSON.parse(stored));
    })();
}, []);

  // Save country to AsyncStorage when changed
  React.useEffect(() => {
    AsyncStorage.setItem('selectedCountry', JSON.stringify(country));
  },[country]);

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
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 24 }} />
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

        {/* Profile activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile activity</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Profile activity</Text>
            <Switch
              value={profileActivity}
              onValueChange={setProfileActivity}
              trackColor={{ false: '#e0e0e0', true: '#234881' }}
              thumbColor={profileActivity ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingText}>App notifications</Text>
            <Switch
              value={appNotifications}
              onValueChange={setAppNotifications}
              trackColor={{ false: '#e0e0e0', true: '#234881' }}
              thumbColor={appNotifications ? '#fff' : '#f4f3f4'}
            />
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Emails</Text>
            <Switch
              value={emails}
              onValueChange={setEmails}
              trackColor={{ false: '#e0e0e0', true: '#234881' }}
              thumbColor={emails ? '#fff' : '#f4f3f4'}
            />
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Text messages</Text>
            <Switch
              value={textMessages}
              onValueChange={setTextMessages}
              trackColor={{ false: '#e0e0e0', true: '#234881' }}
              thumbColor={textMessages ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Biometric authentication</Text>
            <Switch
              value={biometric}
              onValueChange={setBiometric}
              trackColor={{ false: '#e0e0e0', true: '#234881' }}
              thumbColor={biometric ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>
      </ScrollView>
      <BottomNavBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#fff',
  }, scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 18,
    paddingBottom: 18,
  },headerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
    textAlign: 'center',
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },label: {
    fontSize: 15,
    color: '#222',
    fontWeight: '400',
  },
  value: {
    fontSize: 15,
    color: '#222',
    fontWeight: '400',
  },flag: {
    width: 24,
    height: 16,
    borderRadius: 3,
    marginLeft: 10,
  },
  section: {
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    paddingVertical: 14,
  },sectionLabel: {
    fontSize: 15,
    color: '#222',
    fontWeight: '700',
    marginBottom: 2,
  },
  sectionDesc: {
    fontSize: 13,
    color: '#222',
    fontWeight: '400',
    marginBottom: 4,
  },sectionNote: {
    fontSize: 11,
    color: '#888',
    fontWeight: '400',
    marginBottom: 0,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },// New styles for the new modal and country selection
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '70%',
    padding: 20,
  },modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },searchContainer: {
    marginBottom: 15,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#222',
  },countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },
  countryName: {
    fontSize: 16,
    color: '#222',
    marginLeft: 10,
    flex: 1,
  },countryList: {
    maxHeight: 400,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },countryItemText: {
    fontSize: 15,
    color: '#222',
    marginLeft: 10,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 15,
    color: '#222',
    fontWeight: '700',
    marginBottom: 5,
  },settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  settingText: {
    fontSize: 15,
    color: '#222',
    fontWeight: '400',
  },});

export default SettingsScreen; 