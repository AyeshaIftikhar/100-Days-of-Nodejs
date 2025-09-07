'use strict';

const { uiTest } = require('../../lib/ui');
const { apiTest } = require('../../lib/api');
const testUtils = require('../../lib/utils/test-utils');

describe('User Registration and Login Flow', () => {
  // Test data
  const userData = {
    name: 'E2E Test User',
    email: testUtils.randomEmail(),
    password: 'Password123!'
  };
  
  // Set up before tests
  beforeAll(async () => {
    await uiTest.launch();
  });
  
  // Clean up after tests
  afterAll(async () => {
    // Delete test user via API
    try {
      const users = await apiTest.get('/api/users', {
        params: { email: userData.email }
      });
      
      if (users.data && users.data.length > 0) {
        await apiTest.delete(`/api/users/${users.data[0].id}`);
      }
    } catch (error) {
      console.error('Failed to clean up test user:', error.message);
    }
    
    await uiTest.close();
  });
  
  // Test cases for the full registration and login flow
  test('should complete user registration and login process', async () => {
    // Step 1: Navigate to registration page
    await uiTest.navigate('https://example.com/register');
    
    // Take screenshot of the registration page
    await uiTest.screenshot('register-page');
    
    // Step 2: Fill the registration form
    await uiTest.type('#name', userData.name);
    await uiTest.type('#email', userData.email);
    await uiTest.type('#password', userData.password);
    await uiTest.type('#confirm-password', userData.password);
    
    // Check terms and conditions
    await uiTest.click('#terms');
    
    // Step 3: Submit registration form
    await Promise.all([
      uiTest.waitForNavigation(),
      uiTest.click('#register-button')
    ]);
    
    // Take screenshot after registration
    await uiTest.screenshot('after-registration');
    
    // Step 4: Verify registration success
    const successMessage = await uiTest.getText('.success-message');
    expect(successMessage).toContain('Registration successful');
    
    // Step 5: Navigate to login page
    await uiTest.navigate('https://example.com/login');
    
    // Step 6: Fill the login form
    await uiTest.type('#username', userData.email);
    await uiTest.type('#password', userData.password);
    
    // Step 7: Submit login form
    await Promise.all([
      uiTest.waitForNavigation(),
      uiTest.click('#login-button')
    ]);
    
    // Take screenshot after login
    await uiTest.screenshot('after-login');
    
    // Step 8: Verify successful login and redirection to dashboard
    const url = await uiTest.page.url();
    expect(url).toContain('/dashboard');
    
    // Step 9: Verify welcome message includes user name
    const welcomeMessage = await uiTest.getText('.welcome-message');
    expect(welcomeMessage).toContain(userData.name);
    
    // Step 10: Verify user data via API
    const response = await apiTest.get('/api/users/me', {
      headers: {
        Cookie: await uiTest.evaluate(() => document.cookie)
      }
    });
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('email', userData.email);
    expect(response.data).toHaveProperty('name', userData.name);
    
    // Step 11: Log out
    await uiTest.click('#logout-button');
    
    // Step 12: Verify logged out state
    const loginButton = await uiTest.exists('#login-button');
    expect(loginButton).toBe(true);
  });
});
