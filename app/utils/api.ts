import { API_BASE_URL } from '../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { debugToken, clearAuthData } from './tokenDebug';

interface TokenValidationError {
  isTokenError: boolean;
  shouldClearAuth: boolean;
}

function parseTokenError(errorText: string): TokenValidationError {
  try {
    const parsed = JSON.parse(errorText);
    const message = parsed.message || '';
    const isInvalidToken = message.includes('Invalid token') || message.includes('invalid signature');
    const isExpiredToken = message.includes('expired') || message.includes('jwt expired');
    
    return {
      isTokenError: isInvalidToken || isExpiredToken,
      shouldClearAuth: isInvalidToken || isExpiredToken
    };
  } catch {
    return {
      isTokenError: false,
      shouldClearAuth: false
    };
  }
}

// Create a timeout promise that works across all React Native versions
function createTimeoutPromise(timeoutMs: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Request timeout'));
    }, timeoutMs);
  });
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const maxRetries = 3;
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const token = await AsyncStorage.getItem('token');
      const headers: Record<string, string> = { 
        'Content-Type': 'application/json', 
        ...(options.headers as Record<string, string> || {}) 
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      console.log(`API Request (attempt ${attempt}/${maxRetries}):`, {
        url: `${API_BASE_URL}${endpoint}`,
        method: options.method || 'GET',
        headers: {
          ...headers,
          Authorization: token ? `Bearer ${token.substring(0, 20)}...` : 'None'
        },
        body: options.body ? 'Present' : 'None'
      });
      
      // Create a timeout promise and race it with the fetch
      const timeoutPromise = createTimeoutPromise(60000); // 60 second timeout for KYC processing
      const fetchPromise = fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        mode: 'cors',
        credentials: 'omit'
      });
      
      // Race the fetch against the timeout
      const res = await Promise.race([fetchPromise, timeoutPromise]);
      
      console.log('API Response:', {
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries())
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('API Error Response:', errorText);
        
        // Handle token-related errors
        if (res.status === 401) {
          const tokenError = parseTokenError(errorText);
          
          if (tokenError.isTokenError) {
            console.log('Invalid token detected, debugging...');
            await debugToken();
            
            if (tokenError.shouldClearAuth) {
              console.log('Clearing auth data due to invalid token');
              await clearAuthData();
            }
          }
        }
        
        throw new Error(errorText);
      }
      
      // Try to parse JSON response, but handle non-JSON responses gracefully
      try {
        const responseText = await res.text();
        console.log('Raw response text:', responseText);
        
        if (!responseText || responseText.trim() === '') {
          console.log('Empty response, returning success object');
          return { success: true, message: 'Operation completed successfully' };
        }
        
        const jsonResponse = JSON.parse(responseText);
        console.log('Parsed JSON response:', jsonResponse);
        return jsonResponse;
      } catch (parseError) {
        console.log('Response is not valid JSON, treating as success:', parseError);
        // If response is not JSON but status is 200, treat as success
        return { success: true, message: 'Operation completed successfully' };
      }
    } catch (error) {
      lastError = error as Error;
      console.error(`API Fetch Error (attempt ${attempt}/${maxRetries}):`, error);
      
      // Don't retry on 4xx errors (client errors)
      if (error instanceof Error && (error.message.includes('401') || error.message.includes('400'))) {
        throw error;
      }
      
      // Don't retry on timeout errors for KYC endpoints (they take longer)
      if (error instanceof Error && error.message.includes('timeout') && endpoint.includes('kyc')) {
        console.log('KYC endpoint timeout - this is normal for large image processing');
        throw error;
      }
      
      // If this is the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error('API request failed after all retries');
}

// Default export to prevent Expo Router from treating this as a route
export default function ApiUtils() {
  return null;
}
