// Test script for Edge Functions
const BASE_URL = 'http://127.0.0.1:54321/functions/v1';
const AUTH_TOKEN = 'Bearer test-token'; // Dummy token for testing

async function testFunction(functionName, endpoint, data = {}) {
  console.log(`\n🧪 Testing ${functionName}...`);
  
  try {
    const response = await fetch(`${BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': AUTH_TOKEN
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.text();
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${result.substring(0, 200)}${result.length > 200 ? '...' : ''}`);
    
    return { status: response.status, body: result };
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return { error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Starting Edge Functions Tests\n');
  
  // Test 1: Package Validation - Check Limits
  await testFunction(
    'Package Validation - Check Limits',
    'package-validation',
    { action: 'checkLimits', userId: 'test-user-123' }
  );
  
  // Test 2: Package Validation - Get Status
  await testFunction(
    'Package Validation - Get Status', 
    'package-validation',
    { action: 'getPackageStatus', userId: 'test-user-123' }
  );
  
  // Test 3: Payment Management - Submit Confirmation
  await testFunction(
    'Payment Management - Submit Confirmation',
    'payment-management',
    { 
      action: 'submitPaymentConfirmation',
      userId: 'test-user-123',
      amount: 299000,
      paymentMethod: 'bank_transfer',
      notes: 'Test payment confirmation'
    }
  );
  
  // Test 4: Admin Package Management - Upgrade User
  await testFunction(
    'Admin Package Management - Upgrade User',
    'admin-package-management',
    {
      action: 'upgradeUser',
      userId: 'test-user-123',
      packageType: 'gold'
    }
  );
  
  // Test 5: Create Invitation with Validation
  await testFunction(
    'Create Invitation with Validation',
    'create-invitation-with-validation',
    {
      userId: 'test-user-123',
      templateId: 'e1a2b3c4-d5e6-47f8-89a0-123456789abc',
      invitationData: {
        groom_name: 'John',
        bride_name: 'Jane',
        wedding_date: '2024-12-25',
        venue: 'Beautiful Garden'
      }
    }
  );
  
  console.log('\n✅ All tests completed!');
}

// Run the tests
runTests().catch(console.error);
