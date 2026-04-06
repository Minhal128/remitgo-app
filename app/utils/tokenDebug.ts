import AsyncStorage from '@react-native-async-storage/async-storage';

export async function debugToken() {
  try {
    const token = await AsyncStorage.getItem('token');
    console.log('=== TOKEN DEBUG ===');
    console.log('Token exists:', !!token);
    console.log('Token length:', token?.length || 0);
    
    if (token) {
      console.log('Token first 50 chars:', token.substring(0, 50));
      console.log('Token last 50 chars:', token.substring(token.length - 50));
      
      // Try to decode JWT payload (without verification)
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          console.log('JWT has 3 parts: ✓');
          
          // Decode payload
          const payload = JSON.parse(atob(parts[1]));
          console.log('Full decoded payload:', payload);
          console.log('Payload analysis:', {
            id: payload.id,
            userId: payload.userId,
            email: payload.email,
            iat: payload.iat,
            exp: payload.exp,
            isExpired: payload.exp < Date.now() / 1000,
            hasId: !!payload.id,
            hasUserId: !!payload.userId
          });
        } else {
          console.log('JWT does not have 3 parts:', parts.length);
        }
      } catch (decodeError) {
        console.log('Failed to decode JWT:', decodeError);
      }
    }
    
    const user = await AsyncStorage.getItem('user');
    console.log('User data exists:', !!user);
    if (user) {
      const userData = JSON.parse(user);
      console.log('User ID:', userData.id);
      console.log('User email:', userData.email);
      console.log('KYC status:', userData.kycStatus);
    }
    console.log('==================');
    
    return { token, user: user ? JSON.parse(user) : null };
  } catch (error) {
    console.error('Debug token error:', error);
    return null;
  }
}

export async function clearAuthData() {
  try {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    console.log('Auth data cleared');
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
}

// Default export to prevent Expo Router from treating this as a route
export default function TokenDebug() {
  return null;
}
