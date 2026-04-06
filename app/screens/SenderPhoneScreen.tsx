import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import BottomNavBar from '../../components/BottomNavBar';
import CountryFlag from '../../components/CountryFlag';
import { apiFetch } from '../utils/api';
import { getNextScreenForTransfer } from '../utils/profileUtils';

interface Country {
  name: string;
  dialCode: string;
  code: string;
}

const countries: Country[] = [
  { name: 'Pakistan', dialCode: '+92', code: 'PK' },
  { name: 'United States', dialCode: '+1', code: 'US' },
  { name: 'United Kingdom', dialCode: '+44', code: 'GB' },
  { name: 'Canada', dialCode: '+1', code: 'CA' },
  { name: 'Australia', dialCode: '+61', code: 'AU' },
  { name: 'Germany', dialCode: '+49', code: 'DE' },
  { name: 'France', dialCode: '+33', code: 'FR' },
  { name: 'Italy', dialCode: '+39', code: 'IT' },
  { name: 'Spain', dialCode: '+34', code: 'ES' },
  { name: 'Netherlands', dialCode: '+31', code: 'NL' },
  { name: 'Belgium', dialCode: '+32', code: 'BE' },
  { name: 'Switzerland', dialCode: '+41', code: 'CH' },
  { name: 'Austria', dialCode: '+43', code: 'AT' },
  { name: 'Sweden', dialCode: '+46', code: 'SE' },
  { name: 'Norway', dialCode: '+47', code: 'NO' },
  { name: 'Denmark', dialCode: '+45', code: 'DK' },
  { name: 'Finland', dialCode: '+358', code: 'FI' },
  { name: 'Poland', dialCode: '+48', code: 'PL' },
  { name: 'Czech Republic', dialCode: '+420', code: 'CZ' },
  { name: 'Hungary', dialCode: '+36', code: 'HU' },
  { name: 'Slovakia', dialCode: '+421', code: 'SK' },
  { name: 'Slovenia', dialCode: '+386', code: 'SI' },
  { name: 'Croatia', dialCode: '+385', code: 'HR' },
  { name: 'Serbia', dialCode: '+381', code: 'RS' },
  { name: 'Bulgaria', dialCode: '+359', code: 'BG' },
  { name: 'Romania', dialCode: '+40', code: 'RO' },
  { name: 'Greece', dialCode: '+30', code: 'GR' },
  { name: 'Turkey', dialCode: '+90', code: 'TR' },
  { name: 'Ukraine', dialCode: '+380', code: 'UA' },
  { name: 'Belarus', dialCode: '+375', code: 'BY' },
  { name: 'Lithuania', dialCode: '+370', code: 'LT' },
  { name: 'Latvia', dialCode: '+371', code: 'LV' },
  { name: 'Estonia', dialCode: '+372', code: 'EE' },
  { name: 'Iceland', dialCode: '+354', code: 'IS' },
  { name: 'Ireland', dialCode: '+353', code: 'IE' },
  { name: 'Luxembourg', dialCode: '+352', code: 'LU' },
  { name: 'Malta', dialCode: '+356', code: 'MT' },
  { name: 'Cyprus', dialCode: '+357', code: 'CY' },
  { name: 'Portugal', dialCode: '+351', code: 'PT' },
  { name: 'Israel', dialCode: '+972', code: 'IL' },
  { name: 'Saudi Arabia', dialCode: '+966', code: 'SA' },
  { name: 'United Arab Emirates', dialCode: '+971', code: 'AE' },
  { name: 'Qatar', dialCode: '+974', code: 'QA' },
  { name: 'Kuwait', dialCode: '+965', code: 'KW' },
  { name: 'Oman', dialCode: '+968', code: 'OM' },
  { name: 'Bahrain', dialCode: '+973', code: 'BH' },
  { name: 'Jordan', dialCode: '+962', code: 'JO' },
  { name: 'Lebanon', dialCode: '+961', code: 'LB' },
  { name: 'Morocco', dialCode: '+212', code: 'MA' },
  { name: 'Algeria', dialCode: '+213', code: 'DZ' },
  { name: 'Tunisia', dialCode: '+216', code: 'TN' },
  { name: 'Libya', dialCode: '+218', code: 'LY' },
  { name: 'Sudan', dialCode: '+249', code: 'SD' },
  { name: 'Egypt', dialCode: '+20', code: 'EG' },
  { name: 'Nigeria', dialCode: '+234', code: 'NG' },
  { name: 'Ghana', dialCode: '+233', code: 'GH' },
  { name: 'Kenya', dialCode: '+254', code: 'KE' },
  { name: 'Ethiopia', dialCode: '+251', code: 'ET' },
  { name: 'Tanzania', dialCode: '+255', code: 'TZ' },
  { name: 'Uganda', dialCode: '+256', code: 'UG' },
  { name: 'Zambia', dialCode: '+260', code: 'ZM' },
  { name: 'Zimbabwe', dialCode: '+263', code: 'ZW' },
  { name: 'Mozambique', dialCode: '+258', code: 'MZ' },
  { name: 'Angola', dialCode: '+244', code: 'AO' },
  { name: 'Botswana', dialCode: '+267', code: 'BW' },
  { name: 'Namibia', dialCode: '+264', code: 'NA' },
  { name: 'Senegal', dialCode: '+221', code: 'SN' },
  { name: 'Mali', dialCode: '+223', code: 'ML' },
  { name: 'Niger', dialCode: '+227', code: 'NE' },
  { name: 'Burkina Faso', dialCode: '+226', code: 'BF' },
  { name: 'Democratic Republic of the Congo', dialCode: '+243', code: 'CD' },
  { name: 'Republic of the Congo', dialCode: '+242', code: 'CG' },
  { name: 'Madagascar', dialCode: '+261', code: 'MG' },
  { name: 'India', dialCode: '+91', code: 'IN' },
  { name: 'China', dialCode: '+86', code: 'CN' },
  { name: 'Japan', dialCode: '+81', code: 'JP' },
  { name: 'South Korea', dialCode: '+82', code: 'KR' },
  { name: 'Thailand', dialCode: '+66', code: 'TH' },
  { name: 'Vietnam', dialCode: '+84', code: 'VN' },
  { name: 'Philippines', dialCode: '+63', code: 'PH' },
  { name: 'Bangladesh', dialCode: '+880', code: 'BD' },
  { name: 'Sri Lanka', dialCode: '+94', code: 'LK' },
  { name: 'Nepal', dialCode: '+977', code: 'NP' },
  { name: 'Afghanistan', dialCode: '+93', code: 'AF' },
  { name: 'Kazakhstan', dialCode: '+7', code: 'KZ' },
  { name: 'Uzbekistan', dialCode: '+998', code: 'UZ' },
  { name: 'Turkmenistan', dialCode: '+993', code: 'TM' },
  { name: 'Kyrgyzstan', dialCode: '+996', code: 'KG' },
  { name: 'Tajikistan', dialCode: '+992', code: 'TJ' },
  { name: 'Armenia', dialCode: '+374', code: 'AM' },
  { name: 'Georgia', dialCode: '+995', code: 'GE' },
  { name: 'Azerbaijan', dialCode: '+994', code: 'AZ' },
  { name: 'Mongolia', dialCode: '+976', code: 'MN' },
  { name: 'North Korea', dialCode: '+850', code: 'KP' },
  { name: 'Laos', dialCode: '+856', code: 'LA' },
  { name: 'Cambodia', dialCode: '+855', code: 'KH' },
  { name: 'Myanmar', dialCode: '+95', code: 'MM' },
  { name: 'Brunei', dialCode: '+673', code: 'BN' },
  { name: 'East Timor', dialCode: '+670', code: 'TL' },
  { name: 'Maldives', dialCode: '+960', code: 'MV' },
  { name: 'Bhutan', dialCode: '+975', code: 'BT' },
  { name: 'Moldova', dialCode: '+373', code: 'MD' },
  { name: 'Bosnia and Herzegovina', dialCode: '+387', code: 'BA' },
  { name: 'Albania', dialCode: '+355', code: 'AL' },
  { name: 'North Macedonia', dialCode: '+389', code: 'MK' },
  { name: 'Montenegro', dialCode: '+382', code: 'ME' },
  { name: 'Kosovo', dialCode: '+383', code: 'XK' },
  { name: 'Palestine', dialCode: '+970', code: 'PS' },
  { name: 'Syria', dialCode: '+963', code: 'SY' },
  { name: 'Iraq', dialCode: '+964', code: 'IQ' },
  { name: 'Yemen', dialCode: '+967', code: 'YE' },
  { name: 'Iran', dialCode: '+98', code: 'IR' },
  { name: 'El Salvador', dialCode: '+503', code: 'SV' },
  { name: 'Nicaragua', dialCode: '+505', code: 'NI' },
  { name: 'Costa Rica', dialCode: '+506', code: 'CR' },
  { name: 'Panama', dialCode: '+507', code: 'PA' },
  { name: 'Cuba', dialCode: '+53', code: 'CU' },
  { name: 'Dominican Republic', dialCode: '+1', code: 'DO' },
  { name: 'Haiti', dialCode: '+509', code: 'HT' },
  { name: 'Jamaica', dialCode: '+1', code: 'JM' },
  { name: 'Trinidad and Tobago', dialCode: '+1', code: 'TT' },
  { name: 'Barbados', dialCode: '+1', code: 'BB' },
  { name: 'Bahamas', dialCode: '+1', code: 'BS' },
  { name: 'Saint Lucia', dialCode: '+1', code: 'LC' },
  { name: 'Grenada', dialCode: '+1', code: 'GD' },
  { name: 'Saint Vincent and the Grenadines', dialCode: '+1', code: 'VC' },
  { name: 'Antigua and Barbuda', dialCode: '+1', code: 'AG' },
  { name: 'Dominica', dialCode: '+1', code: 'DM' },
  { name: 'Saint Kitts and Nevis', dialCode: '+1', code: 'KN' },
  { name: 'Belize', dialCode: '+501', code: 'BZ' },
  { name: 'Suriname', dialCode: '+597', code: 'SR' },
  { name: 'Guyana', dialCode: '+592', code: 'GY' },
  { name: 'Venezuela', dialCode: '+58', code: 'VE' },
  { name: 'Bolivia', dialCode: '+591', code: 'BO' },
  { name: 'Ecuador', dialCode: '+593', code: 'EC' },
  { name: 'Andorra', dialCode: '+376', code: 'AD' },
  { name: 'Liechtenstein', dialCode: '+423', code: 'LI' },
  { name: 'San Marino', dialCode: '+378', code: 'SM' },
  { name: 'Monaco', dialCode: '+377', code: 'MC' },
  { name: 'Vatican City', dialCode: '+39', code: 'VA' },
  { name: 'Seychelles', dialCode: '+248', code: 'SC' },
  { name: 'Mauritius', dialCode: '+230', code: 'MU' },
  { name: 'Comoros', dialCode: '+269', code: 'KM' },
  { name: 'Sao Tome and Principe', dialCode: '+239', code: 'ST' },
  { name: 'Cape Verde', dialCode: '+238', code: 'CV' },
  { name: 'Malawi', dialCode: '+265', code: 'MW' },
  { name: 'Lesotho', dialCode: '+266', code: 'LS' },
  { name: 'Eswatini', dialCode: '+268', code: 'SZ' },
  { name: 'Gabon', dialCode: '+241', code: 'GA' },
  { name: 'Equatorial Guinea', dialCode: '+240', code: 'GQ' },
  { name: 'Central African Republic', dialCode: '+236', code: 'CF' },
  { name: 'Chad', dialCode: '+235', code: 'TD' },
  { name: 'South Sudan', dialCode: '+211', code: 'SS' },
  { name: 'Guinea', dialCode: '+224', code: 'GN' },
  { name: 'Guinea-Bissau', dialCode: '+245', code: 'GW' },
  { name: 'Sierra Leone', dialCode: '+232', code: 'SL' },
  { name: 'Liberia', dialCode: '+231', code: 'LR' },
  { name: 'Gambia', dialCode: '+220', code: 'GM' },
  { name: 'Togo', dialCode: '+228', code: 'TG' },
  { name: 'Benin', dialCode: '+229', code: 'BJ' },
  { name: 'Djibouti', dialCode: '+253', code: 'DJ' },
  { name: 'Eritrea', dialCode: '+291', code: 'ER' },
  { name: 'Somalia', dialCode: '+252', code: 'SO' },
  { name: 'Burundi', dialCode: '+257', code: 'BI' },
  { name: 'Rwanda', dialCode: '+250', code: 'RW' },
  { name: 'Papua New Guinea', dialCode: '+675', code: 'PG' },
  { name: 'Fiji', dialCode: '+679', code: 'FJ' },
  { name: 'Samoa', dialCode: '+685', code: 'WS' },
  { name: 'Tonga', dialCode: '+676', code: 'TO' },
  { name: 'Vanuatu', dialCode: '+678', code: 'VU' },
  { name: 'Solomon Islands', dialCode: '+677', code: 'SB' },
  { name: 'Kiribati', dialCode: '+686', code: 'KI' },
  { name: 'Marshall Islands', dialCode: '+692', code: 'MH' },
  { name: 'Palau', dialCode: '+680', code: 'PW' },
  { name: 'Micronesia', dialCode: '+691', code: 'FM' },
  { name: 'Nauru', dialCode: '+674', code: 'NR' },
  { name: 'Tuvalu', dialCode: '+688', code: 'TV' },
  { name: 'Niue', dialCode: '+683', code: 'NU' },
  { name: 'Cook Islands', dialCode: '+682', code: 'CK' },
  { name: 'Tokelau', dialCode: '+690', code: 'TK' },
  { name: 'Western Sahara', dialCode: '+212', code: 'EH' },
  { name: 'South Georgia and the South Sandwich Islands', dialCode: '+500', code: 'GS' },
  { name: 'Saint Pierre and Miquelon', dialCode: '+508', code: 'PM' },
  { name: 'Bermuda', dialCode: '+1', code: 'BM' },
  { name: 'Greenland', dialCode: '+299', code: 'GL' },
  { name: 'Guernsey', dialCode: '+44', code: 'GG' },
  { name: 'Jersey', dialCode: '+44', code: 'JE' },
  { name: 'Isle of Man', dialCode: '+44', code: 'IM' },
  { name: 'Faroe Islands', dialCode: '+298', code: 'FO' },
  { name: 'Falkland Islands (Malvinas)', dialCode: '+500', code: 'FK' },
  { name: 'Gibraltar', dialCode: '+350', code: 'GI' },
  { name: 'Montserrat', dialCode: '+1', code: 'MS' },
  { name: 'Anguilla', dialCode: '+1', code: 'AI' },
  { name: 'British Virgin Islands', dialCode: '+1', code: 'VG' },
  { name: 'Cayman Islands', dialCode: '+1', code: 'KY' },
  { name: 'Turks and Caicos Islands', dialCode: '+1', code: 'TC' },
  { name: 'Saint Helena, Ascension and Tristan da Cunha', dialCode: '+290', code: 'SH' },
  { name: 'Pitcairn', dialCode: '+64', code: 'PN' },
  { name: 'French Guiana', dialCode: '+594', code: 'GF' },
  { name: 'Guadeloupe', dialCode: '+590', code: 'GP' },
  { name: 'Martinique', dialCode: '+596', code: 'MQ' },
  { name: 'Réunion', dialCode: '+262', code: 'RE' },
  { name: 'Mayotte', dialCode: '+262', code: 'YT' },
  { name: 'New Caledonia', dialCode: '+687', code: 'NC' },
  { name: 'French Polynesia', dialCode: '+689', code: 'PF' },
  { name: 'Wallis and Futuna', dialCode: '+681', code: 'WF' },
  { name: 'Saint Barthélemy', dialCode: '+590', code: 'BL' },
  { name: 'Saint Martin (French part)', dialCode: '+590', code: 'MF' },
  { name: 'Sint Maarten (Dutch part)', dialCode: '+1', code: 'SX' },
  { name: 'Aruba', dialCode: '+297', code: 'AW' },
  { name: 'Curaçao', dialCode: '+599', code: 'CW' },
  { name: 'Bonaire, Sint Eustatius and Saba', dialCode: '+599', code: 'BQ' },
  { name: 'Åland Islands', dialCode: '+358', code: 'AX' }
];

