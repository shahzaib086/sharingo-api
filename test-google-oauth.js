// Test script for Google OAuth integration
// This script helps you test the Google OAuth endpoint

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

async function testGoogleLogin() {
  try {
    console.log('Testing Google OAuth login endpoint...');
    
    // This is a mock ID token - in real usage, you would get this from Google
    const mockIdToken = 'mock_google_id_token';
    
    const response = await axios.post(`${API_BASE_URL}/auth/google-login`, {
      idToken: mockIdToken
    });
    
    console.log('Response:', response.data);
    
    if (response.data.success) {
      console.log('✅ Google OAuth endpoint is working!');
      console.log('Access Token:', response.data.data.accessToken);
    } else {
      console.log('❌ Google OAuth endpoint returned error:', response.data.message);
    }
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Server error:', error.response.data);
    } else {
      console.log('❌ Network error:', error.message);
    }
  }
}

async function testRegularLogin() {
  try {
    console.log('\nTesting regular login endpoint...');
    
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    
    console.log('Response:', response.data);
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Server error:', error.response.data);
    } else {
      console.log('❌ Network error:', error.message);
    }
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Google OAuth Integration Tests\n');
  
  await testGoogleLogin();
  await testRegularLogin();
  
  console.log('\n✨ Tests completed!');
}

// Check if axios is available
try {
  require('axios');
  runTests();
} catch (error) {
  console.log('❌ Axios not found. Install it with: npm install axios');
  console.log('Or run the tests manually using curl or Postman.');
} 