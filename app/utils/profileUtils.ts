import { apiFetch } from './api';

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  dob?: string;
  street?: string;
  apartment?: string;
  zip?: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
}

export interface ProfileCompletionStatus {
  isComplete: boolean;
  missingFields: string[];
  completedFields: string[];
  nextScreen: string;
}

/**
 * Check if user profile is complete for money transfer
 * Returns profile completion status and next screen to navigate to
 */
export const checkProfileCompletion = async (): Promise<ProfileCompletionStatus> => {
  try {
    const response = await apiFetch('/user/profile');
    
    // Handle both response formats: {user: {...}} and {success: true, data: {...}}
    let profile: UserProfile;
    
    if (response.user) {
      // GET /user/profile returns {user: {...}}
      profile = response.user;
    } else if (response.success && response.data) {
      // Some endpoints return {success: true, data: {...}}
      profile = response.data;
    } else {
      console.error('Unexpected response format:', response);
      return {
        isComplete: false,
        missingFields: ['profile'],
        completedFields: [],
        nextScreen: '/screens/senderdetails'
      };
    }
    
    const missingFields: string[] = [];
    const completedFields: string[] = [];

    // Check basic sender details
    if (!profile.firstName) missingFields.push('firstName');
    else completedFields.push('firstName');
    
    if (!profile.lastName) missingFields.push('lastName');
    else completedFields.push('lastName');
    
    if (!profile.dob) missingFields.push('dob');
    else completedFields.push('dob');

    // Check address details
    if (!profile.street) missingFields.push('street');
    else completedFields.push('street');
    
    if (!profile.zip) missingFields.push('zip');
    else completedFields.push('zip');
    
    if (!profile.state) missingFields.push('state');
    else completedFields.push('state');
    
    if (!profile.country) missingFields.push('country');
    else completedFields.push('country');

    // Check phone
    if (!profile.phone) missingFields.push('phone');
    else completedFields.push('phone');

    // Determine next screen based on what's missing
    let nextScreen = '/screens/senderdetails';
    
    if (profile.firstName && profile.lastName && profile.dob) {
      if (!profile.street || !profile.zip || !profile.state || !profile.country) {
        nextScreen = '/screens/SenderAddressScreen';
      } else if (!profile.phone) {
        nextScreen = '/screens/SenderPhoneScreen';
      } else {
        // Profile is complete, can proceed to payment method
        nextScreen = '/screens/PaymentMethodScreen';
      }
    }

    console.log('Profile completion check:', {
      hasFirstName: !!profile.firstName,
      hasLastName: !!profile.lastName,
      hasDOB: !!profile.dob,
      hasAddress: !!(profile.street && profile.zip && profile.state && profile.country),
      hasPhone: !!profile.phone,
      nextScreen
    });

    return {
      isComplete: missingFields.length === 0,
      missingFields,
      completedFields,
      nextScreen
    };

  } catch (error) {
    console.error('Error checking profile completion:', error);
    return {
      isComplete: false,
      missingFields: ['profile'],
      completedFields: [],
      nextScreen: '/screens/senderdetails'
    };
  }
};

/**
 * Get the next screen user should navigate to for money transfer
 */
export const getNextScreenForTransfer = async (): Promise<string> => {
  const status = await checkProfileCompletion();
  return status.nextScreen;
};

/**
 * Check if user can skip sender details screens
 */
export const canSkipSenderDetails = async (): Promise<boolean> => {
  const status = await checkProfileCompletion();
  return status.isComplete;
};

// Add default export to fix expo-router error
export default {
  checkProfileCompletion,
  getNextScreenForTransfer,
  canSkipSenderDetails
};
