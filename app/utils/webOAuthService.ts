import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface WebOAuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  socialProvider: 'google' | 'facebook' | 'apple';
  kycStatus?: string;
}

export interface WebOAuthResult {
  success: boolean;
  user?: WebOAuthUser;
  error?: string;
}

class WebOAuthService {
  constructor() {
    console.log('🌐 Web OAuth Service initialized');
  }

  async signInWithGoogle(): Promise<WebOAuthResult> {
    try {
      console.log('🚀 Starting Web Google Sign-In...');
      
      if (Platform.OS !== 'web') {
        return {
          success: false,
          error: 'Web OAuth service only works on web platform'
        };
      }

      // For web, we'll use a simple demo implementation
      // In production, you would integrate with Google OAuth web flow
      const demoUser: WebOAuthUser = {
        id: 'web-google-demo',
        email: 'demo@google.com',
        firstName: 'Demo',
        lastName: 'Google User',
        profilePicture: 'https://via.placeholder.com/150',
        socialProvider: 'google',
        kycStatus: 'unverified'
      };

      // Store user data
      await this.storeUserData(demoUser, 'web-google-token');

      // Show success modal
      await this.showSuccessModal('Google');

      return {
        success: true,
        user: demoUser
      };

    } catch (error: any) {
      console.error('❌ Web Google Sign-In error:', error);
      return {
        success: false,
        error: error.message || 'Web Google sign-in failed'
      };
    }
  }

  async signInWithFacebook(): Promise<WebOAuthResult> {
    try {
      console.log('🚀 Starting Web Facebook Sign-In...');
      
      if (Platform.OS !== 'web') {
        return {
          success: false,
          error: 'Web OAuth service only works on web platform'
        };
      }

      // For web, we'll use a simple demo implementation
      // In production, you would integrate with Facebook OAuth web flow
      const demoUser: WebOAuthUser = {
        id: 'web-facebook-demo',
        email: 'demo@facebook.com',
        firstName: 'Demo',
        lastName: 'Facebook User',
        profilePicture: 'https://via.placeholder.com/150',
        socialProvider: 'facebook',
        kycStatus: 'unverified'
      };

      // Store user data
      await this.storeUserData(demoUser, 'web-facebook-token');

      // Show success modal
      await this.showSuccessModal('Facebook');

      return {
        success: true,
        user: demoUser
      };

    } catch (error: any) {
      console.error('❌ Web Facebook Sign-In error:', error);
      return {
        success: false,
        error: error.message || 'Web Facebook sign-in failed'
      };
    }
  }

  async signInWithApple(): Promise<WebOAuthResult> {
    try {
      console.log('🚀 Starting Web Apple Sign-In...');
      
      if (Platform.OS !== 'web') {
        return {
          success: false,
          error: 'Web OAuth service only works on web platform'
        };
      }

      // Show Apple ID authentication simulation
      await this.showAppleSignInModal();

      // For web, we'll use a simple demo implementation
      // In production, you would integrate with Apple OAuth web flow
      const demoUser: WebOAuthUser = {
        id: 'web-apple-demo',
        email: 'demo@apple.com',
        firstName: 'Demo',
        lastName: 'Apple User',
        profilePicture: 'https://via.placeholder.com/150',
        socialProvider: 'apple',
        kycStatus: 'unverified'
      };

      // Store user data
      await this.storeUserData(demoUser, 'web-apple-token');

      // Show success modal
      await this.showSuccessModal('Apple ID');

      return {
        success: true,
        user: demoUser
      };

    } catch (error: any) {
      console.error('❌ Web Apple Sign-In error:', error);
      return {
        success: false,
        error: error.message || 'Web Apple sign-in failed'
      };
    }
  }

