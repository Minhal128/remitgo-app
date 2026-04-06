// Backend OAuth Handler for RemitGo
// This handles Google and Facebook OAuth callbacks

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// OAuth Configuration
const OAUTH_CONFIG = {
  GOOGLE: {
    CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
    CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
    TOKEN_URL: 'https://oauth2.googleapis.com/token',
    USER_INFO_URL: 'https://www.googleapis.com/oauth2/v2/userinfo',
    REDIRECT_URI: 'https://remitgobackend.vercel.app/'
  },
  FACEBOOK: {
    CLIENT_ID: process.env.FACEBOOK_CLIENT_ID || '',
    CLIENT_SECRET: process.env.FACEBOOK_CLIENT_SECRET || '',
    TOKEN_URL: 'https://graph.facebook.com/v18.0/oauth/access_token',
    USER_INFO_URL: 'https://graph.facebook.com/v18.0/me',
    REDIRECT_URI: 'https://remitgobackend.vercel.app/'
  }
};

// Google OAuth Callback Handler
app.get('/auth/google/callback', async (req, res) => {
  try {
    console.log('🔐 Google OAuth callback received');
    console.log('📋 Query parameters:', req.query);
    
    const { code, error, state } = req.query;
    
    if (error) {
      console.error('❌ Google OAuth error:', error);
      return res.status(400).json({ 
        success: false, 
        error: 'OAuth authorization failed', 
        details: error 
      });
    }
    
    if (!code) {
      console.error('❌ No authorization code received');
      return res.status(400).json({ 
        success: false, 
        error: 'No authorization code received' 
      });
    }
    
    console.log('✅ Authorization code received:', code.substring(0, 20) + '...');
    
    // Exchange authorization code for access token
    const tokenResponse = await axios.post(OAUTH_CONFIG.GOOGLE.TOKEN_URL, {
      client_id: OAUTH_CONFIG.GOOGLE.CLIENT_ID,
      client_secret: OAUTH_CONFIG.GOOGLE.CLIENT_SECRET,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: OAUTH_CONFIG.GOOGLE.REDIRECT_URI
    });
    
    console.log('🔑 Access token received');
    
    const { access_token, id_token, refresh_token } = tokenResponse.data;
    
    // Get user information from Google
    const userInfoResponse = await axios.get(OAUTH_CONFIG.GOOGLE.USER_INFO_URL, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });
    
    const userInfo = userInfoResponse.data;
    console.log('👤 User info received:', {
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name
    });
    
    // Create or authenticate user in your system
    const user = await createOrAuthenticateUser({
      provider: 'google',
      googleId: userInfo.id,
      email: userInfo.email,
      firstName: userInfo.given_name,
      lastName: userInfo.family_name,
      profilePicture: userInfo.picture,
      accessToken: access_token,
      idToken: id_token
    });
    
    console.log('✅ User authenticated successfully');
    
    // Return success response
    res.json({
      success: true,
      message: 'Google OAuth successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
        socialProvider: 'google',
        kycStatus: user.kycStatus || 'unverified'
      },
      token: user.token,
      oauthData: {
        accessToken: access_token,
        idToken: id_token,
        refreshToken: refresh_token
      }
    });
    
  } catch (error) {
    console.error('❌ Google OAuth callback error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process Google OAuth callback',
      details: error.message
    });
  }
});

// Facebook OAuth Callback Handler
app.get('/auth/facebook/callback', async (req, res) => {
  try {
    console.log('🔐 Facebook OAuth callback received');
    console.log('📋 Query parameters:', req.query);
    
    const { code, error, state } = req.query;
    
    if (error) {
      console.error('❌ Facebook OAuth error:', error);
      return res.status(400).json({ 
        success: false, 
        error: 'OAuth authorization failed', 
        details: error 
      });
    }
    
    if (!code) {
      console.error('❌ No authorization code received');
      return res.status(400).json({ 
        success: false, 
        error: 'No authorization code received' 
      });
    }
    
    console.log('✅ Authorization code received:', code.substring(0, 20) + '...');
    
    // Exchange authorization code for access token
    const tokenResponse = await axios.post(OAUTH_CONFIG.FACEBOOK.TOKEN_URL, {
      client_id: OAUTH_CONFIG.FACEBOOK.CLIENT_ID,
      client_secret: OAUTH_CONFIG.FACEBOOK.CLIENT_SECRET,
      code: code,
      redirect_uri: OAUTH_CONFIG.FACEBOOK.REDIRECT_URI
    });
    
    console.log('🔑 Access token received');
    
    const { access_token } = tokenResponse.data;
    
    // Get user information from Facebook
    const userInfoResponse = await axios.get(OAUTH_CONFIG.FACEBOOK.USER_INFO_URL, {
      params: {
        fields: 'id,name,email,first_name,last_name,picture',
        access_token: access_token
      }
    });
    
    const userInfo = userInfoResponse.data;
    console.log('👤 User info received:', {
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name
    });
    
    // Create or authenticate user in your system
    const user = await createOrAuthenticateUser({
      provider: 'facebook',
      facebookId: userInfo.id,
      email: userInfo.email,
      firstName: userInfo.first_name,
      lastName: userInfo.last_name,
      profilePicture: userInfo.picture?.data?.url,
      accessToken: access_token
    });
    
    console.log('✅ User authenticated successfully');
    
    // Return success response
    res.json({
      success: true,
      message: 'Facebook OAuth successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
        socialProvider: 'facebook',
        kycStatus: user.kycStatus || 'unverified'
      },
      token: user.token,
      oauthData: {
        accessToken: access_token
      }
    });
    
  } catch (error) {
    console.error('❌ Facebook OAuth callback error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process Facebook OAuth callback',
      details: error.message
    });
  }
});

// User creation/authentication function
async function createOrAuthenticateUser(oauthData) {
  try {
    console.log('🔄 Creating/authenticating user:', {
      provider: oauthData.provider,
      email: oauthData.email
    });
    
    // This is where you would typically:
    // 1. Check if user exists in your database
    // 2. Create new user if they don't exist
    // 3. Update existing user's OAuth tokens
    // 4. Generate a JWT token for your app
    
    // For now, we'll create a mock user response
    // Replace this with your actual database logic
    
    const mockUser = {
      id: `user_${Date.now()}`,
      email: oauthData.email,
      firstName: oauthData.firstName,
      lastName: oauthData.lastName,
      profilePicture: oauthData.profilePicture,
      socialProvider: oauthData.provider,
      kycStatus: 'unverified',
      token: `jwt_token_${Date.now()}`,
      createdAt: new Date().toISOString(),
      oauthData: {
        [oauthData.provider]: {
          id: oauthData[`${oauthData.provider}Id`],
          accessToken: oauthData.accessToken,
          lastUpdated: new Date().toISOString()
        }
      }
    };
    
    console.log('✅ User processed:', mockUser.id);
    return mockUser;
    
  } catch (error) {
    console.error('❌ Error creating/authenticating user:', error);
    throw error;
  }
}

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: "RemitGo API is running!",
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    database: "disconnected",
    oauth: {
      google: "configured",
      facebook: "configured",
      endpoints: [
        "/auth/google/callback",
        "/auth/facebook/callback"
      ]
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: error.message
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 RemitGo OAuth Server running on port ${PORT}`);
  console.log(`🔐 OAuth endpoints:`);
  console.log(`   Google: http://localhost:${PORT}/auth/google/callback`);
  console.log(`   Facebook: http://localhost:${PORT}/auth/facebook/callback`);
  console.log(`   Health: http://localhost:${PORT}/`);
});

module.exports = app;

