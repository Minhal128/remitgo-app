import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const provinces = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Gilgit Baltistan',
  'Azad Kashmir',
  'Islamabad Capital Territory',
];

const AddRecipientScreen = () => {
  const [selectedProvince, setSelectedProvince] = useState('');
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
  const [smsChecked, setSmsChecked] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Add new recipients</Text>
        <TouchableOpacity>
          <Feather name="x" size={24} color="#222" />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Recipient contact information */}
        <Text style={styles.sectionTitle}>Recipient contact information</Text>
        <Text style={styles.label}>First name</Text>
        <TextInput style={styles.input} placeholder="e.g, Salman" placeholderTextColor="#999" />
        <Text style={styles.label}>Middle name <Text style={styles.optional}>(optional)</Text></Text>
        <TextInput style={styles.input} placeholder="e.g, karim" placeholderTextColor="#999" />
        <Text style={styles.label}>Last name</Text>
        <TextInput style={styles.input} placeholder="e.g, Baig" placeholderTextColor="#999" />
        <Text style={styles.label}>Phone number <Text style={styles.optional}>(optional)</Text></Text>
        <View style={styles.phoneRow}>
          <TouchableOpacity style={styles.countryPicker}>
            <Text style={styles.countryPickerText}>US (+1)</Text>
            <Feather name="chevron-down" size={18} color="#222" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
          <TextInput style={[styles.input, { flex: 1, marginLeft: 8 }]} placeholder="e.g, 932-***-****" placeholderTextColor="#999" keyboardType="phone-pad" />
        </View>
        <View style={styles.smsRow}>
          <TouchableOpacity onPress={() => setSmsChecked(!smsChecked)} style={styles.checkboxWrapper}>
            <View style={[styles.checkbox, smsChecked && styles.checkboxChecked]}>
              {smsChecked && <Feather name="check" size={16} color="#fff" />}
            </View>
          </TouchableOpacity>
          <Text style={styles.smsLabel}>Send SMS updates about this transfer to my recipient.</Text>
        </View>
        {/* Recipient email address */}
        <Text style={styles.sectionTitle}>Recipient email address</Text>
        <Text style={styles.label}>Email address <Text style={styles.optional}>(optional)</Text></Text>
        <TextInput style={styles.input} placeholder="e.g, salmankarimuiux@gmail.com" placeholderTextColor="#999" keyboardType="email-address" />
        {/* Recipient address */}
        <Text style={styles.sectionTitle}>Recipient address</Text>
        <Text style={styles.label}>Street address <Text style={styles.optional}>(optional)</Text></Text>
        <TextInput style={styles.input} placeholder="e.g, Club road" placeholderTextColor="#999" />
        <Text style={styles.label}>City <Text style={styles.optional}>(optional)</Text></Text>
        <TextInput style={styles.input} placeholder="e.g, Gilgit Baltistan" placeholderTextColor="#999" />
        <Text style={styles.label}>Province <Text style={styles.optional}>(optional)</Text></Text>
        <TouchableOpacity style={styles.dropdown} onPress={() => setShowProvinceDropdown(!showProvinceDropdown)}>
          <Text style={[styles.dropdownText, !selectedProvince && { color: '#999' }]}>
            {selectedProvince ? selectedProvince : 'Select a province'}
          </Text>
          <Feather name="chevron-down" size={18} color="#222" />
        </TouchableOpacity>
        {showProvinceDropdown && (
          <View style={styles.dropdownList}>
            {provinces.map((prov) => (
              <TouchableOpacity
                key={prov}
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedProvince(prov);
                  setShowProvinceDropdown(false);
                }}
              >
                <Text style={styles.dropdownText}>{prov}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="home" size={24} color="#7f8c8d" />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="users" size={24} color="#234881" />
          <Text style={[styles.navLabel, styles.activeNavLabel]}>Recipients</Text>
        </TouchableOpacity>
        <View style={styles.sendButtonWrapper}>
          <TouchableOpacity style={styles.sendButton}>
            <Feather name="send" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.sendLabel}>Send</Text>
        </View>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="gift" size={24} color="#7f8c8d" />
          <Text style={styles.navLabel}>Rewards</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="grid" size={24} color="#7f8c8d" />
          <Text style={styles.navLabel}>Manage</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222',
    marginTop: 18,
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    color: '#222',
    fontWeight: '500',
    marginBottom: 6,
    marginTop: 0,
    textAlign: 'left',
  },
  optional: {
    color: '#999',
    fontWeight: '400',
    fontSize: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#222',
    marginBottom: 16,
    backgroundColor: '#fff',
    fontWeight: '400',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  countryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  countryPickerText: {
    fontSize: 15,
    color: '#222',
    fontWeight: '400',
  },
  smsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkboxWrapper: {
    marginRight: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#234881',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#234881',
    borderColor: '#234881',
  },
  smsLabel: {
    fontSize: 13,
    color: '#222',
    fontWeight: '400',
    flex: 1,
    flexWrap: 'wrap',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  dropdownText: {
    fontSize: 15,
    color: '#222',
    fontWeight: '400',
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 16,
    marginTop: -8,
    zIndex: 10,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 24,
  },
  cancelBtn: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  cancelText: {
    color: '#222',
    fontSize: 15,
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: '#234881',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  saveText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
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
        boxShadow: '0px 2px 4px rgba(0,0,0, 0.2)',
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
});

export default AddRecipientScreen; 