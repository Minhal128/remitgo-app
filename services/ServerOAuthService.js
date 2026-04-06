// Enhanced Server-Side OAuth Service for RemitGo
// This handles Google Sign-In through your backend server

import { Linking } from "react-native";
import * as WebBrowser from "expo-web-browser";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BACKEND_URL = "https://remitgobackend.vercel.app"; // Your backend URL

export class ServerOAuthService {
  /**
   * Initiate Google Sign-In through server-side OAuth
   */
  static async signInWithGoogle() {
    try {
      console.log("🔐 Starting server-side Google OAuth...");

      const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '';
      const REDIRECT_URI =
        "https://remitgobackend.vercel.app/auth/google/callback";

      const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      authUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID);
      authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
      authUrl.searchParams.set("scope", "openid email profile");
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("access_type", "offline");
      authUrl.searchParams.set("prompt", "consent");
      const state = { isMobile: true, timestamp: Date.now() };
      authUrl.searchParams.set(
        "state",
        btoa(JSON.stringify(state)),
      );

      console.log("📋 Google OAuth URL:", authUrl.toString());

      // Create a promise that resolves when we get the deep link
      let deepLinkResolver;
      const deepLinkPromise = new Promise((resolve) => {
        deepLinkResolver = resolve;
      });

      // Set up deep link listener BEFORE opening browser
      const handleUrl = (event) => {
        console.log("🔗 Deep link received:", event.url);
        
        if (event.url && event.url.includes('oauth2callback')) {
          console.log("✅ OAuth callback detected in deep link");
          
          // Resolve with the URL
          deepLinkResolver(event.url);
          
          // Dismiss the browser after a tiny delay to ensure the URL is captured
          setTimeout(() => {
            console.log("🚪 Dismissing browser...");
            WebBrowser.dismissBrowser();
          }, 100);
        }
      };

      // Add listener
      const subscription = Linking.addEventListener('url', handleUrl);
      
      // Also check if there's a URL that opened the app (initial URL)
      Linking.getInitialURL().then(url => {
        if (url && url.includes('oauth2callback')) {
          console.log("🔗 Found initial URL:", url);
          handleUrl({ url });
        }
      });

      try {
        console.log("🌐 Opening browser for OAuth...");
        
        // Open OAuth in browser (don't await - let it run in background)
        const browserPromise = WebBrowser.openAuthSessionAsync(
          authUrl.toString(),
          "com.minhal128.remitgo://oauth2callback",
        ).then(result => {
          console.log("🌐 Browser returned:", result.type, result.url ? 'with URL' : 'no URL');
          return result;
        });

        // Race between browser result and deep link
        const raceResult = await Promise.race([
          browserPromise,
          deepLinkPromise,
          // Timeout after 60 seconds
          new Promise((_, reject) => 
            setTimeout(() => {
              console.log("⏱️ OAuth timeout after 60 seconds");
              reject(new Error('OAuth timeout - please try again'));
            }, 60000)
          ),
        ]);

        console.log("🏁 Race result:", typeof raceResult === 'string' ? 'Deep link URL' : 'Browser result');

        // Remove listener
        subscription.remove();

        // Handle the result
        let callbackUrl;
        
        if (typeof raceResult === 'string') {
          // We got the deep link URL
          callbackUrl = raceResult;
          console.log("✅ Using deep link URL");
        } else if (raceResult && raceResult.url) {
          // We got browser result with URL
          callbackUrl = raceResult.url;
          console.log("✅ Using browser result URL");
        } else if (raceResult && raceResult.type === 'cancel') {
          console.log("❌ User canceled");
          return {
            success: false,
            error: "Authentication was canceled",
            cancelled: true,
          };
        }

        if (callbackUrl) {
          console.log("📦 Processing callback URL:", callbackUrl);
          const callbackData = this.parseOAuthCallback(callbackUrl);
          console.log("📊 Parsed data:", { success: callbackData.success, hasToken: !!callbackData.token });
          
          if (callbackData.success && callbackData.token) {
            await AsyncStorage.setItem("userToken", callbackData.token);
            await AsyncStorage.setItem("userData", JSON.stringify(callbackData.user));
            
            console.log("✅ OAuth successful, returning user data");
            return {
              success: true,
              user: callbackData.user,
              token: callbackData.token,
            };
          } else {
            throw new Error(callbackData.error || "Failed to parse callback data");
          }
        }

        throw new Error("No callback URL received");

      } catch (error) {
        subscription.remove();
        throw error;
      }
    } catch (error) {
      console.error("❌ OAuth Error:", error);
      return {
        success: false,
        error: error.message || "Authentication failed",
      };
    }
  }

  /**
   * Parse OAuth callback URL
   */
  static parseOAuthCallback(url) {
    console.log("🔄 Parsing OAuth callback:", url);

    try {
      let urlParams;

      // Handle different URL formats
      if (url.includes("?")) {
        const queryString = url.split("?")[1];
        urlParams = new URLSearchParams(queryString);
      } else if (url.includes("#")) {
        const hashString = url.split("#")[1];
        urlParams = new URLSearchParams(hashString);
      } else {
        throw new Error("Invalid callback URL format");
      }

      // Check for direct success/error parameters (new flow)
      const success = urlParams.get("success");
      if (success === "true") {
        return {
          success: true,
          token: urlParams.get("token"),
          user: {
            id: urlParams.get("userId"),
            email: urlParams.get("email"),
            name: urlParams.get("name"),
          },
        };
      } else if (success === "false") {
        return {
          success: false,
          error: urlParams.get("error") || "Authentication failed",
          details: urlParams.get("details"),
        };
      }

      // Legacy flow: look for authorization code
      const code = urlParams.get("code");
      const error = urlParams.get("error");

      if (error) {
        console.error("❌ OAuth error from callback:", error);
        return {
          success: false,
          error: error,
          errorDescription: urlParams.get("error_description"),
        };
      }

      if (code) {
        console.log("✅ Authorization code received:", code);
        return {
          success: true,
          code,
          state: urlParams.get("state"),
        };
      }

      return {
        success: false,
        error: "No valid authentication data in callback",
      };
    } catch (err) {
      console.error("❌ Error parsing OAuth callback:", err);
      return {
        success: false,
        error: err.message,
      };
    }
  }

  /**
   * Handle deep link OAuth callback (for app state restoration)
   */
  static handleDeepLinkCallback(url) {
    console.log("🔄 Handling deep link callback:", url);
    return this.parseOAuthCallback(url);
  }

  /**
   * Clear stored authentication data
   */
  static async signOut() {
    try {
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("userData");
      console.log("✅ User signed out");
    } catch (error) {
      console.error("❌ Error signing out:", error);
    }
  }

  /**
   * Get stored authentication data
   */
  static async getStoredAuth() {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const userData = await AsyncStorage.getItem("userData");

      if (token && userData) {
        return {
          token,
          user: JSON.parse(userData),
        };
      }

      return null;
    } catch (error) {
      console.error("❌ Error getting stored auth:", error);
      return null;
    }
  }

  /**
   * Initiate Facebook Sign-In through server-side OAuth
   */
  static async signInWithFacebook() {
    try {
      console.log("🔐 Starting server-side Facebook OAuth...");

      const FACEBOOK_APP_ID = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID || '';
      const REDIRECT_URI =
        "https://remitgobackend.vercel.app/auth/facebook/callback";

      const authUrl = new URL("https://www.facebook.com/v18.0/dialog/oauth");
      authUrl.searchParams.set("client_id", FACEBOOK_APP_ID);
      authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
      authUrl.searchParams.set("scope", "email,public_profile");
      authUrl.searchParams.set("response_type", "code");
      const state = { isMobile: true, timestamp: Date.now() };
      authUrl.searchParams.set(
        "state",
        btoa(JSON.stringify(state)),
      );

      console.log("📋 Facebook OAuth URL:", authUrl.toString());

      // Set up deep link listener
      const handleUrl = async (event) => {
        if (event.url.includes('oauth2callback')) {
          WebBrowser.dismissBrowser();
        }
      };

      const subscription = Linking.addEventListener('url', handleUrl);

      try {
        const result = await WebBrowser.openAuthSessionAsync(
          authUrl.toString(),
          "com.minhal128.remitgo://oauth2callback",
        );

        subscription.remove();

        if (result.url) {
          const callbackData = this.parseOAuthCallback(result.url);
          
          if (callbackData.success && callbackData.token) {
            await AsyncStorage.setItem("userToken", callbackData.token);
            await AsyncStorage.setItem("userData", JSON.stringify(callbackData.user));
            
            return {
              success: true,
              user: callbackData.user,
              token: callbackData.token,
            };
          }
        }

        const lastUrl = await AsyncStorage.getItem('lastOAuthUrl');
        if (lastUrl) {
          await AsyncStorage.removeItem('lastOAuthUrl');
          const callbackData = this.parseOAuthCallback(lastUrl);
          
          if (callbackData.success && callbackData.token) {
            await AsyncStorage.setItem("userToken", callbackData.token);
            await AsyncStorage.setItem("userData", JSON.stringify(callbackData.user));
            
            return {
              success: true,
              user: callbackData.user,
              token: callbackData.token,
            };
          }
        }

        return {
          success: false,
          error: result.type === "cancel" ? "Facebook authentication canceled" : "Facebook authentication failed",
          cancelled: result.type === "cancel",
        };
      } catch (error) {
        subscription.remove();
        throw error;
      }
    } catch (error) {
      console.error("❌ Facebook OAuth Error:", error);
      return {
        success: false,
        error: error.message || "Facebook authentication failed",
      };
    }
  }

  /**
   * Validate stored token with server
   */
  static async validateToken(token) {
    try {
      const response = await fetch(`${BACKEND_URL}/auth/validate`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.valid === true;
      }

      return false;
    } catch (error) {
      console.error("❌ Error validating token:", error);
      return false;
    }
  }
}

export default ServerOAuthService;
