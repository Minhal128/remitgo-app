import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { getFirebaseAuth } from './firebaseConfig';

// Platform-specific imports
let LoginManager = null;
let AccessToken = null;
let GraphRequest = null;
let GraphRequestManager = null;

// Only attempt to load native modules on mobile platforms
if (Platform.OS !== 'web') {
  try {
    const FacebookModule = require('react-native-fbsdk-next');
    LoginManager = FacebookModule.LoginManager;
    AccessToken = FacebookModule.AccessToken;
    GraphRequest = FacebookModule.GraphRequest;
    GraphRequestManager = FacebookModule.GraphRequestManager;
    
    console.log('✅ Facebook SDK native module loaded successfully');
  } catch (error) {
    console.warn('⚠️ Facebook SDK native module not available:', error.message);
  }
} else {
  console.log('🌐 Web platform detected - skipping Facebook SDK native module');
}

export interface FacebookUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  socialProvider: 'facebook';
  kycStatus?: string;
}

export interface FacebookSignInResult {
  success: boolean;
  user?: FacebookUser;
  error?: string;
}

class FacebookSignInService {
  constructor() {
    this.configureFacebookSDK();
  }

  private configureFacebookSDK() {
    try {
      if (Platform.OS === 'web') {
        console.log('Facebook SDK configuration skipped on web platform');
        return;
      }

      if (!LoginManager) {
        console.log('Facebook SDK not available, skipping configuration');
        return;
      }

      console.log('✅ Facebook SDK configured successfully');
    } catch (error) {
      console.error('❌ Error configuring Facebook SDK:', error);
    }
  }

  async signIn(forceNewSignIn: boolean = false): Promise<FacebookSignInResult> {
    try {
      console.log('🚀 Starting Facebook Sign-In with Firebase...');
      
      if (Platform.OS === 'web') {
        return {
          success: false,
          error: 'Facebook Sign-In not supported on web platform'
        };
      }

      // Validate Facebook SDK objects
      if (!LoginManager || !AccessToken) {
        throw new Error('Facebook SDK library not properly loaded');
      }
      
      // If forcing new sign-in, log out first to clear existing session
      if (forceNewSignIn) {
        console.log('🔄 Forcing new sign-in, clearing existing session...');
        await LoginManager.logOut();
      } else {
        // Check if user is already signed in
        const currentAccessToken = await AccessToken.getCurrentAccessToken();
        if (currentAccessToken) {
          console.log('👤 User already signed in, getting current user...');
          return await this.getCurrentUser();
        }
      }

      // Start the sign-in process
      const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
      
      if (result.isCancelled) {
        return {
          success: false,
          error: 'Sign-in was cancelled by user'
        };
      }

      console.log('✅ Facebook Sign-In successful');

      // Get the access token
      const accessToken = await AccessToken.getCurrentAccessToken();
      if (!accessToken) {
        throw new Error('Failed to get Facebook access token');
      }

      console.log('🔑 Got access token for Firebase auth');

      // Get user profile information
      const userProfile = await this.getUserProfile(accessToken.accessToken);

      // Sign in to Firebase with Facebook credentials
      const auth = getFirebaseAuth();
      if (!auth) {
        throw new Error('Firebase Auth not available');
      }
      const facebookCredential = auth.FacebookAuthProvider.credential(accessToken.accessToken);
      const firebaseUserCredential = await auth().signInWithCredential(facebookCredential);
      
      console.log('🔥 Firebase authentication successful:', firebaseUserCredential.user);

      // Create user object
      const user: FacebookUser = {
        id: firebaseUserCredential.user.uid,
        email: firebaseUserCredential.user.email || userProfile.email,
        firstName: userProfile.first_name || undefined,
        lastName: userProfile.last_name || undefined,
        profilePicture: userProfile.picture?.data?.url || firebaseUserCredential.user.photoURL || undefined,
        socialProvider: 'facebook',
        kycStatus: 'unverified'
      };

      // Store user data
      await this.storeUserData(user, accessToken.accessToken);

      return {
        success: true,
        user
      };

    } catch (error: any) {
      console.error('❌ Facebook Sign-In error:', error);
      
      return {
        success: false,
        error: error.message || 'Facebook sign-in failed'
      };
    }
  }

  private async getUserProfile(accessToken: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!GraphRequest || !GraphRequestManager) {
        reject(new Error('GraphRequest not available'));
        return;
      }

      const infoRequest = new GraphRequest(
        '/me',
        {
          accessToken,
          parameters: {
            fields: {
              string: 'id,name,email,first_name,last_name,picture.type(large)'
            }
          }
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      new GraphRequestManager().addRequest(infoRequest).start();
    });
  }

  async getCurrentUser(): Promise<FacebookSignInResult> {
    try {
      if (Platform.OS === 'web') {
        return {
          success: false,
          error: 'Facebook Sign-In not supported on web platform'
        };
      }

      const accessToken = await AccessToken.getCurrentAccessToken();
      if (!accessToken) {
        return {
          success: false,
          error: 'No user currently signed in'
        };
      }

      const userProfile = await this.getUserProfile(accessToken.accessToken);

      const user: FacebookUser = {
        id: userProfile.id,
        email: userProfile.email,
        firstName: userProfile.first_name || undefined,
        lastName: userProfile.last_name || undefined,
        profilePicture: userProfile.picture?.data?.url || undefined,
        socialProvider: 'facebook',
        kycStatus: 'unverified'
      };

      return {
        success: true,
        user
      };

    } catch (error) {
      console.error('❌ Error getting current user:', error);
      return {
        success: false,
        error: 'Failed to get current user'
      };
    }
  }

  async signOut(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        console.log('Facebook Sign-Out skipped on web platform');
        return true;
      }

      await LoginManager.logOut();
      await this.clearUserData();
      console.log('✅ Facebook Sign-Out successful');
      return true;
    } catch (error) {
      console.error('❌ Error during sign out:', error);
      return false;
    }
  }

  async forceSignOut(): Promise<boolean> {
    try {
      console.log('🔄 Force signing out and clearing all sessions...');
      if (Platform.OS !== 'web') {
        await LoginManager.logOut();
      }
      await this.clearUserData();
      console.log('✅ Force sign-out successful');
      return true;
    } catch (error) {
      console.error('❌ Error during force sign out:', error);
      return false;
    }
  }

  async revokeAccess(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        console.log('Facebook access revocation skipped on web platform');
        return true;
      }

      await LoginManager.logOut();
      await this.clearUserData();
      console.log('✅ Facebook access revoked successfully');
      return true;
    } catch (error) {
      console.error('❌ Error revoking access:', error);
      return false;
    }
  }

  async isSignedIn(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        return false;
      }

      const accessToken = await AccessToken.getCurrentAccessToken();
      return !!accessToken;
    } catch (error) {
      console.error('❌ Error checking sign-in status:', error);
      return false;
    }
  }

  private async storeUserData(user: FacebookUser, accessToken: string | null) {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem('userToken', accessToken || 'facebook-token');
        localStorage.setItem('userData', JSON.stringify(user));
      } else {
        await AsyncStorage.setItem('userToken', accessToken || 'facebook-token');
        await AsyncStorage.setItem('userData', JSON.stringify(user));
      }
      console.log('✅ User data stored successfully');
    } catch (error) {
      console.error('❌ Error storing user data:', error);
    }
  }

  private async clearUserData() {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
      } else {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
      }
      console.log('✅ User data cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing user data:', error);
    }
  }
}

// Export singleton instance
export const facebookSignInService = new FacebookSignInService();
export default facebookSignInService;
