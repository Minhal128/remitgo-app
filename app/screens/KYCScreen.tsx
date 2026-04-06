import { Feather, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { KYCFailureModal } from '../components/KYCFailureModal';
import { KYCSuccessModal } from '../components/KYCSuccessModal';
import { apiFetch } from '../utils/api';
import ImageCompression from '../utils/imageCompression';
import { KYCStorage } from '../utils/kycStorage';

const { width, height } = Dimensions.get('window');

// Updated theme color to match the dark blue from reference image
const THEME_BLUE = '#1e3a8a'; // Dark blue color
const THEME_BLUE_LIGHT = '#3b82f6'; // Lighter blue for hover states
const ERROR_COLOR = '#dc2626'; // Red for error states
const SUCCESS_COLOR = '#059669'; // Green for success states

interface KYCData {
  firstName: string;
  middleName: string;
  lastName: string;
  dob: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  idType: 'passport' | 'driver_license' | 'national_id';
  idNumber: string;
  idExpiry: string; // Added expiry date field
  idFrontImage: string;
  idBackImage: string;
  selfieImage: string;
}

interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  dob?: string;
  phone?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  idType?: string;
  idNumber?: string;
  idExpiry?: string; // Added expiry validation
  idFrontImage?: string;
  selfieImage?: string;
}

