/**
 * Clerk OAuth Service
 * Handles Google OAuth authentication using Clerk
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from '../app/utils/api';

export interface ClerkAuthResult {
  success: boolean;
  user?: any;
  token?: string;
  error?: string;
}

class ClerkOAuthService {
  /**
   * Sign in or sign up with Google using Clerk
   * @param clerkUser - The user object from Clerk after successful OAuth
   * @param clerkToken - The session token from Clerk
   */
  async authenticateWithClerk(clerkUser: any, clerkToken: string): Promise<ClerkAuthResult> {
    try {
      console.log('🔐 Clerk OAuth - Starting authentication with backend');
      console.log('Clerk User:', clerkUser);

      // Extract user data from Clerk
      const email = clerkUser.primaryEmailAddress?.emailAddress || 
                    clerkUser.emailAddresses?.[0]?.emailAddress;
      const firstName = clerkUser.firstName || '';
      const lastName = clerkUser.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim();
      const clerkUserId = clerkUser.id;
      const imageUrl = clerkUser.imageUrl || clerkUser.profileImageUrl;

      if (!email) {
        console.error('❌ No email found in Clerk user data');
        return {
          success: false,
          error: 'No email address found in your account'
        };
      }

      // Send to backend for user creation/login
      // The backend will create or retrieve the user
      const requestBody = {
        email,
        name: fullName,
        clerkUserId,
        imageUrl,
        provider: 'clerk-google',
        accessToken: clerkToken,
      };

      console.log('📤 Sending to backend:', requestBody);

      const response = await apiFetch('/auth/clerk-oauth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Backend response:', response);

      if (response.success && response.token && response.user) {
        console.log('✅ Backend authentication successful');
        
        // Store token and user data
        await AsyncStorage.setItem('token', response.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.user));
        await AsyncStorage.setItem('clerkToken', clerkToken);

        return {
          success: true,
          user: response.user,
          token: response.token,
        };
      } else {
        console.error('❌ Backend authentication failed:', response);
        return {
          success: false,
          error: response.message || 'Authentication with backend failed',
        };
      }
    } catch (error: any) {
      console.error('❌ Clerk OAuth error:', error);
      return {
        success: false,
        error: error.message || 'Authentication failed. Please try again.',
      };
    }
  }

  /**
   * Sign out from Clerk and clear local storage
   */
  async signOut(): Promise<void> {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('clerkToken');
      console.log('✅ Signed out successfully');
    } catch (error) {
      console.error('❌ Sign out error:', error);
    }
  }
}

export default new ClerkOAuthService();
