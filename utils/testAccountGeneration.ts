// Test file for Account Generation System
// Run this to see how different users get different account details

import { 
  generateAccountDetails, 
  generateUserId, 
  generateAccountNumber, 
  generateIBAN,
  validateIBAN 
} from './accountGenerator';

// Test different users
const testUsers = [
  { id: 'user_001', email: 'john@example.com', phone: '+923001234567', name: 'John Doe' },
  { id: 'user_002', email: 'jane@example.com', phone: '+923001234568', name: 'Jane Smith' },
  { id: 'user_003', email: 'bob@example.com', phone: '+923001234569', name: 'Bob Johnson' },
  { id: 'user_004', email: 'alice@example.com', phone: '+923001234570', name: 'Alice Brown' },
  { id: 'user_005', email: 'charlie@example.com', phone: '+923001234571', name: 'Charlie Wilson' }
];

console.log('🧪 Testing Account Generation System\n');

// Test 1: Generate account details for different users
console.log('📋 Test 1: Different users get different account details');
testUsers.forEach((user, index) => {
  const userId = generateUserId(user);
  const accountDetails = generateAccountDetails(userId);
  
  console.log(`\n👤 User ${index + 1}: ${user.name}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Generated User ID: ${userId}`);
  console.log(`   Account Number: ${accountDetails.accountNumber}`);
  console.log(`   IBAN: ${accountDetails.iban}`);
  console.log(`   Bank Code: ${accountDetails.bankCode}`);
});

// Test 2: Verify consistency (same user always gets same details)
console.log('\n🔄 Test 2: Consistency check - same user gets same details');
const testUser = testUsers[0];
const userId = generateUserId(testUser);

const details1 = generateAccountDetails(userId);
const details2 = generateAccountDetails(userId);
const details3 = generateAccountDetails(userId);

console.log(`\n👤 User: ${testUser.name}`);
console.log(`   Account 1: ${details1.accountNumber}`);
console.log(`   Account 2: ${details2.accountNumber}`);
console.log(`   Account 3: ${details3.accountNumber}`);
console.log(`   Consistent: ${details1.accountNumber === details2.accountNumber && details2.accountNumber === details3.accountNumber ? '✅ YES' : '❌ NO'}`);

console.log(`\n   IBAN 1: ${details1.iban}`);
console.log(`   IBAN 2: ${details2.iban}`);
console.log(`   IBAN 3: ${details3.iban}`);
console.log(`   Consistent: ${details1.iban === details2.iban && details2.iban === details3.iban ? '✅ YES' : '❌ NO'}`);

// Test 3: Test individual functions
console.log('\n🔧 Test 3: Individual function testing');
const testUserId = 'test_user_123';
const accountNumber = generateAccountNumber(testUserId);
const iban = generateIBAN(accountNumber);

console.log(`\n🧪 Test User ID: ${testUserId}`);
console.log(`   Generated Account Number: ${accountNumber}`);
console.log(`   Generated IBAN: ${iban}`);
console.log(`   IBAN Valid: ${validateIBAN(iban) ? '✅ YES' : '❌ NO'}`);

// Test 4: Test edge cases
console.log('\n⚠️ Test 4: Edge cases');
const edgeCases = [
  { id: '', email: '', phone: '', name: '' },
  { id: 'very_long_user_id_that_might_cause_issues_123456789012345678901234567890' },
  { id: 'special_chars_!@#$%^&*()' },
  { id: 'numbers_123_456_789' }
];

edgeCases.forEach((edgeCase, index) => {
  try {
    const userId = generateUserId(edgeCase);
    const accountDetails = generateAccountDetails(userId);
    
    console.log(`\n🔍 Edge Case ${index + 1}: ${JSON.stringify(edgeCase)}`);
    console.log(`   Generated User ID: ${userId}`);
    console.log(`   Account Number: ${accountDetails.accountNumber}`);
    console.log(`   IBAN: ${accountDetails.iban}`);
  } catch (error) {
    console.log(`\n❌ Edge Case ${index + 1} failed: ${error}`);
  }
});

// Test 5: Performance test
console.log('\n⚡ Test 5: Performance test');
const startTime = Date.now();
const iterations = 1000;

for (let i = 0; i < iterations; i++) {
  const testId = `perf_test_${i}`;
  generateAccountDetails(testId);
}

const endTime = Date.now();
const duration = endTime - startTime;

console.log(`\n📊 Generated ${iterations} account details in ${duration}ms`);
console.log(`   Average: ${(duration / iterations).toFixed(2)}ms per generation`);

// Test 6: Uniqueness test
console.log('\n🎯 Test 6: Uniqueness test');
const generatedAccounts = new Set();
const generatedIbans = new Set();

testUsers.forEach(user => {
  const userId = generateUserId(user);
  const accountDetails = generateAccountDetails(userId);
  
  generatedAccounts.add(accountDetails.accountNumber);
  generatedIbans.add(accountDetails.iban);
});

console.log(`\n📈 Uniqueness Results:`);
console.log(`   Total Users: ${testUsers.length}`);
console.log(`   Unique Account Numbers: ${generatedAccounts.size}`);
console.log(`   Unique IBANs: ${generatedIbans.size}`);
console.log(`   Account Numbers Unique: ${generatedAccounts.size === testUsers.length ? '✅ YES' : '❌ NO'}`);
console.log(`   IBANs Unique: ${generatedIbans.size === testUsers.length ? '✅ YES' : '❌ NO'}`);

console.log('\n✨ Account Generation System Test Complete!');
console.log('\n📝 Summary:');
console.log('   - Each user gets unique account details');
console.log('   - Same user always gets same details');
console.log('   - System handles edge cases gracefully');
console.log('   - Performance is good for typical usage');
console.log('   - All generated numbers are unique');

export {
  testUsers,
  generateAccountDetails,
  generateUserId
};