const KYCScreen: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [kycData, setKycData] = useState<KYCData>({
    firstName: '',
    middleName: '',
    lastName: '',
    dob: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    },
    idType: 'passport',
    idNumber: '',
    idExpiry: '', // Initialize expiry field
    idFrontImage: '',
    idBackImage: '',
    selfieImage: ''
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [kycId, setKycId] = useState<string>('');
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [showSignInButton, setShowSignInButton] = useState(false);

  // Format expiry date with automatic slashes
  const formatExpiryDate = (text: string): string => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    
    // Limit to 4 digits
    const limited = cleaned.slice(0, 4);
    
    // Add slashes
    if (limited.length >= 2) {
      return `${limited.slice(0, 2)}/${limited.slice(2)}`;
    }
    
    return limited;
  };

  // Validate expiry date
  const validateExpiryDate = (expiry: string): string | undefined => {
    if (!expiry.trim()) return 'Expiry date is required';
    
    const parts = expiry.split('/');
    if (parts.length !== 2) return 'Please use MM/YY format';
    
    const month = parseInt(parts[0]);
    const year = parseInt(parts[1]);
    
    if (isNaN(month) || isNaN(year)) return 'Please enter valid numbers';
    if (month < 1 || month > 12) return 'Month must be between 01 and 12';
    if (year < 0 || year > 99) return 'Please enter a valid year';
    
    // Check if expired
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return 'Document has expired';
    }
    
    return undefined;
  };

  // Format card number with automatic slashes
  const formatCardNumber = (text: string): string => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    
    // Limit to 16 digits
    const limited = cleaned.slice(0, 16);
    
    // Add spaces every 4 digits
    return limited.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  // Format date of birth with automatic slashes (DD/MM/YYYY)
  const formatDateOfBirth = (text: string): string => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    
    // Limit to 8 digits (DDMMYYYY)
    const limited = cleaned.slice(0, 8);
    
    // Add slashes after DD and MM
    if (limited.length >= 4) {
      return `${limited.slice(0, 2)}/${limited.slice(2, 4)}/${limited.slice(4)}`;
    } else if (limited.length >= 2) {
      return `${limited.slice(0, 2)}/${limited.slice(2)}`;
    }
    
    return limited;
  };

  // Convert image URI to base64 string
  const convertImageToBase64 = async (imageUri: string): Promise<string> => {
    try {
      if (imageUri.startsWith('data:image/')) {
        return imageUri; // Already base64
      }
      
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: 'base64',
      });
      
      // Determine file extension from URI or default to jpg
      const fileExtension = imageUri.split('.').pop()?.toLowerCase();
      const mimeType = fileExtension === 'png' ? 'image/png' : 'image/jpeg';
      
      return `data:${mimeType};base64,${base64}`;
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw new Error('Failed to process image. Please try again.');
    }
  };

  useEffect(() => {
    // Animate in on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      })]).start();
  },[]);

  useEffect(() => {
    // Update progress animation when step changes
    Animated.timing(progressAnim, {
      toValue: (currentStep / 5) * 100,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  // Check authentication when component mounts
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          setModalTitle('Authentication Required');
          setModalMessage('Please sign in to continue with KYC verification.');
          setShowSignInButton(true);
          setShowFailureModal(true);
          return;
        }

        // Validate token format and check if it's expired
        if (!token.startsWith('eyJ')) {
          setModalTitle('Invalid Token');
          setModalMessage('Your authentication token is invalid. Please sign in again.');
          setShowSignInButton(true);
          setShowFailureModal(true);
          return;
        }

        // Check if token is expired
        try {
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            const currentTime = Date.now() / 1000;
            
            if (payload.exp && payload.exp < currentTime) {
              setModalTitle('Session Expired');
              setModalMessage('Your session has expired. Please sign in again.');
              setShowSignInButton(true);
              setShowFailureModal(true);
              return;
            }
          }
        } catch (decodeError) {
          console.warn('Could not decode token payload:', decodeError);
        }

        console.log('✅ Authentication check passed');
        
        // Clear any previous error states if authentication is successful
        if (showFailureModal && showSignInButton) {
          setShowFailureModal(false);
          setShowSignInButton(false);
          setModalTitle('');
          setModalMessage('');
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        setModalTitle('Authentication Error');
        setModalMessage('Unable to verify your authentication. Please sign in again.');
        setShowSignInButton(true);
        setShowFailureModal(true);
      }
    };

    checkAuthentication();
  }, []);

  // Check authentication when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const checkAuthOnFocus = async () => {
        const token = await AsyncStorage.getItem('token');
        if (token && !showFailureModal) {
          // If we have a token and no failure modal is showing, clear any previous error states
          setShowSignInButton(false);
          setModalTitle('');
          setModalMessage('');
        }
      };
      
      checkAuthOnFocus();
    }, [showFailureModal])
  );

  const validateField = (field: keyof KYCData | keyof KYCData['address'], value: any): string | undefined => {
    switch (field) {
      case 'firstName':
        if (!value.trim()) return 'First name is required';
        if (value.trim().length < 2) return 'First name must be at least 2 characters';
        if (!/^[a-zA-Z\s]+$/.test(value.trim())) return 'First name can only contain letters';
        break;
      case 'lastName':
        if (!value.trim()) return 'Last name is required';
        if (value.trim().length < 2) return 'Last name must be at least 2 characters';
        if (!/^[a-zA-Z\s]+$/.test(value.trim())) return 'Last name can only contain letters';
        break;
      case 'dob':
        if (!value) return 'Date of birth is required';
        // Validate DD/MM/YYYY format
        const dobParts = value.split('/');
        if (dobParts.length !== 3) return 'Please use DD/MM/YYYY format';
        
        const day = parseInt(dobParts[0]);
        const month = parseInt(dobParts[1]);
        const year = parseInt(dobParts[2]);
        
        if (isNaN(day) || isNaN(month) || isNaN(year)) return 'Please enter valid numbers';
        if (day < 1 || day > 31) return 'Day must be between 01 and 31';
        if (month < 1 || month > 12) return 'Month must be between 01 and 12';
        if (year < 1900 || year > new Date().getFullYear()) return 'Please enter a valid year';
        
        // Check if date is valid
        const dobDate = new Date(year, month - 1, day);
        if (dobDate.getDate() !== day || dobDate.getMonth() !== month - 1 || dobDate.getFullYear() !== year) {
          return 'Please enter a valid date';
        }
        
        // Check age (must be at least 18)
        const age = new Date().getFullYear() - year;
        if (age < 18) return 'You must be at least 18 years old';
        if (age > 120) return 'Please enter a valid date of birth';
        break;
      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        if (!/^\+?[\d\s\-\(\)]{10,}$/.test(value.trim())) return 'Please enter a valid phone number';
        break;
      case 'street':
        if (!value.trim()) return 'Street address is required';
        if (value.trim().length < 5) return 'Please enter a complete street address';
        break;
      case 'city':
        if (!value.trim()) return 'City is required';
        if (value.trim().length < 2) return 'Please enter a valid city name';
        break;
      case 'state':
        if (!value.trim()) return 'State/Province is required';
        break;
      case 'postalCode':
        if (!value.trim()) return 'Postal code is required';
        if (value.trim().length < 3) return 'Please enter a valid postal code';
        break;
      case 'country':
        if (!value.trim()) return 'Country is required';
        break;
      case 'idNumber':
        if (!value.trim()) return 'ID number is required';
        if (value.trim().length < 3) return 'Please enter a valid ID number';
        break;
      case 'idExpiry':
        return validateExpiryDate(value);
      case 'idFrontImage':
        if (!value) return 'ID front image is required';
        break;
      case 'selfieImage':
        if (!value) return 'Selfie photo is required';
        break;
    }
    return undefined;
  };

  const validateStep = (step: number): boolean => {
    const newErrors: ValidationErrors = {};

    switch (step) {
      case 1:
        newErrors.firstName = validateField('firstName', kycData.firstName);
        newErrors.lastName = validateField('lastName', kycData.lastName);
        newErrors.dob = validateField('dob', kycData.dob);
        newErrors.phone = validateField('phone', kycData.phone);
        break;
      case 2:
        newErrors.street = validateField('street', kycData.address.street);
        newErrors.city = validateField('city', kycData.address.city);
        newErrors.state = validateField('state', kycData.address.state);
        newErrors.postalCode = validateField('postalCode', kycData.address.postalCode);
        newErrors.country = validateField('country', kycData.address.country);
        break;
      case 3:
        newErrors.idNumber = validateField('idNumber', kycData.idNumber);
        newErrors.idExpiry = validateField('idExpiry', kycData.idExpiry);
        break;
      case 4:
        newErrors.idFrontImage = validateField('idFrontImage', kycData.idFrontImage);
        newErrors.selfieImage = validateField('selfieImage', kycData.selfieImage);
        break;
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  // Real-time validation for input fields
  const handleInputChange = (field: keyof KYCData | keyof KYCData['address'], value: string) => {
    setKycData(prev => {
      if (field === 'street' || field === 'city' || field === 'state' || field === 'postalCode' || field === 'country') {
        return {
          ...prev,
          address: { ...prev.address, [field]: value }
        };
      }
      return { ...prev, [field]: value };
    });

    // Clear error for this field
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  // Handle expiry date input with formatting
  const handleExpiryChange = (text: string) => {
    const formatted = formatExpiryDate(text);
    setKycData(prev => ({ ...prev, idExpiry: formatted }));
    setErrors(prev => ({ ...prev, idExpiry: undefined }));
  };

  // Handle card number input with formatting
  const handleCardNumberChange = (text: string) => {
    const formatted = formatCardNumber(text);
    setKycData(prev => ({ ...prev, idNumber: formatted }));
    setErrors(prev => ({ ...prev, idNumber: undefined }));
  };

  // Handle date of birth input with formatting
  const handleDateOfBirthChange = (text: string) => {
    const formatted = formatDateOfBirth(text);
    setKycData(prev => ({ ...prev, dob: formatted }));
    setErrors(prev => ({ ...prev, dob: undefined }));
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 4) {
        submitKYC();
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const pickImage = async (type: 'idFront' | 'idBack' | 'selfie') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: type === 'selfie' ? [1, 1] : [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        
        // Convert image to base64 format
        const base64Image = await convertImageToBase64(imageUri);
        
        setKycData(prev => ({
          ...prev,
          [type === 'idFront' ? 'idFrontImage' : type === 'idBack' ? 'idBackImage' : 'selfieImage']: base64Image
        }));

        // Clear error for this field
        setErrors(prev => ({
          ...prev,
          [type === 'idFront' ? 'idFrontImage' : type === 'idBack' ? 'idBackImage' : 'selfieImage']: undefined
        }));
      }
    } catch (error) {
      console.error('Error processing image:', error);
      Alert.alert('Error', 'Failed to process image. Please try again.');
    }
  };

  const submitKYC = async () => {
    try {
      setIsLoading(true);
      setIsVerifying(true);

      // Real-time AI verification flow - no pending states, immediate results
      console.log('🚀 Starting real-time KYC verification...');

      // Get user token
      const token = await AsyncStorage.getItem('token');
      console.log('🔑 Token retrieved:', token ? `${token.substring(0, 20)}...` : 'No token found');
      
      if (!token) {
        throw new Error('Authentication token not found. Please sign in again.');
      }

      // Validate token format and check if it's expired
      if (!token.startsWith('eyJ')) {
        console.warn('⚠️ Token format seems invalid:', token.substring(0, 50));
        throw new Error('Invalid token format. Please sign in again.');
      }

      // Check if token is expired by decoding JWT payload
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          const currentTime = Date.now() / 1000;
          
          if (payload.exp && payload.exp < currentTime) {
            console.warn('⚠️ Token is expired:', new Date(payload.exp * 1000));
            throw new Error('Your session has expired. Please sign in again.');
          }
          
          console.log('✅ Token is valid, expires:', new Date(payload.exp * 1000));
        }
      } catch (decodeError) {
        console.warn('⚠️ Could not decode token payload:', decodeError);
        // Continue anyway, let the server validate
      }

      // If we reach here, authentication is valid, proceed with KYC submission
      console.log('🔐 Authentication validated, proceeding with real-time KYC verification...');

      // Compress images before sending to reduce payload size
      const compressedImages = await Promise.all([
        ImageCompression.compressImage(kycData.idFrontImage, { 
          quality: 0.7, 
          maxWidth: 800, 
          maxHeight: 800 
        }),
        kycData.idBackImage ? ImageCompression.compressImage(kycData.idBackImage, { 
          quality: 0.7, 
          maxWidth: 800, 
          maxHeight: 800 
        }) : null,
        ImageCompression.compressImage(kycData.selfieImage, { 
          quality: 0.8, 
          maxWidth: 600, 
          maxHeight: 600 
        })
      ]);

      const [compressedIdFront, compressedIdBack, compressedSelfie] = compressedImages;

      // Log compression results
      console.log('📊 Image compression results:');
      console.log('🆔 ID Front:', ImageCompression.formatFileSize(ImageCompression.getBase64Size(compressedIdFront)));
      console.log('🆔 ID Back:', compressedIdBack ? ImageCompression.formatFileSize(ImageCompression.getBase64Size(compressedIdBack)) : 'N/A');
      console.log('🤳 Selfie:', ImageCompression.formatFileSize(ImageCompression.getBase64Size(compressedSelfie)));

      // Prepare request body with compressed images
      const requestBody = {
        firstName: kycData.firstName,
        middleName: kycData.middleName,
        lastName: kycData.lastName,
        dob: kycData.dob,
        phone: kycData.phone,
        address: kycData.address,
        idType: kycData.idType,
        idNumber: kycData.idNumber,
        idExpiry: kycData.idExpiry,
        idFrontImage: compressedIdFront,
        idBackImage: compressedIdBack || null,
        selfieImage: compressedSelfie
      };

      console.log('📤 Submitting KYC with compressed images...');
      console.log('📏 Payload size:', ImageCompression.formatFileSize(JSON.stringify(requestBody).length));
      console.log('📊 Total images size:', ImageCompression.formatFileSize(
        ImageCompression.getBase64Size(compressedIdFront) +
        (compressedIdBack ? ImageCompression.getBase64Size(compressedIdBack) : 0) +
        ImageCompression.getBase64Size(compressedSelfie)
      ));

      // Show progress message for KYC processing
      setModalTitle('Processing KYC Verification... ⏳');
      setModalMessage('Please wait while we process your documents. This may take up to 60 seconds for large images.');
      setShowProgressModal(true);
      
      // Use apiFetch utility for proper authentication and error handling
      const result = await apiFetch('/kyc/submit-realtime', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });
      
      // Hide progress modal
      setShowProgressModal(false);

      console.log('📡 KYC submission successful:', result);

      if (result.success) {
        setKycId(result.kycId);
        
        // Handle different KYC status responses
        if (result.kycStatus === 'verified') {
          // Immediate verification success
          setModalTitle('Verification Successful! 🎉');
          setModalMessage('Congratulations! Your KYC verification has been completed successfully in real-time. You now have access to all RemitGo features.');
          setShowSuccessModal(true);
        } else if (result.kycStatus === 'rejected') {
          // Immediate verification failure
          setModalTitle('Verification Failed ❌');
          setModalMessage(result.verificationDecision?.reason || 'We encountered an issue with your KYC verification. Please review your documents and try again.');
          setShowFailureModal(true);
        } else if (result.kycStatus === 'pending' || result.status === 'pending') {
          // For real-time verification, treat pending as failure and ask user to retry
          setModalTitle('Verification In Progress ⏳');
          setModalMessage('Your verification is still being processed. Please wait a moment and try again.');
          setShowFailureModal(true);
        } else {
          // Unknown status, treat as failure
          setModalTitle('Verification Failed ❌');
          setModalMessage('We encountered an issue with your verification. Please try again.');
          setShowFailureModal(true);
        }
      } else {
        // Check if it's a service overload error
        if (result.message?.includes('overload') || result.message?.includes('too many requests')) {
          // Service is overloaded, show error and ask to retry
          setModalTitle('Service Temporarily Unavailable');
          setModalMessage('Our verification service is currently busy. Please try again in a few minutes.');
          setShowFailureModal(true);
        } else {
          throw new Error(result.message || 'Failed to submit KYC');
        }
      }
    } catch (error: any) {
      console.error('KYC submission error:', error);
      
      // Check if it's an authentication error
      if (error.message?.includes('token') || 
          error.message?.includes('sign in') || 
          error.message?.includes('session') ||
          error.message?.includes('Authentication failed')) {
        
        // Clear invalid auth data
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        
        // Show error modal with redirect option
        setModalTitle('Authentication Required');
        setModalMessage('Please sign in again to continue with KYC verification.');
        setShowSignInButton(true);
        setShowFailureModal(true);
        
        // Remove the automatic redirect timeout since we now have a button
      }
      
      // Check if it's a network error that might indicate overload
      if (error.message?.includes('timeout') || error.message?.includes('network') || error.message?.includes('fetch')) {
        // Network timeout, show error modal
        setModalTitle('Network Error');
        setModalMessage('Network connection issue. Please check your internet connection and try again.');
        setShowFailureModal(true);
      } else {
        setModalTitle('Submission Failed');
        setModalMessage(error.message || 'Failed to submit KYC. Please try again.');
        setShowFailureModal(true);
      }
    } finally {
      setIsLoading(false);
      setIsVerifying(false);
    }
  };



  const handleSuccessModalClose = async () => {
    setShowSuccessModal(false);
    
    // Cache KYC success status
    const user = JSON.parse(await AsyncStorage.getItem('user') || '{}');
    await KYCStorage.markKYCCompleted(user._id, true, 'verified', new Date().toISOString());
    
    // Navigate to sign-in screen after successful KYC verification
    router.replace('/screens/signin');
  };

  const handleFailureModalClose = () => {
    setShowFailureModal(false);
    setShowSignInButton(false);
    setCurrentStep(4); // Go back to document upload step
  };

  const handleFailureModalRetry = () => {
    setShowFailureModal(false);
    setShowSignInButton(false);
    setModalTitle('');
    setModalMessage('');
    
    // For real-time verification, go back to document upload step to retry
    setCurrentStep(4); // Go back to document upload step
  };

  const handleFailureModalStartOver = () => {
    setShowFailureModal(false);
    setShowSignInButton(false);
    setModalTitle('');
    setModalMessage('');
    
    // Start over from the beginning
    setCurrentStep(1);
    
    // Clear all data
    setKycData({
      firstName: '',
      middleName: '',
      lastName: '',
      dob: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
      },
      idType: 'passport',
      idNumber: '',
      idExpiry: '',
      idFrontImage: '',
      idBackImage: '',
      selfieImage: '',
    });
    setErrors({});
  };

  const handleSignInRedirect = async () => {
    // Clear the failure modal
    setShowFailureModal(false);
    setShowSignInButton(false);
    setModalTitle('');
    setModalMessage('');
    
    // Navigate to sign in
    router.replace('/screens/signin');
  };

  const renderModernStepper = () => {
    const steps = [
      { id: 1, title: 'Personal', icon: 'user' },
      { id: 2, title: 'Address', icon: 'map-pin' },
      { id: 3, title: 'Identity', icon: 'credit-card' },
      { id: 4, title: 'Documents', icon: 'file-text' },
      { id: 5, title: 'Review', icon: 'check-circle' },
    ];

    return (
      <View style={styles.stepperContainer}>
        <View style={styles.stepperHeader}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.stepperTitle}>KYC Verification</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.stepperSteps}>
          {steps.map((step, index) => (
            <View key={step.id} style={styles.stepItem}>
              <View style={[
                styles.stepCircle,
                currentStep >= step.id ? styles.stepCircleActive : styles.stepCircleInactive,
                currentStep > step.id ? styles.stepCircleCompleted : null
              ]}>
                {currentStep > step.id ? (
                  <Feather name="check" size={16} color="white" />
                ) : (
                  <Feather name={step.icon as any} size={16} color={currentStep >= step.id ? "white" : "#999"} />
                )}
              </View>
              <Text style={[
                styles.stepText,
                currentStep >= step.id ? styles.stepTextActive : styles.stepTextInactive
              ]}>
                {step.title}
              </Text>
              {index < steps.length - 1 && (
                <View style={[
                  styles.stepLine,
                  currentStep > step.id ? styles.stepLineActive : styles.stepLineInactive
                ]} />
              )}
            </View>
          ))}
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill,
                { width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%']
                })}
              ]} 
            />
          </View>
          <Text style={styles.progressText}>Step {currentStep} of 5</Text>
        </View>
      </View>
    );
  };

  const renderStep1 = () => (
    <Animated.View style={[styles.stepContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.stepTitle}>Personal Information</Text>
      <Text style={styles.stepSubtitle}>Please provide your basic personal details</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>First Name *</Text>
        <TextInput
          style={[styles.input, errors.firstName ? styles.inputError : null]}
          value={kycData.firstName}
          onChangeText={(text) => handleInputChange('firstName', text)}
          placeholder="Enter your first name"
          autoCapitalize="words"
        />
        {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Middle Name</Text>
        <TextInput
          style={styles.input}
          value={kycData.middleName}
          onChangeText={(text) => handleInputChange('middleName', text)}
          placeholder="Enter your middle name (optional)"
          autoCapitalize="words"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Last Name *</Text>
        <TextInput
          style={[styles.input, errors.lastName ? styles.inputError : null]}
          value={kycData.lastName}
          onChangeText={(text) => handleInputChange('lastName', text)}
          placeholder="Enter your last name"
          autoCapitalize="words"
        />
        {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Date of Birth *</Text>
        <TextInput
          style={[styles.input, errors.dob ? styles.inputError : null]}
          value={kycData.dob}
          onChangeText={handleDateOfBirthChange}
          placeholder="DD/MM/YYYY"
          keyboardType="numeric"
          maxLength={10} // DD/MM/YYYY format
        />
        {errors.dob && <Text style={styles.errorText}>{errors.dob}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Phone Number *</Text>
        <TextInput
          style={[styles.input, errors.phone ? styles.inputError : null]}
          value={kycData.phone}
          onChangeText={(text) => handleInputChange('phone', text)}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
        />
        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
      </View>
    </Animated.View>
  );

  const renderStep2 = () => (
    <Animated.View style={[styles.stepContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.stepTitle}>Address Information</Text>
      <Text style={styles.stepSubtitle}>Please provide your current address</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Street Address *</Text>
        <TextInput
          style={[styles.input, errors.street ? styles.inputError : null]}
          value={kycData.address.street}
          onChangeText={(text) => handleInputChange('street', text)}
          placeholder="Enter your street address"
          autoCapitalize="words"
        />
        {errors.street && <Text style={styles.errorText}>{errors.street}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>City *</Text>
        <TextInput
          style={[styles.input, errors.city ? styles.inputError : null]}
          value={kycData.address.city}
          onChangeText={(text) => handleInputChange('city', text)}
          placeholder="Enter your city"
          autoCapitalize="words"
        />
        {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>State/Province *</Text>
        <TextInput
          style={[styles.input, errors.state ? styles.inputError : null]}
          value={kycData.address.state}
          onChangeText={(text) => handleInputChange('state', text)}
          placeholder="Enter your state or province"
          autoCapitalize="words"
        />
        {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Postal Code *</Text>
        <TextInput
          style={[styles.input, errors.postalCode ? styles.inputError : null]}
          value={kycData.address.postalCode}
          onChangeText={(text) => handleInputChange('postalCode', text)}
          placeholder="Enter your postal code"
          autoCapitalize="characters"
        />
        {errors.postalCode && <Text style={styles.errorText}>{errors.postalCode}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Country *</Text>
        <TextInput
          style={[styles.input, errors.country ? styles.inputError : null]}
          value={kycData.address.country}
          onChangeText={(text) => handleInputChange('country', text)}
          placeholder="Enter your country"
          autoCapitalize="words"
        />
        {errors.country && <Text style={styles.errorText}>{errors.country}</Text>}
      </View>
    </Animated.View>
  );

  const renderStep3 = () => (
    <Animated.View style={[styles.stepContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.stepTitle}>Identity Information</Text>
      <Text style={styles.stepSubtitle}>Please provide your identity document details</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>ID Type *</Text>
        <View style={styles.idTypeContainer}>
          {['passport', 'driver_license', 'national_id'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.idTypeButton,
                kycData.idType === type ? styles.idTypeButtonActive : null
              ]}
              onPress={() => setKycData(prev => ({ ...prev, idType: type as any }))}
            >
              <Text style={[
                styles.idTypeText,
                kycData.idType === type ? styles.idTypeTextActive : null
              ]}>
                {type.replace('_', ' ').toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>ID Number *</Text>
        <TextInput
          style={[styles.input, errors.idNumber ? styles.inputError : null]}
          value={kycData.idNumber}
          onChangeText={handleCardNumberChange}
          placeholder="Enter your ID number"
          autoCapitalize="characters"
          maxLength={19} // 16 digits + 3 spaces
        />
        {errors.idNumber && <Text style={styles.errorText}>{errors.idNumber}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Expiry Date *</Text>
        <TextInput
          style={[styles.input, errors.idExpiry ? styles.inputError : null]}
          value={kycData.idExpiry}
          onChangeText={handleExpiryChange}
          placeholder="MM/YY"
          keyboardType="numeric"
          maxLength={5} // MM/YY format
        />
        {errors.idExpiry && <Text style={styles.errorText}>{errors.idExpiry}</Text>}
      </View>
    </Animated.View>
  );

  const renderStep4 = () => (
    <Animated.View style={[styles.stepContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.stepTitle}>Document Upload</Text>
      <Text style={styles.stepSubtitle}>Please upload clear photos of your documents</Text>
      
      <View style={styles.uploadSection}>
        <Text style={styles.uploadTitle}>ID Document Front *</Text>
        <TouchableOpacity
          style={[styles.uploadButton, kycData.idFrontImage ? styles.uploadButtonSuccess : null]}
          onPress={() => pickImage('idFront')}
        >
          {kycData.idFrontImage ? (
            <View style={styles.uploadSuccess}>
              <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
              <Text style={styles.uploadSuccessText}>Uploaded ✓</Text>
            </View>
          ) : (
            <View style={styles.uploadPlaceholder}>
              <Feather name="camera" size={32} color="#666" />
              <Text style={styles.uploadPlaceholderText}>Tap to upload ID front</Text>
            </View>
          )}
        </TouchableOpacity>
        {errors.idFrontImage && <Text style={styles.errorText}>{errors.idFrontImage}</Text>}
      </View>

      <View style={styles.uploadSection}>
        <Text style={styles.uploadTitle}>ID Document Back (Optional)</Text>
        <TouchableOpacity
          style={[styles.uploadButton, kycData.idBackImage ? styles.uploadButtonSuccess : null]}
          onPress={() => pickImage('idBack')}
        >
          {kycData.idBackImage ? (
            <View style={styles.uploadSuccess}>
              <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
              <Text style={styles.uploadSuccessText}>Uploaded ✓</Text>
            </View>
          ) : (
            <View style={styles.uploadPlaceholder}>
              <Feather name="camera" size={32} color="#666" />
              <Text style={styles.uploadPlaceholderText}>Tap to upload ID back</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.uploadSection}>
        <Text style={styles.uploadTitle}>Selfie Photo *</Text>
        <TouchableOpacity
          style={[styles.uploadButton, kycData.selfieImage ? styles.uploadButtonSuccess : null]}
          onPress={() => pickImage('selfie')}
        >
          {kycData.selfieImage ? (
            <View style={styles.uploadSuccess}>
              <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
              <Text style={styles.uploadSuccessText}>Uploaded ✓</Text>
            </View>
          ) : (
            <View style={styles.uploadPlaceholder}>
              <Feather name="user" size={32} color="#666" />
              <Text style={styles.uploadPlaceholderText}>Tap to take selfie</Text>
            </View>
          )}
        </TouchableOpacity>
        {errors.selfieImage && <Text style={styles.errorText}>{errors.selfieImage}</Text>}
      </View>

      <View style={styles.infoBox}>
        <MaterialIcons name="info" size={20} color="#2196F3" />
        <Text style={styles.infoText}>
          Please ensure all photos are clear, well-lit, and show all text clearly. 
          Your selfie should match the person in your ID document.
        </Text>
      </View>
    </Animated.View>
  );

  const renderStep5 = () => (
    <Animated.View style={[styles.stepContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.stepTitle}>Verification</Text>
      <Text style={styles.stepSubtitle}>Please review your information before submission</Text>
      
      <View style={styles.reviewSection}>
        <Text style={styles.reviewTitle}>Personal Information</Text>
        <Text style={styles.reviewText}>Name: {kycData.firstName} {kycData.middleName} {kycData.lastName}</Text>
        <Text style={styles.reviewText}>Date of Birth: {kycData.dob}</Text>
        <Text style={styles.reviewText}>Phone: {kycData.phone}</Text>
      </View>

      <View style={styles.reviewSection}>
        <Text style={styles.reviewTitle}>Address</Text>
        <Text style={styles.reviewText}>{kycData.address.street}</Text>
        <Text style={styles.reviewText}>{kycData.address.city}, {kycData.address.state} {kycData.address.postalCode}</Text>
        <Text style={styles.reviewText}>{kycData.address.country}</Text>
      </View>

      <View style={styles.reviewSection}>
        <Text style={styles.reviewTitle}>Identity Document</Text>
        <Text style={styles.reviewText}>Type: {kycData.idType.replace('_', ' ').toUpperCase()}</Text>
        <Text style={styles.reviewText}>Number: {kycData.idNumber}</Text>
        <Text style={styles.reviewText}>Expiry: {kycData.idExpiry}</Text>
      </View>

      <View style={styles.reviewSection}>
        <Text style={styles.reviewTitle}>Documents</Text>
        <Text style={styles.reviewText}>ID Front: {kycData.idFrontImage ? '✓ Uploaded' : '✗ Missing'}</Text>
        <Text style={styles.reviewText}>Selfie: {kycData.selfieImage ? '✓ Uploaded' : '✗ Missing'}</Text>
        {kycData.idBackImage && <Text style={styles.reviewText}>ID Back: ✓ Uploaded</Text>}
      </View>

      <View style={styles.infoBox}>
        <MaterialIcons name="security" size={20} color="#4CAF50" />
        <Text style={styles.infoText}>
          Your information will be securely processed using AI-powered verification. 
          This typically takes 10-30 seconds.
        </Text>
      </View>
    </Animated.View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      default: return renderStep1();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {renderModernStepper()}

      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderCurrentStep()}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.nextButton, (isLoading || isVerifying) ? styles.nextButtonDisabled : null]}
            onPress={handleNext}
            disabled={isLoading || isVerifying}
          >
            {isLoading || isVerifying ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.nextButtonText}>
                {currentStep === 4 ? 'Submit KYC' : 'Next'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Professional Success Modal */}
      <KYCSuccessModal
        visible={showSuccessModal}
        onClose={handleSuccessModalClose}
        title={modalTitle}
        message={modalMessage}
        buttonText="Continue to Sign In"
      />

      {/* Professional Failure Modal */}
      <KYCFailureModal
        visible={showFailureModal}
        onRetry={handleFailureModalRetry}
        onClose={handleFailureModalStartOver}
        title={modalTitle}
        message={modalMessage}
        retryButtonText="Try Again"
        closeButtonText="Start Over"
        showSignInButton={showSignInButton}
        onSignIn={handleSignInRedirect}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  stepperContainer: {
    backgroundColor: 'white',
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    ...Platform.select({
      web: {
        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.05)',
      },
      default: {
        elevation: 5,
      },
    }),
  },
  stepperHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  stepperTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  placeholder: {
    width: 40,
  },
  stepperSteps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepCircleInactive: {
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  stepCircleActive: {
    backgroundColor: THEME_BLUE,
    borderWidth: 2,
    borderColor: THEME_BLUE,
  },
  stepCircleCompleted: {
    backgroundColor: '#28a745',
    borderColor: '#28a745',
  },
  stepText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  stepTextInactive: {
    color: '#6c757d',
  },
  stepTextActive: {
    color: THEME_BLUE,
  },
  stepLine: {
    position: 'absolute',
    top: 20,
    left: '50%',
    width: '100%',
    height: 2,
    backgroundColor: '#e9ecef',
    zIndex: -1,
  },
  stepLineActive: {
    backgroundColor: '#28a745',
  },
  stepLineInactive: {
    backgroundColor: '#e9ecef',
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#e9ecef',
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: THEME_BLUE,
    borderRadius: 3,
  },
  progressText: {
    color: '#6c757d',
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  stepContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.08)',
      },
      default: {
        elevation: 5,
        borderWidth: 1,
        borderColor: '#f1f3f4',
      },
    }),
  },
  stepTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 28,
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#495057',
  },
  inputError: {
    borderColor: '#dc3545',
    backgroundColor: '#fff5f5',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 14,
    marginTop: 6,
    fontWeight: '500',
  },
  idTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  idTypeButton: {
    flex: 1,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#e9ecef',
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  idTypeButtonActive: {
    borderColor: THEME_BLUE,
    backgroundColor: '#f8f9ff',
  },
  idTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c757d',
  },
  idTypeTextActive: {
    color: THEME_BLUE,
  },
  uploadSection: {
    marginBottom: 28,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 14,
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 36,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  uploadButtonSuccess: {
    borderColor: '#28a745',
    backgroundColor: '#f8fff9',
  },
  uploadPlaceholder: {
    alignItems: 'center',
  },
  uploadPlaceholderText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6c757d',
    fontWeight: '500',
  },
  uploadSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  uploadSuccessText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#28a745',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    padding: 18,
    borderRadius: 12,
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  infoText: {
    flex: 1,
    marginLeft: 14,
    fontSize: 14,
    color: '#1976d2',
    lineHeight: 22,
    fontWeight: '500',
  },
  reviewSection: {
    marginBottom: 24,
    padding: 18,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 10,
  },
  reviewText: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 6,
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    ...Platform.select({
      web: {
        boxShadow: '0px -2px 8px rgba(0, 0, 0, 0.05)',
      },
      default: {
        elevation: 5,
      },
    }),
  },
  nextButton: {
    backgroundColor: THEME_BLUE,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    shadowColor: THEME_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonDisabled: {
    backgroundColor: '#6c757d',
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    maxWidth: 320,
    width: '100%',
    ...Platform.select({
      web: {
        boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.25)',
      },
      default: {
        elevation: 10,
      },
    }),
  },
  modalIcon: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: '#007bff',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    minWidth: 200,
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
      },
      default: {
        elevation: 4,
      },
    }),
  },
  modalButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default KYCScreen;