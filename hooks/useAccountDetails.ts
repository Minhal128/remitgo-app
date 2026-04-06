import { useState, useEffect, useMemo } from 'react';
import { generateAccountDetails, generateUserId, AccountDetails } from '../utils/accountGenerator';

interface UserData {
  id?: string;
  email?: string;
  phone?: string;
  name?: string;
}

interface UseAccountDetailsReturn {
  accountDetails: AccountDetails | null;
  isLoading: boolean;
  error: string | null;
  refreshAccountDetails: () => void;
}

/**
 * Custom hook to manage user account details
 * Generates unique account number and IBAN for each user
 */
export const useAccountDetails = (userData: UserData): UseAccountDetailsReturn => {
  const [accountDetails, setAccountDetails] = useState<AccountDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate a unique user ID based on user data
  const userId = useMemo(() => {
    return generateUserId(userData);
  }, [userData]);

  // Generate account details
  const generateDetails = useMemo(() => {
    try {
      return generateAccountDetails(userId);
    } catch (err) {
      console.error('Error generating account details:', err);
      return null;
    }
  }, [userId]);

  // Load account details
  useEffect(() => {
    const loadAccountDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Simulate API call delay (in real app, this would fetch from backend)
        await new Promise(resolve => setTimeout(resolve, 500));

        if (generateDetails) {
          setAccountDetails(generateDetails);
        } else {
          throw new Error('Failed to generate account details');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        console.error('Error loading account details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAccountDetails();
  }, [generateDetails]);

  // Function to refresh account details
  const refreshAccountDetails = () => {
    if (generateDetails) {
      setAccountDetails(generateDetails);
    }
  };

  return {
    accountDetails,
    isLoading,
    error,
    refreshAccountDetails
  };
};

/**
 * Hook to get account details for a specific user
 * This ensures the same user always gets the same account details
 */
export const useUserAccountDetails = (userData: UserData) => {
  const { accountDetails, isLoading, error, refreshAccountDetails } = useAccountDetails(userData);

  // Memoize the account details to prevent unnecessary re-renders
  const memoizedDetails = useMemo(() => {
    if (!accountDetails) return null;

    return {
      ...accountDetails,
      // Format the IBAN for display
      formattedIban: accountDetails.iban,
      // Add additional computed properties
      shortAccountNumber: `${accountDetails.accountNumber.substring(0, 4)}...${accountDetails.accountNumber.substring(7)}`,
      bankInfo: {
        name: 'RemitGo',
        code: accountDetails.bankCode,
        country: 'Pakistan'
      }
    };
  }, [accountDetails]);

  return {
    accountDetails: memoizedDetails,
    isLoading,
    error,
    refreshAccountDetails,
    // Additional utility functions
    copyToClipboard: (text: string) => {
      // In a real app, you would use Clipboard API here
      console.log('Copied to clipboard:', text);
      return true;
    }
  };
};
