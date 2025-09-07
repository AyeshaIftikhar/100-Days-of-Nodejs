'use strict';

const { uiTest } = require('../../lib/ui');
const testUtils = require('../../lib/utils/test-utils');

describe('Login Page', () => {
  // Set up before tests
  beforeAll(async () => {
    await uiTest.launch();
  });
  
  // Clean up after tests
  afterAll(async () => {
    await uiTest.close();
  });
  
  // Navigate to login page before each test
  beforeEach(async () => {
    await uiTest.navigate('https://example.com/login');
  });
  
  // Take screenshot after each test
  afterEach(async () => {
    await uiTest.screenshot('login-test');
  });
  
  // Test cases
  test('should display login form', async () => {
    // Check if login form elements exist
    expect(await uiTest.exists('#login-form')).toBe(true);
    expect(await uiTest.exists('#username')).toBe(true);
    expect(await uiTest.exists('#password')).toBe(true);
    expect(await uiTest.exists('#login-button')).toBe(true);
    
    // Check form title
    const title = await uiTest.getText('h1');
    expect(title).toContain('Login');
  });
  
  test('should show error for empty form submission', async () => {
    // Submit empty form
    await uiTest.click('#login-button');
    
    // Check error message
    const errorMessage = await uiTest.getText('.error-message');
    expect(errorMessage).toContain('Please enter your username and password');
  });
  
  test('should show error for invalid credentials', async () => {
    // Fill form with invalid credentials
    await uiTest.type('#username', 'invaliduser');
    await uiTest.type('#password', 'wrongpassword');
    
    // Submit form
    await uiTest.click('#login-button');
    
    // Check error message
    const errorMessage = await uiTest.getText('.error-message');
    expect(errorMessage).toContain('Invalid username or password');
  });
  
  test('should redirect to dashboard after successful login', async () => {
    // Fill form with valid credentials
    await uiTest.type('#username', 'testuser');
    await uiTest.type('#password', 'password123');
    
    // Submit form and wait for navigation
    await Promise.all([
      uiTest.waitForNavigation(),
      uiTest.click('#login-button')
    ]);
    
    // Check URL after redirect
    const url = await uiTest.page.url();
    expect(url).toContain('/dashboard');
    
    // Check welcome message
    const welcomeMessage = await uiTest.getText('.welcome-message');
    expect(welcomeMessage).toContain('Welcome');
  });
  
  test('should preserve username after failed login', async () => {
    // Fill form
    const username = 'testuser';
    await uiTest.type('#username', username);
    await uiTest.type('#password', 'wrongpassword');
    
    // Submit form
    await uiTest.click('#login-button');
    
    // Check if username is preserved
    const usernameValue = await uiTest.getValue('#username');
    expect(usernameValue).toBe(username);
    
    // Check if password is cleared
    const passwordValue = await uiTest.getValue('#password');
    expect(passwordValue).toBe('');
  });
  
  test('should toggle password visibility', async () => {
    // Type password
    const password = 'password123';
    await uiTest.type('#password', password);
    
    // Check initial type is password
    let inputType = await uiTest.evaluate(
      selector => document.querySelector(selector).type,
      '#password'
    );
    expect(inputType).toBe('password');
    
    // Click show password button
    await uiTest.click('#show-password');
    
    // Check type is now text
    inputType = await uiTest.evaluate(
      selector => document.querySelector(selector).type,
      '#password'
    );
    expect(inputType).toBe('text');
    
    // Click hide password button
    await uiTest.click('#show-password');
    
    // Check type is back to password
    inputType = await uiTest.evaluate(
      selector => document.querySelector(selector).type,
      '#password'
    );
    expect(inputType).toBe('password');
  });
});
