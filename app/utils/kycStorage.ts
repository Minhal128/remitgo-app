import AsyncStorage from '@react-native-async-storage/async-storage';

interface KYCVerificationCache {
  isKYCVerified: boolean;
  kycStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  verifiedAt?: string;
  lastChecked: string;
  userId: string;
}

const KYC_CACHE_KEY = 'kyc_verification_cache';
const KYC_CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export class KYCStorage {
  /**
   * Save KYC verification status to local cache
   */
  static async saveKYCStatus(userId: string, isKYCVerified: boolean, kycStatus: 'unverified' | 'pending' | 'verified' | 'rejected', verifiedAt?: string): Promise<void> {
    try {
      const cacheData: KYCVerificationCache = {
        isKYCVerified,
        kycStatus,
        verifiedAt,
        lastChecked: new Date().toISOString(),
        userId
      };
      
      await AsyncStorage.setItem(KYC_CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      // Failed to save KYC status to cache
    }
  }

  /**
   * Get KYC verification status from local cache
   */
  static async getKYCStatus(userId: string): Promise<KYCVerificationCache | null> {
    try {
      const cacheDataString = await AsyncStorage.getItem(KYC_CACHE_KEY);
      if (!cacheDataString) {
        return null;
      }

      const cacheData: KYCVerificationCache = JSON.parse(cacheDataString);
      
      // Check if cache is for the same user
      if (cacheData.userId !== userId) {
        await this.clearKYCCache();
        return null;
      }

      // Check if cache is expired
      const lastChecked = new Date(cacheData.lastChecked).getTime();
      const now = new Date().getTime();
      if (now - lastChecked > KYC_CACHE_EXPIRY) {
        await this.clearKYCCache();
        return null;
      }

      return cacheData;
    } catch (error) {
      // Failed to get KYC status from cache
      return null;
    }
  }

  /**
   * Check if user is KYC verified (quick check from cache)
   */
  static async isKYCVerified(userId: string): Promise<boolean> {
    const cacheData = await this.getKYCStatus(userId);
    return cacheData?.isKYCVerified === true && cacheData?.kycStatus === 'verified';
  }

  /**
   * Clear KYC cache
   */
  static async clearKYCCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(KYC_CACHE_KEY);
    } catch (error) {
      // Failed to clear KYC cache
    }
  }

  /**
   * Update cache with fresh data from server
   */
  static async refreshKYCStatus(userId: string): Promise<KYCVerificationCache | null> {
    try {
      const response = await fetch('/api/kyc/status', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const isVerified = data.kycStatus === 'verified';
        
        await this.saveKYCStatus(
          userId, 
          isVerified, 
          data.kycStatus, 
          data.verifiedAt
        );

        return await this.getKYCStatus(userId);
      }
      
      return null;
    } catch (error) {
      // Failed to refresh KYC status
      return null;
    }
  }

  /**
   * Check if KYC verification should be shown (only for new users who haven't completed KYC)
   */
  static async shouldShowKYC(userId: string, isNewUser: boolean = false): Promise<boolean> {
    const cacheData = await this.getKYCStatus(userId);
    
    // If user is already verified, never show KYC
    if (cacheData?.isKYCVerified === true && cacheData?.kycStatus === 'verified') {
      return false;
    }

    // For new users (just signed up), show KYC if not verified
    if (isNewUser) {
      return true;
    }

    // For existing users (signing in), don't show KYC - they go straight to main app
    return false;
  }

  /**
   * Mark that user has completed KYC flow (successful or failed)
   */
  static async markKYCCompleted(userId: string, success: boolean, kycStatus: 'verified' | 'rejected', verifiedAt?: string): Promise<void> {
    await this.saveKYCStatus(userId, success, kycStatus, verifiedAt);
    
    // Additionally, save a special flag indicating KYC was completed at least once
    // This helps ensure we never prompt for KYC again after the initial completion
    if (success && kycStatus === 'verified') {
      await AsyncStorage.setItem('kyc_ever_completed', 'true');
    }
  }
  
  /**
   * Check if user should ever be shown KYC screen (regardless of cached status)
   * This provides a strong guarantee that verified users never see KYC again
   */
  static async hasEverCompletedKYC(): Promise<boolean> {
    try {
      const completed = await AsyncStorage.getItem('kyc_ever_completed');
      return completed === 'true';
    } catch (error) {
      // Failed to check if KYC was ever completed
      return false;
    }
  }
}

// Default export to prevent Expo Router from treating this as a route
export default KYCStorage;