  private async showAppleSignInModal(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Create Apple Sign-In modal
      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(8px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        animation: fadeIn 0.3s ease-out;
      `;

      const modalContent = document.createElement('div');
      modalContent.style.cssText = `
        background: #fff;
        border-radius: 20px;
        padding: 40px;
        max-width: 420px;
        width: 90%;
        text-align: center;
        color: #1d1d1f;
        position: relative;
        box-shadow: 0 25px 80px rgba(0, 0, 0, 0.15);
        border: 1px solid rgba(0, 0, 0, 0.05);
        animation: slideUp 0.3s ease-out;
      `;

      // Use the Apple image from assets folder
      // For web platform, we need to handle assets differently
      let appleLogoUrl: string;
      
      if (Platform.OS === 'web') {
        // For web, use a data URL or fallback to emoji
        appleLogoUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMTgiIGZpbGw9IiMwMDAwMDAiLz4KPHBhdGggZD0iTTE0IDI2YzAtMiAyLTMgNC0zIDIgMCA0IDEgNCAzIDAtMi0yLTMtNC0zcy00IDEgNCAzWiIgZmlsbD0iI2ZmZmZmZiIvPgo8L3N2Zz4K';
      } else {
        appleLogoUrl = require('../../assets/images/apple.png');
      }

      modalContent.innerHTML = `
        <div style="margin-bottom: 32px;">
          <div style="
            width: 80px; 
            height: 80px; 
            background: linear-gradient(135deg, #f5f5f7 0%, #e8e8ed 100%); 
            border: 2px solid #e0e0e0; 
            border-radius: 20px; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            margin: 0 auto 24px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
          ">
            <img src="${appleLogoUrl}" style="width: 40px; height: 40px; object-fit: contain;" alt="Apple" />
          </div>
          <h2 style="
            margin: 0; 
            font-size: 28px; 
            font-weight: 700; 
            margin-bottom: 8px; 
            color: #1d1d1f;
          ">Sign in with Apple</h2>
          <p style="
            margin: 0; 
            font-size: 16px; 
            color: #86868b; 
            line-height: 1.4;
          ">Enter your Apple ID credentials to continue</p>
        </div>
        
        <div style="margin-bottom: 24px;">
          <div style="margin-bottom: 16px;">
            <input type="email" placeholder="Apple ID" style="
              width: 100%; 
              padding: 16px; 
              border: 2px solid #e0e0e0; 
              border-radius: 12px; 
              font-size: 16px; 
              background: #f5f5f7;
              color: #1d1d1f;
              outline: none;
              transition: border-color 0.2s ease;
              box-sizing: border-box;
            " onfocus="this.style.borderColor='#007AFF'" onblur="this.style.borderColor='#e0e0e0'" />
          </div>
          <div>
            <input type="password" placeholder="Password" style="
              width: 100%; 
              padding: 16px; 
              border: 2px solid #e0e0e0; 
              border-radius: 12px; 
              font-size: 16px; 
              background: #f5f5f7;
              color: #1d1d1f;
              outline: none;
              transition: border-color 0.2s ease;
              box-sizing: border-box;
            " onfocus="this.style.borderColor='#007AFF'" onblur="this.style.borderColor='#e0e0e0'" />
          </div>
        </div>
        
        <div style="display: flex; gap: 12px;">
          <button style="
            flex: 1; 
            padding: 16px; 
            border: 2px solid #e0e0e0; 
            border-radius: 12px; 
            background: #fff; 
            color: #1d1d1f; 
            font-size: 16px; 
            font-weight: 600; 
            cursor: pointer; 
            transition: all 0.2s ease;
          " onmouseover="this.style.backgroundColor='#f5f5f7'" onmouseout="this.style.backgroundColor='#fff'">Cancel</button>
          <button style="
            flex: 1; 
            padding: 16px; 
            border: none; 
            border-radius: 12px; 
            background: #007AFF; 
            color: #fff; 
            font-size: 16px; 
            font-weight: 600; 
            cursor: pointer; 
            transition: all 0.2s ease;
          " onmouseover="this.style.backgroundColor='#0056CC'" onmouseout="this.style.backgroundColor='#007AFF'">Sign In</button>
        </div>
      `;

      // Add CSS animations
      const style = document.createElement('style');
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0; 
            transform: translateY(30px) scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
      `;
      document.head.appendChild(style);

      modal.appendChild(modalContent);
      document.body.appendChild(modal);

      // Handle button clicks
      const cancelBtn = modalContent.querySelector('button:first-child');
      const signInBtn = modalContent.querySelector('button:last-child');

      cancelBtn?.addEventListener('click', () => {
        document.body.removeChild(modal);
        document.head.removeChild(style);
        reject(new Error('User cancelled Apple sign-in'));
      });

      signInBtn?.addEventListener('click', () => {
        document.body.removeChild(modal);
        document.head.removeChild(style);
        resolve();
      });

      // Handle backdrop click
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          document.body.removeChild(modal);
          document.head.removeChild(style);
          reject(new Error('User cancelled Apple sign-in'));
        }
      });
    });
  }

  private async showSuccessModal(provider: string): Promise<void> {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(8px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        animation: fadeIn 0.3s ease-out;
      `;

      const modalContent = document.createElement('div');
      modalContent.style.cssText = `
        background: #fff;
        border-radius: 20px;
        padding: 40px;
        max-width: 400px;
        width: 90%;
        text-align: center;
        color: #1d1d1f;
        position: relative;
        box-shadow: 0 25px 80px rgba(0, 0, 0, 0.15);
        border: 1px solid rgba(0, 0, 0, 0.05);
        animation: slideUp 0.3s ease-out;
      `;

      modalContent.innerHTML = `
        <div style="margin-bottom: 24px;">
          <div style="
            width: 60px; 
            height: 60px; 
            background: linear-gradient(135deg, #34C759 0%, #30D158 100%); 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            margin: 0 auto 16px;
            box-shadow: 0 8px 24px rgba(52, 199, 89, 0.3);
          ">
            <div style="
              width: 24px; 
              height: 24px; 
              background: #fff; 
              border-radius: 50%; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              font-size: 16px; 
              color: #34C759;
              font-weight: bold;
            ">✓</div>
            </div>
          <h2 style="
            margin: 0; 
            font-size: 24px; 
            font-weight: 700; 
            margin-bottom: 8px; 
            color: #1d1d1f;
          ">Success!</h2>
          <p style="
            margin: 0; 
            font-size: 16px; 
            color: #86868b; 
            line-height: 1.4;
          ">Signed in with ${provider} successfully</p>
        </div>
        
        <button style="
          width: 100%;
          padding: 16px; 
          border: none; 
          border-radius: 12px; 
          background: #007AFF;
          color: #fff; 
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        " onmouseover="this.style.backgroundColor='#0056CC'" onmouseout="this.style.backgroundColor='#007AFF'">Continue</button>
      `;

      // Add CSS animations
      const style = document.createElement('style');
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0; 
            transform: translateY(30px) scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
      `;
      document.head.appendChild(style);

      modal.appendChild(modalContent);
      document.body.appendChild(modal);

      // Handle button click
      const continueBtn = modalContent.querySelector('button');
      continueBtn?.addEventListener('click', () => {
        document.body.removeChild(modal);
        document.head.removeChild(style);
        resolve();
      });

      // Auto close after 3 seconds
      setTimeout(() => {
        if (document.body.contains(modal)) {
          document.body.removeChild(modal);
          document.head.removeChild(style);
          resolve();
        }
      }, 3000);
    });
  }

  private async storeUserData(user: WebOAuthUser, token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('web_oauth_user', JSON.stringify(user));
      await AsyncStorage.setItem('web_oauth_token', token);
      console.log('✅ User data stored successfully');
    } catch (error) {
      console.error('❌ Error storing user data:', error);
    }
  }

  async getUserData(): Promise<WebOAuthUser | null> {
    try {
      const userData = await AsyncStorage.getItem('web_oauth_user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('❌ Error retrieving user data:', error);
      return null;
    }
  }

  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('web_oauth_token');
    } catch (error) {
      console.error('❌ Error retrieving token:', error);
      return null;
    }
  }

  async signOut(): Promise<void> {
    try {
      await AsyncStorage.removeItem('web_oauth_user');
      await AsyncStorage.removeItem('web_oauth_token');
      console.log('✅ User signed out successfully');
    } catch (error) {
      console.error('❌ Error signing out:', error);
    }
  }
}

export default new WebOAuthService();