const SenderPhoneScreen = () => {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Filter countries based on search query
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.dialCode.includes(searchQuery) ||
    country.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContinue = async () => {
    if (!phone.trim()) {
      setError('Please enter your phone number.');
      setShowErrorModal(true);
      return;
    }

    if (!selectedCountry) {
      setError('Please select a country.');
      setShowErrorModal(true);
      return;
    }

    try {
      await apiFetch('/user/profile', {
        method: 'PUT',
        body: JSON.stringify({
          phone: `${selectedCountry.dialCode}${phone}`,
        }),
      });
      
      // Check where to navigate next based on profile completion
      try {
        console.log('Phone saved successfully, checking next screen...');
        const nextScreen = await getNextScreenForTransfer();
        console.log('Next screen after phone:', nextScreen);
        
        // Ensure we navigate forward, not backward
        if (nextScreen === '/screens/senderdetails' || nextScreen === '/screens/SenderAddressScreen' || nextScreen === '/screens/SenderPhoneScreen') {
          console.log('Forcing navigation to payment method screen instead of backward');
          router.push('/screens/PaymentMethodScreen');
        } else {
          console.log('Navigating to determined next screen:', nextScreen);
          router.push(nextScreen as any);
        }
      } catch (error) {
        console.error('Error checking next screen:', error);
        // Fallback to default flow
        console.log('Falling back to payment method screen');
        router.push('/screens/PaymentMethodScreen');
      }
    } catch (error) {
      console.error('Error saving phone:', error);
      setError('Failed to save phone number. Please try again.');
      setShowErrorModal(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Phone Number</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>What's your phone number?</Text>
          <Text style={styles.subtitle}>
            We'll use this to send you important updates about your transfer
          </Text>

          {/* Country Selection */}
          <TouchableOpacity style={styles.countrySelector} onPress={() => setShowCountryModal(true)}>
            <CountryFlag countryCode={selectedCountry.code} size={24} />
            <Text style={styles.countryName}>{selectedCountry.name}</Text>
            <Text style={styles.dialCode}>{selectedCountry.dialCode}</Text>
            <Feather name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>

          {/* Phone Input */}
          <View style={styles.phoneInputContainer}>
            <Text style={styles.phoneLabel}>Phone Number</Text>
            <View style={styles.phoneInputRow}>
              <Text style={styles.dialCodeDisplay}>{selectedCountry.dialCode}</Text>
              <TextInput
                style={styles.phoneInput}
                placeholder="Enter your phone number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoFocus
              />
            </View>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={[styles.continueButton, { backgroundColor: phone.trim() ? '#234881' : '#ccc' }]}
            disabled={!phone.trim()}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
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
                keyExtractor={item => item.code}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.countryItem}
                    onPress={() => {
                      setSelectedCountry(item);
                      setShowCountryModal(false);
                      setSearchQuery('');
                    }}
                  >
                    <CountryFlag countryCode={item.code} size={20} />
                    <View style={styles.countryItemInfo}>
                      <Text style={styles.countryItemName}>{item.name}</Text>
                      <Text style={styles.countryItemDialCode}>{item.dialCode}</Text>
                    </View>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
                style={styles.countryList}
              />
            </View>
          </View>
        </Modal>

        {/* Error Modal */}
        <Modal
          visible={showErrorModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowErrorModal(false)}
        >
          <View style={styles.errorModalOverlay}>
            <View style={styles.errorModalContent}>
              <Text style={styles.errorModalTitle}>Error</Text>
              <Text style={styles.errorModalMessage}>{error}</Text>
              <TouchableOpacity
                style={styles.errorModalButton}
                onPress={() => setShowErrorModal(false)}
              >
                <Text style={styles.errorModalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
      <BottomNavBar />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#fff',
  },
  headerIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    marginLeft: 10,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignSelf: 'center',
  },
  progressBarContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  progressBarBg: {
    width: '100%',
    height: 4,
    backgroundColor: '#e5e5e5',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    width: '48%',
    height: 4,
    backgroundColor: '#234881',
    borderRadius: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
    textAlign: 'left',
    marginTop: 0,
  },
  subtitle: {
    fontSize: 14,
    color: '#222',
    fontWeight: '400',
    marginBottom: 18,
    marginTop: 0,
    textAlign: 'left',
    lineHeight: 18,
  },label: {
    fontSize: 14,
    color: '#222',
    fontWeight: '400',
    marginBottom: 8,
    marginTop: 18,
    textAlign: 'left',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bdbdbd',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    height: 48,
  },countryDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: '#e5e5e5',
    minWidth: 90,
  },
  countryText: {
    fontSize: 15,
    color: '#222',
    fontWeight: '400',
  },phoneInput: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#222',
    backgroundColor: '#fff',
    fontWeight: '400',
    height: 48,
  },
  infoBoxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
    marginBottom: 0,
    paddingRight: 10,
  },infoBoxText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    fontWeight: '400',
    flex: 1,
  },
  continueBtn: {
    backgroundColor: '#234881',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 16,
  },continueBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 0,
    paddingHorizontal: 0,
    marginBottom: 8,
  },infoText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    fontWeight: '400',
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
  },navItem: {
    alignItems: 'center',
  },
  navLabel: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },activeNavLabel: {
    color: '#234881',
    fontWeight: '700',
  },
  sendButtonWrapper: {
    alignItems: 'center',
    marginTop: 10,
  },sendButton: {
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    color: '#234881',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#234881',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 25,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  // New styles for the new SenderPhoneScreen
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  countryName: {
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
    marginLeft: 10,
  },
  dialCode: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
  },
  phoneInputContainer: {
    marginBottom: 20,
  },
  phoneLabel: {
    fontSize: 14,
    color: '#222',
    fontWeight: '400',
    marginBottom: 8,
    marginTop: 18,
    textAlign: 'left',
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dialCodeDisplay: {
    fontSize: 15,
    color: '#222',
    fontWeight: '500',
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 15,
    color: '#222',
    fontWeight: '400',
    paddingVertical: 12,
  },continueButton: {
    backgroundColor: '#234881',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },// Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxHeight: '70%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  searchContainer: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#222',
  },
  countryList: {
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  countryItemInfo: {
    marginLeft: 10,
  },
  countryItemName: {
    fontSize: 16,
    color: '#222',
    fontWeight: '400',
  },
  countryItemDialCode: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
  },
  errorModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  errorModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: '80%',
  },
  errorModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#d32f2f',
    marginBottom: 10,
  },
  errorModalMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorModalButton: {
    backgroundColor: '#234881',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 25,
  },
  errorModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default SenderPhoneScreen; 