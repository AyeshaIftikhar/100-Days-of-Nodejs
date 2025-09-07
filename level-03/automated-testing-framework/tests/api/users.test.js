'use strict';

const { apiTest } = require('../../lib/api');
const customMatchers = require('../../lib/utils/custom-matchers');

describe('Users API', () => {
  // Set up custom matchers
  beforeEach(() => {
    expect.extend(customMatchers);
  });
  
  // Test cases
  test('should get a list of users', async () => {
    // Make the API request
    const response = await apiTest.get('/api/users');
    
    // Assert response status and structure
    expect(response).toHaveStatusCode(200);
    expect(response).toBeJsonResponse();
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data.length).toBeGreaterThan(0);
    
    // Assert user object structure
    const user = response.data[0];
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('name');
    expect(user).toHaveProperty('email');
    
    // Validate email format with custom matcher
    expect(user.email).toBeValidEmail();
  });
  
  test('should get a single user by ID', async () => {
    // Make the API request
    const response = await apiTest.get('/api/users/1');
    
    // Assert response status and structure
    expect(response).toHaveStatusCode(200);
    expect(response.data).toHaveProperty('id', 1);
    expect(response.data).toHaveProperty('name');
    expect(response.data).toHaveProperty('email');
  });
  
  test('should return 404 for non-existent user', async () => {
    // Expect the request to fail
    await expect(apiTest.get('/api/users/999')).rejects.toThrow();
    
    try {
      await apiTest.get('/api/users/999');
    } catch (error) {
      expect(error.response.status).toBe(404);
    }
  });
  
  test('should create a new user', async () => {
    // Prepare test data
    const userData = {
      name: 'Test User',
      email: 'test@example.com'
    };
    
    // Make the API request
    const response = await apiTest.post('/api/users', userData);
    
    // Assert response status and structure
    expect(response).toHaveStatusCode(201);
    expect(response.data).toHaveProperty('id');
    expect(response.data).toHaveProperty('name', userData.name);
    expect(response.data).toHaveProperty('email', userData.email);
  });
  
  test('should update an existing user', async () => {
    // Prepare test data
    const userData = {
      name: 'Updated User',
      email: 'updated@example.com'
    };
    
    // Make the API request
    const response = await apiTest.put('/api/users/1', userData);
    
    // Assert response status and structure
    expect(response).toHaveStatusCode(200);
    expect(response.data).toHaveProperty('id', 1);
    expect(response.data).toHaveProperty('name', userData.name);
    expect(response.data).toHaveProperty('email', userData.email);
  });
  
  test('should delete a user', async () => {
    // Make the API request
    const response = await apiTest.delete('/api/users/1');
    
    // Assert response status
    expect(response).toHaveStatusCode(204);
    
    // Verify user is deleted
    await expect(apiTest.get('/api/users/1')).rejects.toThrow();
  });
});
