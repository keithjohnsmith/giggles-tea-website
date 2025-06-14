const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// Configuration
const BASE_URL = 'http://localhost:5000/api';
const TEST_USER = {
  username: `testuser_${uuidv4().substring(0, 8)}`,
  email: `test_${uuidv4().substring(0, 8)}@example.com`,
  password: 'testpassword123',
  role: 'admin'
};

// Helper function to log test results
function logTestResult(testName, passed, message = '') {
  const status = passed ? '✅ PASSED' : '❌ FAILED';
  console.log(`[${status}] ${testName}${message ? `: ${message}` : ''}`);
  return passed;
}

// Test suite
async function runTests() {
  let allTestsPassed = true;
  let authToken = '';
  
  console.log('🚀 Starting Giggles Tea Server Tests\n');

  // Test 1: Server is running
  try {
    const response = await axios.get(`${BASE_URL}/test`);
    const passed = response.status === 200 && response.data.status === 'success';
    allTestsPassed = allTestsPassed && logTestResult('Server is running', passed);
  } catch (error) {
    allTestsPassed = false;
    logTestResult('Server is running', false, error.message);
  }

  // Test 2: Get all products
  try {
    const response = await axios.get(`${BASE_URL}/products`);
    const passed = response.status === 200 && Array.isArray(response.data.products);
    allTestsPassed = allTestsPassed && logTestResult('Get all products', passed, `Found ${response.data.products.length} products`);
  } catch (error) {
    allTestsPassed = false;
    logTestResult('Get all products', false, error.message);
  }

  // Test 3: Register a new admin user
  try {
    const response = await axios.post(`${BASE_URL}/auth/register`, TEST_USER);
    const passed = response.status === 201 && response.data.token;
    authToken = response.data.token;
    allTestsPassed = allTestsPassed && logTestResult('Register admin user', passed);
  } catch (error) {
    allTestsPassed = false;
    logTestResult('Register admin user', false, error.response?.data?.error || error.message);
  }

  // Test 4: Login with admin user
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    const passed = response.status === 200 && response.data.token;
    authToken = response.data.token;
    allTestsPassed = allTestsPassed && logTestResult('Login with admin user', passed);
  } catch (error) {
    allTestsPassed = false;
    logTestResult('Login with admin user', false, error.response?.data?.error || error.message);
  }

  // Test 5: Access protected route
  if (authToken) {
    try {
      const response = await axios.get(`${BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const passed = response.status === 200 && response.data.email === TEST_USER.email;
      allTestsPassed = allTestsPassed && logTestResult('Access protected route', passed);
    } catch (error) {
      allTestsPassed = false;
      logTestResult('Access protected route', false, error.response?.data?.error || error.message);
    }
  } else {
    allTestsPassed = false;
    logTestResult('Access protected route', false, 'No auth token available');
  }

  console.log('\nTest Results:');
  console.log('----------------------------------');
  console.log(allTestsPassed ? '🎉 All tests passed successfully!' : '❌ Some tests failed');
  console.log('----------------------------------');
}

// Run the tests
runTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
