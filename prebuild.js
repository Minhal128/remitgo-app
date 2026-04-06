const fs = require('fs');
const path = require('path');

// Handle google-services.json
const googleServicesJson = process.env.GOOGLE_SERVICES_JSON;
if (googleServicesJson) {
  const filePath = path.join(__dirname, 'android', 'app', 'google-services.json');
  
  // Ensure the directory exists
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(filePath, googleServicesJson);
  console.log('Created google-services.json from environment variable');
} else {
  console.log('Warning: GOOGLE_SERVICES_JSON environment variable is not set');
}

// Handle Google OAuth client IDs
const googleWebClientId = process.env.GOOGLE_WEB_CLIENT_ID;
const googleIosClientId = process.env.GOOGLE_IOS_CLIENT_ID;
const googleAndroidClientId = process.env.GOOGLE_ANDROID_CLIENT_ID;

if (googleWebClientId || googleIosClientId || googleAndroidClientId) {
  // Create or update Google OAuth config
  const oauthConfig = {
    web: googleWebClientId ? { clientId: googleWebClientId } : {},
    ios: googleIosClientId ? { 
      clientId: googleIosClientId,
      urlScheme: `com.googleusercontent.apps.${googleIosClientId.split('-')[0]}`
    } : {},
    android: googleAndroidClientId ? { 
      clientId: googleAndroidClientId,
      packageName: "com.minhal128.remitgo"
    } : {}
  };
  
  const configPath = path.join(__dirname, 'app', 'constants', 'googleOAuthConfig.json');
  const configDir = path.dirname(configPath);
  
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  fs.writeFileSync(configPath, JSON.stringify(oauthConfig, null, 2));
  console.log('Created Google OAuth configuration file');
} else {
  console.log('Warning: Google OAuth client IDs not set');
}
