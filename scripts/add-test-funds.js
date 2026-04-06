const { apiFetch } = require('../app/utils/api');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'https://remitgobackend.vercel.app';
const USER_TOKEN = process.env.USER_TOKEN || ''; // You'll need to set this

// Function to add $10,000 to wallet
async function addTenThousandDollars() {
  try {
    console.log('🚀 Adding $10,000 to wallet for testing...');
    
    // Make API call to add funds
    const response = await fetch(`${API_BASE_URL}/wallet/add-ten-thousand-dollars`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${USER_TOKEN}`,
      },
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Successfully added $10,000 to wallet!');
      console.log('💰 New balance:', data.wallet.balance);
      console.log('📝 Message:', data.message);
    } else {
      console.error('❌ Failed to add funds:', data.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Function to check current wallet balance
async function checkWalletBalance() {
  try {
    console.log('🔍 Checking current wallet balance...');
    
    const response = await fetch(`${API_BASE_URL}/wallet/get-by-user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${USER_TOKEN}`,
      },
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('💰 Current wallet balance:', data.balance);
      console.log('🆔 Wallet ID:', data.walletId);
    } else {
      console.error('❌ Failed to get wallet balance:', data.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Main execution
async function main() {
  if (!USER_TOKEN) {
    console.log('❌ USER_TOKEN environment variable not set');
    console.log('💡 Please set your authentication token:');
    console.log('   export USER_TOKEN="your-jwt-token-here"');
    console.log('   or');
    console.log('   set USER_TOKEN=your-jwt-token-here (Windows)');
    return;
  }

  console.log('📋 Wallet Management Script');
  console.log('============================');
  
  // Check current balance first
  await checkWalletBalance();
  
  console.log('\n---');
  
  // Add funds
  await addTenThousandDollars();
  
  console.log('\n---');
  
  // Check new balance
  await checkWalletBalance();
}

// Run the script
main().catch(console.error);
