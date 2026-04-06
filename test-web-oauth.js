const { webOAuthService } = require('./app/utils/webOAuthService');

console.log('🧪 Testing Web OAuth Implementation...\n');

async function testWebOAuth() {
  try {
    console.log('1️⃣ Testing Web OAuth Service initialization...');
    
    // Test if the service is properly initialized
    if (webOAuthService) {
      console.log('✅ Web OAuth Service initialized successfully');
    } else {
      console.log('❌ Web OAuth Service failed to initialize');
      return;
    }

    console.log('\n2️⃣ Testing Web Google Sign-In...');
    
    const googleResult = await webOAuthService.signInWithGoogle();
    
    if (googleResult.success) {
      console.log('✅ Web Google Sign-In successful!');
      console.log('👤 User data:', JSON.stringify(googleResult.user, null, 2));
    } else {
      console.log('❌ Web Google Sign-In failed:', googleResult.error);
    }

    console.log('\n3️⃣ Testing Web Facebook Sign-In...');
    
    const facebookResult = await webOAuthService.signInWithFacebook();
    
    if (facebookResult.success) {
      console.log('✅ Web Facebook Sign-In successful!');
      console.log('👤 User data:', JSON.stringify(facebookResult.user, null, 2));
    } else {
      console.log('❌ Web Facebook Sign-In failed:', facebookResult.error);
    }

    console.log('\n4️⃣ Testing Web Sign-In Status...');
    
    const isSignedIn = await webOAuthService.isSignedIn();
    console.log('🔍 User signed in:', isSignedIn);

    console.log('\n5️⃣ Testing Web Sign-Out...');
    
    const signOutResult = await webOAuthService.signOut();
    if (signOutResult) {
      console.log('✅ Web Sign-Out successful');
    } else {
      console.log('❌ Web Sign-Out failed');
    }

    console.log('\n🎉 Web OAuth test completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testWebOAuth();

