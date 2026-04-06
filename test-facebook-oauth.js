const { facebookSignInService } = require('./app/utils/facebookSignInService');

console.log('🧪 Testing Facebook OAuth Implementation...\n');

async function testFacebookOAuth() {
  try {
    console.log('1️⃣ Testing Facebook Sign-In Service initialization...');
    
    // Test if the service is properly initialized
    if (facebookSignInService) {
      console.log('✅ Facebook Sign-In Service initialized successfully');
    } else {
      console.log('❌ Facebook Sign-In Service failed to initialize');
      return;
    }

    console.log('\n2️⃣ Testing Facebook Sign-In method...');
    
    // Test the sign-in method (this will show the Facebook login dialog)
    console.log('📱 Attempting Facebook Sign-In...');
    console.log('⚠️  Note: This will open Facebook login dialog on mobile devices');
    
    const result = await facebookSignInService.signIn();
    
    if (result.success) {
      console.log('✅ Facebook Sign-In successful!');
      console.log('👤 User data:', JSON.stringify(result.user, null, 2));
    } else {
      console.log('❌ Facebook Sign-In failed:', result.error);
    }

    console.log('\n3️⃣ Testing Facebook Sign-Out...');
    
    const signOutResult = await facebookSignInService.signOut();
    if (signOutResult) {
      console.log('✅ Facebook Sign-Out successful');
    } else {
      console.log('❌ Facebook Sign-Out failed');
    }

    console.log('\n4️⃣ Testing Facebook Sign-In Status...');
    
    const isSignedIn = await facebookSignInService.isSignedIn();
    console.log('🔍 User signed in:', isSignedIn);

    console.log('\n🎉 Facebook OAuth test completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testFacebookOAuth();
