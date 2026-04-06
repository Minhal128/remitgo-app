import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BottomNavBar from '../../components/BottomNavBar';
import { API_BASE_URL } from '../constants/api';

const ProfileScreen = () => {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [editField, setEditField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Helper function to get user-friendly field labels
  const getFieldLabel = (key: string) => {
    const labels: { [key: string]: string } = {
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phone: 'Phone Number',
      street: 'Street Address',
      apartment: 'Apartment',
      city: 'City',
      state: 'State',
      zip: 'ZIP Code',
      dob: 'Date of Birth',
      language: 'Language'
    };
    return labels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        console.log('Profile data received:', data); // Debug log
        
        if (data.user) {
          setProfile(data.user);
        } else {
          console.error('No user data in response:', data);
          Alert.alert('Error', 'Invalid profile data received');
        }
      } catch (err) {
        Alert.alert('Error', 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleEdit = (field: string, value: string) => {
    setEditField(field);
    setEditValue(value);
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const updated = { ...profile, [editField!]: editValue };
      const res = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`},body: JSON.stringify({ [editField!]: editValue }),
      });
      if (!res.ok) throw new Error('Failed to update');
      setProfile(updated);
      setEditField(null);
    } catch (err) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#234881" />
      </View>
    );
  }

  if (!profile || typeof profile !== 'object' || Array.isArray(profile)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#666', fontSize: 16 }}>
          {!profile ? 'No profile data available' : 'Invalid profile data format'}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => {
              if (router.canGoBack && router.canGoBack()) {
                router.back();
              } else {
                router.push('/screens/ManageScreen');
              }
            }}>
              <Feather name="arrow-left" size={24} color="#222" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profile information</Text>
            <View style={{ width: 24 }} />
          </View>
          {/* Profile Fields */}
          <View style={styles.fieldsContainer}>
            {profile && typeof profile === 'object' && Object.entries(profile)
              .filter(([key, value]) => {
                // Filter out internal MongoDB fields and non-primitive values
                const excludeFields = ['_id', '__v', 'id', 'createdAt', 'updatedAt', 'role', 'kycStatus'];
                return !excludeFields.includes(key) && 
                       (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean');
              })
              .map(([key, value]) => (
                <View key={key} style={styles.fieldRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>
                    {getFieldLabel(key)}
                  </Text>
                  {editField === key ? (
                    <TextInput
                      style={styles.input}
                      value={editValue}
                      onChangeText={setEditValue}
                      autoFocus
                    />
                  ) : (
                    <Text style={styles.fieldValue}>
                      {value !== null && value !== undefined ? String(value) : 'Not set'}
                    </Text>
                  )}
                </View>
                {editField === key ? (
                  <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                      <Text style={styles.saveText}>{saving ? 'Saving...' : 'Save'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditField(null)}>
                      <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  !['language'].includes(key) && (
                    <TouchableOpacity style={styles.editBtn} onPress={() => handleEdit(key, String(value))}>
                      <Feather name="edit" size={18} color="#234881" />
                      <Text style={styles.editText}>Edit</Text>
                    </TouchableOpacity>
                  )
                )}
                <View style={styles.divider} />
              </View>
            ))}
          </View>
          {/* RemitGo section */}
          <Text style={styles.sectionTitle}>RemitGo</Text>
          <TouchableOpacity 
            style={styles.closeProfileRow}
            onPress={() => {
              if (router.canGoBack && router.canGoBack()) {
                router.back();
              } else {
                router.push('/screens/ManageScreen');
              }
            }}
          >
            <Text style={styles.closeProfileText}>Close my profile</Text>
          </TouchableOpacity>
        </ScrollView>
        <BottomNavBar activeTab="manage" />
      </SafeAreaView>
    </View>
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
    paddingTop: 20,
  },
  fieldsContainer: {
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 35,
    paddingBottom: 18,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
    textAlign: 'center',
    flex: 1,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 0,
    paddingVertical: 14,
    position: 'relative',
  },
  fieldLabel: {
    fontSize: 13,
    color: '#222',
    fontWeight: '700',
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 15,
    color: '#222',
    fontWeight: '400',
    marginBottom: 2,
    lineHeight: 20,
  },
  input: {
    fontSize: 15,
    color: '#222',
    fontWeight: '400',
    marginBottom: 2,
    lineHeight: 20,
    borderBottomWidth: 1,
    borderColor: '#234881',
    paddingVertical: 2,
    minWidth: 120,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    marginTop: 2,
  },
  editText: {
    color: '#234881',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 4,
  },
  saveBtn: {
    marginLeft: 10,
    marginTop: 2,
  },
  saveText: {
    color: '#27ae60',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
  },
  cancelBtn: {
    marginLeft: 10,
    marginTop: 2,
  },
  cancelText: {
    color: '#d32f2f',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
  },
  divider: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 1,
    backgroundColor: '#ececec',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#222',
    marginTop: 24,
    marginBottom: 10,
  },
  closeProfileRow: {
    marginTop: 0,
    marginBottom: 24,
  },
  closeProfileText: {
    color: '#d32f2f',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default ProfileScreen; 