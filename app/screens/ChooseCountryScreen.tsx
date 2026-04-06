import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ListRenderItem,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Anchor,
  ChevronDown,
  HelpCircle,
  Search
} from 'react-native-feather';
import { countryFlags } from '../../assets/images/countryFlags';
import { apiFetch } from '../utils/api';

const { width } = Dimensions.get('window');

interface Country {
  name: string;
  code: string;
  flag: string;
  currency: string;
  dialCode: string;
}

const ChooseCountryScreen = () => {
  const router = useRouter();
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromCountry, setFromCountry] = useState<Country | null>(null);
  const [toCountry, setToCountry] = useState<Country | null>(null);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);

  // Fetch countries from Dlocal API
  const fetchCountries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🌍 Fetching countries from Dlocal API...');
      const response = await apiFetch('/api/v1/dlocal/countries', { method: 'GET' });
      
      if (response.success && response.data?.countries) {
        const fetchedCountries = response.data.countries;
        console.log(`✅ Successfully fetched ${fetchedCountries.length} countries from Dlocal`);
        setCountries(fetchedCountries);
        setFilteredCountries(fetchedCountries);
        
        // Set default from country to United States if available
        const defaultFromCountry = fetchedCountries.find(c => c.code === 'US');
        if (defaultFromCountry) {
          setFromCountry(defaultFromCountry);
          console.log('🇺🇸 Set default from country:', defaultFromCountry.name);
        }
      } else {
        throw new Error('Invalid response format from Dlocal API');
      }
    } catch (err: any) {
      console.error('❌ Failed to fetch countries from Dlocal:', err);
      setError(err.message || 'Failed to fetch countries from Dlocal');
      
      // Fallback to a basic country list if API fails
      const fallbackCountries: Country[] = [
        { name: 'United States', code: 'US', flag: '🇺🇸', currency: 'USD', dialCode: '+1' },
        { name: 'Pakistan', code: 'PK', flag: '🇵🇰', currency: 'PKR', dialCode: '+92' },
        { name: 'Turkey', code: 'TR', flag: '🇹🇷', currency: 'TRY', dialCode: '+90' },
        { name: 'New Zealand', code: 'NZ', flag: '🇳🇿', currency: 'NZD', dialCode: '+64' },
        { name: 'Nigeria', code: 'NG', flag: '🇳🇬', currency: 'NGN', dialCode: '+234' },
        { name: 'Kenya', code: 'KE', flag: '🇰🇪', currency: 'KES', dialCode: '+254' },
        { name: 'Ghana', code: 'GH', flag: '🇬🇭', currency: 'GHS', dialCode: '+233' },
        { name: 'India', code: 'IN', flag: '🇮🇳', currency: 'INR', dialCode: '+91' },
        { name: 'Brazil', code: 'BR', flag: '🇧🇷', currency: 'BRL', dialCode: '+55' },
        { name: 'United Kingdom', code: 'GB', flag: '🇬🇧', currency: 'GBP', dialCode: '+44' },
        { name: 'Germany', code: 'DE', flag: '🇩🇪', currency: 'EUR', dialCode: '+49' },
        { name: 'France', code: 'FR', flag: '🇫🇷', currency: 'EUR', dialCode: '+33' },
        { name: 'Canada', code: 'CA', flag: '🇨🇦', currency: 'CAD', dialCode: '+1' },
        { name: 'Australia', code: 'AU', flag: '🇦🇺', currency: 'AUD', dialCode: '+61' }
      ];
      console.log('🔄 Using fallback country list with', fallbackCountries.length, 'countries');
      setCountries(fallbackCountries);
      setFilteredCountries(fallbackCountries);
      setFromCountry(fallbackCountries[0]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  // Filter countries based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCountries(countries);
    } else {
      const filtered = countries.filter(country =>
        country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        country.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        country.currency.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCountries(filtered);
    }
  }, [searchQuery, countries]);

  // Get popular countries for quick selection
  const popularCountries = countries.filter(c => 
    ['TR', 'NZ', 'NG', 'PK', 'KE', 'GH', 'IN', 'BR'].includes(c.code)
  ).slice(0, 8);

  // Get flag image source for a country
  const getFlagSource = (countryCode: string) => {
    const flagUrl = countryFlags[countryCode];
    if (flagUrl) {
      return { uri: flagUrl };
    }
    // Fallback to emoji flag if no image available
    return null;
  };

  // Render flag with fallback to emoji
  const renderFlag = (country: Country, size: number = 40) => {
    const flagSource = getFlagSource(country.code);
    
    if (flagSource) {
      return (
        <Image 
          source={flagSource} 
          style={[styles.flagContainer, { width: size, height: size * 0.7 }]} 
          resizeMode="contain"
        />
      );
    }
    
    // Fallback to emoji flag
    return (
      <Text style={[styles.emojiFlag, { fontSize: size * 0.6 }]}>
        {country.flag}
      </Text>
    );
  };

  // Dropdown modal for country selection
  const renderCountryItem: ListRenderItem<Country> = ({ item }) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => {
        if (showFromDropdown) {
          setFromCountry(item);
          setShowFromDropdown(false);
          console.log('📍 Selected from country:', item.name);
        } else {
          setToCountry(item);
          setShowToDropdown(false);
          console.log('📍 Selected to country:', item.name);
        }
        setSearchQuery(''); // Clear search when selection is made
      }}
    >
      {renderFlag(item, 28)}
      <View style={styles.countryItemInfo}>
        <Text style={styles.dropdownCountryName}>{item.name}</Text>
        <Text style={styles.countryItemDetails}>{item.currency} • {item.dialCode}</Text>
      </View>
    </TouchableOpacity>
  );

  // Render search bar for country selection
  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <Search stroke="#9ca3af" width={20} height={20} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search countries..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        autoFocus
        placeholderTextColor="#9ca3af"
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchButton}>
          <Ionicons name="close-circle" size={20} color="#9ca3af" />
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#234881" />
          <Text style={styles.loadingText}>Loading countries from Dlocal...</Text>
          <Text style={styles.loadingSubtext}>Fetching the latest country data</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && countries.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="cloud-offline" size={64} color="#ef4444" />
          <Text style={styles.errorText}>Failed to load countries</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchCountries}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => {
            if (router.canGoBack && router.canGoBack()) {
              router.back();
            } else {
              router.replace('/screens/WalletScreen');
            }
          }} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#234881" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <HelpCircle stroke="#9ca3af" width={24} height={24} />
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title}>
            Where do you want to send money?
          </Text>

          {/* From Section */}
          <View style={styles.section}>
            <Text style={styles.label}>From</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowFromDropdown(true)}
            >
              <View style={styles.dropdownContent}>
                {fromCountry && renderFlag(fromCountry, 28)}
                <Text style={styles.dropdownText}>{fromCountry?.name || 'Select country'}</Text>
              </View>
              <ChevronDown stroke="#9ca3af" width={20} height={20} />
            </TouchableOpacity>
          </View>

          {/* From Country Dropdown Modal */}
          <Modal
            visible={showFromDropdown}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowFromDropdown(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Source Country</Text>
                {renderSearchBar()}
                <FlatList
                  data={filteredCountries}
                  keyExtractor={item => item.code}
                  renderItem={renderCountryItem}
                  contentContainerStyle={{ paddingBottom: 20 }}
                  showsVerticalScrollIndicator={false}
                  ListEmptyComponent={
                    <View style={styles.emptySearchContainer}>
                      <Text style={styles.emptySearchText}>No countries found</Text>
                      <Text style={styles.emptySearchSubtext}>Try a different search term</Text>
                    </View>
                  }
                />
                <TouchableOpacity onPress={() => setShowFromDropdown(false)} style={styles.closeModalBtn}>
                  <Text style={{ color: '#234881', fontWeight: 'bold', fontSize: 16 }}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* To Section */}
          <View style={styles.section}>
            <Text style={styles.label}>To</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowToDropdown(true)}
            >
              <View style={styles.dropdownContent}>
                {toCountry ? (
                  <>
                    {renderFlag(toCountry, 28)}
                    <Text style={styles.dropdownText}>{toCountry.name}</Text>
                  </>
                ) : (
                  <Text style={[styles.dropdownText, styles.placeholder]}>Choose your country</Text>
                )}
              </View>
              <ChevronDown stroke="#9ca3af" width={20} height={20} />
            </TouchableOpacity>
          </View>

          {/* Country Dropdown Modal */}
          <Modal
            visible={showToDropdown}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowToDropdown(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Destination Country</Text>
                {renderSearchBar()}
                <FlatList
                  data={filteredCountries}
                  keyExtractor={item => item.code}
                  renderItem={renderCountryItem}
                  contentContainerStyle={{ paddingBottom: 20 }}
                  showsVerticalScrollIndicator={false}
                  ListEmptyComponent={
                    <View style={styles.emptySearchContainer}>
                      <Text style={styles.emptySearchText}>No countries found</Text>
                      <Text style={styles.emptySearchSubtext}>Try a different search term</Text>
                    </View>
                  }
                />
                <TouchableOpacity onPress={() => setShowToDropdown(false)} style={styles.closeModalBtn}>
                  <Text style={{ color: '#234881', fontWeight: 'bold', fontSize: 16 }}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* OR Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Popular Countries Section */}
          <View style={styles.popularSection}>
            <Text style={styles.popularTitle}>
              Choose popular country to send money?
            </Text>
            <View style={styles.countriesGrid}>
              {popularCountries.map((country) => (
                <TouchableOpacity
                  key={country.code}
                  style={styles.countryButton}
                  onPress={() => {
                    setToCountry(country);
                    console.log('📍 Quick selected country:', country.name);
                  }}
                >
                  {renderFlag(country, 40)}
                  <Text style={styles.countryName}>{country.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Next Button */}
          <TouchableOpacity
            style={[
              styles.nextButton,
              (!fromCountry || !toCountry) && styles.nextButtonDisabled
            ]}
            disabled={!fromCountry || !toCountry}
            onPress={() => {
              if (fromCountry && toCountry) {
                console.log('🚀 Navigating to ChooseBankScreen with:', {
                  from: fromCountry.name,
                  to: toCountry.name
                });
                router.push({
                  pathname: '/screens/ChooseBankScreen',
                  params: {
                    fromCountry: JSON.stringify(fromCountry),
                    toCountry: JSON.stringify(toCountry),
                  }
                });
              }
            }}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>

          {/* Bottom Section */}
          <View style={styles.bottomSection}>
            <View style={styles.seafarerSection}>
              <Anchor stroke="#9ca3af" width={16} height={16} />
              <Text style={styles.seafarerText}>Signup as a Seafarer</Text>
            </View>
            <View style={styles.signInSection}>
              <Text style={styles.signInText}>
                Already have a profile? <Text style={styles.signInLink}>Sign In</Text>
              </Text>
              <TouchableOpacity onPress={() => router.push('/screens/signin')}>
                <Text style={styles.signInText}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
      
      {/* Home Indicator */}
      <View style={styles.homeIndicator} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerButton: {
    padding: 8,
  },
  content: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 40,
    lineHeight: 34,
  },
  section: {
    marginBottom: 28,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minHeight: 56,
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#111827',
    marginLeft: 12,
  },
  placeholder: {
    color: '#6b7280',
    fontWeight: '400',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    paddingHorizontal: 20,
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  popularSection: {
    marginBottom: 40,
  },
  popularTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 28,
    lineHeight: 26,
  },
  countriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  countryButton: {
    width: (width - 56) / 4,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 0,
    marginBottom: 16,
    minHeight: 80,
    justifyContent: 'center',
  },
  flagContainer: {
    marginBottom: 8,
  },
  emojiFlag: {
    marginBottom: 8,
    textAlign: 'center',
  },
  countryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  nextButton: {
    backgroundColor: '#234881',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
    minHeight: 56,
    justifyContent: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
  bottomSection: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  seafarerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  seafarerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2563eb',
    marginLeft: 8,
  },
  signInSection: {
    alignItems: 'center',
  },
  signInText: {
    fontSize: 16,
    color: '#6b7280',
  },
  signInLink: {
    color: '#2563eb',
    fontWeight: '600',
  },
  homeIndicator: {
    position: 'absolute',
    bottom: 8,
    left: '50%',
    transform: [{ translateX: -64 }],
    width: 128,
    height: 4,
    backgroundColor: '#000000',
    borderRadius: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#9ca3af',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#234881',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxHeight: '70%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
      },
  default: {
        elevation: 5,
      }
    }),
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#111827',
  },
  clearSearchButton: {
    padding: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  countryItemInfo: {
    flex: 1,
    marginLeft: 14,
  },
  dropdownCountryName: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  countryItemDetails: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  emptySearchContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptySearchText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  emptySearchSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  closeModalBtn: {
    alignSelf: 'center',
    marginTop: 10,
    padding: 8,
  },
  backButton: {
    padding: 8,
  }
});

export default ChooseCountryScreen;