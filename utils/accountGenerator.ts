// Account and IBAN Generator Utility
// Generates unique account numbers and IBANs for each user

export interface AccountDetails {
  accountNumber: string;
  iban: string;
  bankCode: string;
  branchCode: string;
}

/**
 * Generates a unique account number based on user ID and timestamp
 * @param userId - Unique identifier for the user
 * @returns 11-digit account number
 */
export const generateAccountNumber = (userId: string): string => {
  // Create a hash from userId to ensure consistency
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Use absolute value and ensure it's positive
  const positiveHash = Math.abs(hash);
  
  // Generate a 11-digit number
  // Format: 033 + 8 digits (033 is RemitGo's bank code)
  const baseNumber = positiveHash % 100000000; // 8 digits
  const accountNumber = `033${baseNumber.toString().padStart(8, '0')}`;
  
  return accountNumber;
};

/**
 * Generates a unique IBAN based on account number
 * @param accountNumber - The account number to generate IBAN for
 * @returns IBAN in format PK62 SADA XXXX XXXX XXXX XXXX
 */
export const generateIBAN = (accountNumber: string): string => {
  // Remove the bank code (033) from account number
  const accountPart = accountNumber.substring(3);
  
  // Generate a unique identifier based on account number
  let hash = 0;
  for (let i = 0; i < accountPart.length; i++) {
    const char = accountPart.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const positiveHash = Math.abs(hash);
  
  // Format: PK62 RMEIT XXXX XXXX XXXX XXXX
  // Where XXXX are unique identifiers
  const part1 = (positiveHash % 10000).toString().padStart(4, '0');
  const part2 = ((positiveHash >> 4) % 10000).toString().padStart(4, '0');
  const part3 = ((positiveHash >> 8) % 10000).toString().padStart(4, '0');
  const part4 = ((positiveHash >> 12) % 10000).toString().padStart(4, '0');
  
  return `RG25 RMEIT ${part1} ${part2} ${part3} ${part4}`;
};

/**
 * Generates complete account details for a user
 * @param userId - Unique identifier for the user
 * @returns Complete account details including account number and IBAN
 */
export const generateAccountDetails = (userId: string): AccountDetails => {
  const accountNumber = generateAccountNumber(userId);
  const iban = generateIBAN(accountNumber);
  
  return {
    accountNumber,
    iban,
    bankCode: 'RMEIT',
    branchCode: '0000'
  };
};

/**
 * Validates if an IBAN format is correct
 * @param iban - IBAN to validate
 * @returns boolean indicating if IBAN is valid
 */
export const validateIBAN = (iban: string): boolean => {
  // Basic IBAN validation for Pakistan
  const ibanRegex = /^PK62\sRMEIT\s\d{4}\s\d{4}\s\d{4}\s\d{4}$/;
  return ibanRegex.test(iban);
};

/**
 * Formats IBAN for display with proper spacing
 * @param iban - Raw IBAN string
 * @returns Formatted IBAN with proper spacing
 */
export const formatIBAN = (iban: string): string => {
  // Remove all spaces and format properly
  const cleanIban = iban.replace(/\s/g, '');
  if (cleanIban.length !== 28) return iban; // Invalid length
  
  return `${cleanIban.substring(0, 4)} ${cleanIban.substring(4, 8)} ${cleanIban.substring(8, 12)} ${cleanIban.substring(12, 16)} ${cleanIban.substring(16, 20)} ${cleanIban.substring(20, 24)} ${cleanIban.substring(24, 28)}`;
};

/**
 * Generates a unique identifier for the user based on their data
 * This ensures the same user always gets the same account details
 * @param userData - User information (email, phone, etc.)
 * @returns Unique user identifier
 */
export const generateUserId = (userData: {
  email?: string;
  phone?: string;
  name?: string;
  id?: string;
}): string => {
  // Use existing ID if available
  if (userData.id) return userData.id;
  
  // Create a unique identifier from available data
  const identifier = userData.email || userData.phone || userData.name || 'default';
  
  // Create a hash
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    const char = identifier.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return `user_${Math.abs(hash)}`;
};
