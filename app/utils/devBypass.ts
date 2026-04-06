import AsyncStorage from '@react-native-async-storage/async-storage';

export async function createDevUser() {
  console.log('Creating development user...');
  
  // Create a mock JWT token (this is just for development UI testing)
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODllMzQzMjdkN2NjODJkNTRjMmE1Y2YiLCJlbWFpbCI6ImRldkBleGFtcGxlLmNvbSIsImlhdCI6MTY0ODc0ODQwMCwiZXhwIjoxOTY0MTA4NDAwfQ.csrDVZgyqoLuOUzpsTEbDL3O0CPoqSLRVDugQS9ZvZI';
  
  const mockUser = {
    id: '689e34327d7cc82d54c2a5cf',
    userId: '689e34327d7cc82d54c2a5cf', // Make sure we have both id and userId
    email: 'dev@example.com',
    firstName: 'Dev',
    lastName: 'User',
    kycStatus: 'not_started', // This will allow access to KYC screen
    createdAt: new Date().toISOString(),
  };
  
  await AsyncStorage.setItem('token', mockToken);
  await AsyncStorage.setItem('user', JSON.stringify(mockUser));
  
  console.log('Development user created:', mockUser);
  return { token: mockToken, user: mockUser };
}

export async function clearDevUser() {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('user');
  console.log('Development user cleared');
}

// Check if we're in development mode and should use bypass
export function shouldUseDevBypass(): boolean {
  return __DEV__ && process.env.NODE_ENV !== 'production';
}

// Default export to prevent Expo Router from treating this as a route
export default function DevBypass() {
  return null;
}
