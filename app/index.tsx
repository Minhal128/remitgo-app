import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';

export default function LanguageScreen() {
  const [selected, setSelected] = useState('English');
  const [dropdown, setDropdown] = useState(false);
  const [imageError, setImageError] = useState(false);
  const languages = ['English', 'Urdu', 'French', 'Spanish'];

  return (
    <SafeAreaView style={styles.container}>
      {/* Logo with fallback */}
      {!imageError ? (
        <Image
          source={require('../assets/images/logo.jpg')}
          style={styles.logo}
          resizeMode="contain"
          onError={() => setImageError(true)}
        />
      ) : (
        <View style={[styles.logo, { backgroundColor: '#234881', justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>RG</Text>
        </View>
      )}

      {/* Title */}
      <Text style={styles.title}>Choose Language for RemitGo</Text>

      {/* Dropdown */}
      <View style={styles.dropdownWrapper}>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setDropdown(!dropdown)}
          activeOpacity={0.8}
        >
          <Text style={styles.dropdownText}>{selected}</Text>
          <Text style={styles.dropdownIcon}>▼</Text>
        </TouchableOpacity>

        {dropdown && (
          <View style={styles.dropdownList}>
            {languages.map((lang, index) => (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.dropdownItem,
                  index === languages.length - 1 && styles.dropdownItemLast
                ]}
                onPress={() => {
                  setSelected(lang);
                  setDropdown(false);
                }}
              >
                <Text style={styles.dropdownText}>{lang}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Continue Button */}
      <TouchableOpacity
        style={styles.continueButton}
        onPress={() => router.push('/screens/OnboardingScreen')}
        activeOpacity={0.7}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>

      <View style={styles.bottomLine} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 32,
    borderRadius: 16,
    backgroundColor: '#F6F6F6',
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000',
    marginBottom: 24,
    textAlign: 'center',
  },
  dropdownWrapper: {
    width: '100%',
    marginBottom: 32,
    position: 'relative',
    zIndex: 1000,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E1E5E9',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    width: '85%',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
      },
      default: {
        elevation: 3,
      },
    }),
  },
  dropdownText: {
    fontSize: 16,
    color: '#000',
  },
  dropdownIcon: {
    fontSize: 16,
    color: '#000',
  },
  dropdownList: {
    position: 'absolute',
    top: 70,
    left: '7.5%',
    right: '7.5%',
    borderWidth: 1.5,
    borderColor: '#E1E5E9',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    zIndex: 1001,
    elevation: 1001,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
    backgroundColor: '#FFFFFF',
  },
  dropdownItemLast: {
    borderBottomWidth: 0,
  },
  continueButton: {
    width: '85%',
    backgroundColor: '#234881',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
      },
      default: {
        elevation: 6,
      },
    }),
    marginBottom: 16,
    alignSelf: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  bottomLine: {
    width: 100,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 32,
    marginBottom: Platform.OS === 'ios' ? 12 : 24,
  },
});