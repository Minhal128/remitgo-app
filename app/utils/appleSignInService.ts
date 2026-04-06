import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { ensureFirebaseAuth } from './firebaseConfig';
import webOAuthService from './webOAuthService';

// Platform-specific imports - only load on iOS
let AppleAuthentication: any = null;

// Only attempt to load native modules on iOS platform
if (Platform.OS === 'ios') {
  try {
    // expo-apple-authentication does not export a default; use the module directly
    AppleAuthentication = require('expo-apple-authentication');
    console.log('✅ Apple Authentication native module loaded successfully');
  } catch (error) {
    console.warn('⚠️ Apple Authentication native module not available:', (error as any)?.message || String(error));
  }
} else {
  console.log('📱 Non-iOS platform detected - Apple Sign-In not available');
}

export interface AppleUser {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  socialProvider: 'apple';
  kycStatus?: string;
}

export interface AppleSignInResult {
  success: boolean;
  user?: AppleUser;
  error?: string;
}

class AppleSignInService {
  constructor() {
    this.checkAvailability();
  }

  private async checkAvailability() {
    try {
      if (Platform.OS === 'web') {
        return true;
      }
      if (Platform.OS === 'ios') {
        if (!AppleAuthentication) {
          console.log('🍎 Apple Authentication module not loaded');
          return false;
        }

        const isAvailable = await AppleAuthentication.isAvailableAsync();
        console.log('🍎 Apple Sign-In availability:', isAvailable);
        return isAvailable;
      }
      return false;
    } catch (error) {
      console.error('❌ Error checking Apple Sign-In availability:', error);
      return false;
    }
  }

  async signIn(): Promise<AppleSignInResult> {
    // Apple Sign-In temporarily disabled - using Clerk OAuth instead
    console.log('🍎 Apple Sign-In is currently disabled. Please use Google OAuth with Clerk instead.');
    return {
      success: false,
      error: 'Apple Sign-In is temporarily disabled. Please use Google Sign-In with Clerk instead.'
    };
    
    /* Firebase-based Apple Sign-In disabled
    try {
      console.log('🍎 Starting Apple Sign-In with Firebase...');
      const auth = await ensureFirebaseAuth();
      if (!auth) {
        throw new Error('Firebase Auth not available');
      }

      if (Platform.OS === 'web') {
        try {
          const { signInWithPopup, OAuthProvider } = await import('firebase/auth');
          const provider = new OAuthProvider('apple.com');
          
          provider.addScope('email');
          provider.addScope('name');

          const result = await signInWithPopup(auth, provider);
          
          const credential = OAuthProvider.credentialFromResult(result);
          const idToken = credential?.idToken;

          const firebaseUser = result.user;
          console.log('🔥 Firebase authentication successful:', firebaseUser);

          const appleUser: AppleUser = {
            id: firebaseUser.uid,
            email: firebaseUser.email || undefined,
            firstName: firebaseUser.displayName?.split(' ')[0] || undefined,
            lastName: firebaseUser.displayName?.split(' ')[1] || undefined,
            socialProvider: 'apple',
            kycStatus: 'unverified'
          };

          await this.storeUserData(appleUser, idToken || null);

          return {
            success: true,
            user: appleUser
          };
        } catch (firebaseError: any) {
          console.warn('⚠️ Firebase Apple Sign-In failed, using fallback:', firebaseError.message);
          
          // Fallback to webOAuthService for Apple Sign-In
          const webResult = await webOAuthService.signInWithApple();
          
          if (webResult.success && webResult.user) {
            const appleUser: AppleUser = {
              id: webResult.user.id,
              email: webResult.user.email,
              firstName: webResult.user.firstName,
              lastName: webResult.user.lastName,
              socialProvider: 'apple',
              kycStatus: webResult.user.kycStatus || 'unverified'
            };

            await this.storeUserData(appleUser, 'web-apple-token');

            return {
              success: true,
              user: appleUser
            };
          } else {
            return {
              success: false,
              error: webResult.error || 'Apple sign-in failed'
            };
          }
        }

      } else if (Platform.OS === 'ios') {
        if (!AppleAuthentication) {
          return { success: false, error: 'Apple Authentication module not available' };
        }
        const isAvailable = await AppleAuthentication.isAvailableAsync();
        if (!isAvailable) {
          return { success: false, error: 'Apple Sign-In is not available on this device' };
        }

        const appleCredential = await AppleAuthentication.signInAsync({
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
          ],
        });

        console.log('✅ Apple Sign-In successful:', appleCredential);

        const { identityToken, user, email, fullName } = appleCredential;
        
        if (!identityToken) {
          throw new Error('No identityToken received from Apple');
        }

        // For iOS, use Web Firebase Auth to sign in with the Apple identity token
        const firebaseAuth = await ensureFirebaseAuth();
        const { OAuthProvider, signInWithCredential } = await import('firebase/auth');
        
        const appleProvider = new OAuthProvider('apple.com');
        const appleCredentialFirebase = appleProvider.credential({
          idToken: identityToken,
        });
        
        const firebaseUserCredential = await signInWithCredential(firebaseAuth, appleCredentialFirebase);
        console.log('🔥 Firebase authentication successful:', firebaseUserCredential.user);

        const appleUser: AppleUser = {
          id: firebaseUserCredential.user.uid,
          email: firebaseUserCredential.user.email || email || undefined,
          firstName: fullName?.givenName || undefined,
          lastName: fullName?.familyName || undefined,
          socialProvider: 'apple',
          kycStatus: 'unverified'
        };

        await this.storeUserData(appleUser, identityToken);

        return {
          success: true,
          user: appleUser
        };
      } else {
        return {
          success: false,
          error: 'Apple Sign-In is only available on iOS and web'
        };
      }
    } catch (error: any) {
      console.error('❌ Apple Sign-In error:', error);
      
      if (error.code === 'ERR_REQUEST_CANCELED' || error.code === 'auth/popup-closed-by-user') {
        return {
          success: false,
          error: 'Sign-in was cancelled by user'
        };
      } else {
        return {
          success: false,
          error: error.message || 'Apple sign-in failed'
        };
      }
    }
    */ // End of commented Firebase-based Apple Sign-In
  }

  async signOut(): Promise<boolean> {
    try {
      // Clear stored user data
      await this.clearUserData();
      
      /* Firebase sign-out disabled
      // Sign out from Firebase
      const auth = await ensureFirebaseAuth();
      if (auth) {
        if (Platform.OS === 'web') {
          const { signOut } = await import('firebase/auth');
          await signOut(auth);
        } else if (Platform.OS === 'ios') {
          await auth().signOut();
        }
      }
      */
      
      console.log('✅ Apple Sign-Out successful');
      return true;
    } catch (error) {
      console.error('❌ Error during Apple sign out:', error);
      return false;
    }
  }

  async isSignedIn(): Promise<boolean> {
    const result = await this.getCurrentUser();
    return result.success;
  }

  async getCurrentUser(): Promise<AppleSignInResult> {
    // Return stored user data instead of Firebase user
    try {
      const userData = Platform.OS === 'web' 
        ? localStorage.getItem('appleUserData')
        : await AsyncStorage.getItem('appleUserData');
      
      if (!userData) {
        return {
          success: false,
          error: 'No user currently signed in'
        };
      }
      
      const user: AppleUser = JSON.parse(userData);
      return {
        success: true,
        user
      };
      
      /* Firebase getCurrentUser disabled
      const auth = await ensureFirebaseAuth();
      if (!auth) {
        return {
          success: false,
          error: 'Firebase Auth not available'
        };
      }

      let currentUser: any = null;
      
      if (Platform.OS === 'web') {
        currentUser = auth.currentUser;
      } else if (Platform.OS === 'ios') {
        const { getAuth } = await import('firebase/auth');
        const mobileAuth = getAuth();
        currentUser = mobileAuth.currentUser;
      } else {
        return {
            success: false,
            error: 'Apple Sign-In not supported on this platform'
        };
      }

      if (!currentUser) {
        return {
          success: false,
          error: 'No user currently signed in'
        };
      }

      const user: AppleUser = {
        id: currentUser.uid,
        email: currentUser.email || undefined,
        firstName: currentUser.displayName?.split(' ')[0] || undefined,
        lastName: currentUser.displayName?.split(' ')[1] || undefined,
        socialProvider: 'apple',
        kycStatus: 'unverified'
      };

      return {
        success: true,
        user
      };
      */

    } catch (error) {
      console.error('❌ Error getting current Apple user:', error);
      return {
        success: false,
        error: 'Failed to get current user'
      };
    }
  }

  private async storeUserData(user: AppleUser, idToken: string | null) {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem('appleUserToken', idToken || 'apple-token');
        localStorage.setItem('appleUserData', JSON.stringify(user));
      } else {
        await AsyncStorage.setItem('appleUserToken', idToken || 'apple-token');
        await AsyncStorage.setItem('appleUserData', JSON.stringify(user));
      }
      console.log('✅ Apple user data stored successfully');
    } catch (error) {
      console.error('❌ Error storing Apple user data:', error);
    }
  }

  private async clearUserData() {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem('appleUserToken');
        localStorage.removeItem('appleUserData');
      } else {
        await AsyncStorage.removeItem('appleUserToken');
        await AsyncStorage.removeItem('appleUserData');
      }
      console.log('✅ Apple user data cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing Apple user data:', error);
    }
  }
}

// Export singleton instance
export const appleSignInService = new AppleSignInService();
export default appleSignInService;
