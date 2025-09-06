const { FeatureFlagClient } = require('../examples/node-client');
const axios = require('axios');

// Mock axios
jest.mock('axios');

describe('Feature Flag Service Client', () => {
  let client;
  
  beforeEach(() => {
    // Create a client instance for testing
    client = new FeatureFlagClient({
      projectId: 'test-project',
      environment: 'development',
      userId: 'test-user'
    });
    
    // Clear mocks between tests
    jest.clearAllMocks();
  });
  
  test('should evaluate a flag correctly', async () => {
    // Mock the axios response
    axios.post.mockResolvedValue({
      data: {
        success: true,
        data: {
          enabled: true,
          variant: 'variant_a',
          value: true,
          reason: 'Default variant'
        }
      }
    });
    
    // Call the evaluate method
    const result = await client.evaluate('test_flag');
    
    // Check that axios was called with the correct parameters
    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:3000/api/projects/test-project/evaluate',
      {
        flagKey: 'test_flag',
        environment: 'development',
        userId: 'test-user',
        context: {}
      }
    );
    
    // Check the result
    expect(result).toEqual({
      enabled: true,
      variant: 'variant_a',
      value: true,
      reason: 'Default variant'
    });
  });
  
  test('should handle errors gracefully', async () => {
    // Mock axios to throw an error
    axios.post.mockRejectedValue(new Error('Network error'));
    
    // Call the evaluate method
    const result = await client.evaluate('test_flag');
    
    // Check that we get a safe default
    expect(result).toEqual({
      enabled: false,
      variant: null,
      value: null,
      reason: 'Error evaluating flag'
    });
  });
  
  test('should evaluate multiple flags in batch', async () => {
    // Mock the axios response
    axios.post.mockResolvedValue({
      data: {
        success: true,
        data: {
          flag1: {
            enabled: true,
            variant: 'variant_a',
            value: true,
            reason: 'Default variant'
          },
          flag2: {
            enabled: false,
            variant: 'control',
            value: false,
            reason: 'Feature flag is disabled'
          }
        }
      }
    });
    
    // Call the evaluateBatch method
    const result = await client.evaluateBatch(['flag1', 'flag2']);
    
    // Check that axios was called with the correct parameters
    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:3000/api/projects/test-project/evaluate-batch',
      {
        flagKeys: ['flag1', 'flag2'],
        environment: 'development',
        userId: 'test-user',
        context: {}
      }
    );
    
    // Check the result
    expect(result).toEqual({
      flag1: {
        enabled: true,
        variant: 'variant_a',
        value: true,
        reason: 'Default variant'
      },
      flag2: {
        enabled: false,
        variant: 'control',
        value: false,
        reason: 'Feature flag is disabled'
      }
    });
  });
  
  test('should get boolean value with isEnabled', async () => {
    // Mock the axios response
    axios.post.mockResolvedValue({
      data: {
        success: true,
        data: {
          enabled: true,
          variant: 'variant_a',
          value: { someValue: 123 },
          reason: 'Default variant'
        }
      }
    });
    
    // Call the isEnabled method
    const result = await client.isEnabled('test_flag');
    
    // Check the result is a boolean
    expect(result).toBe(true);
  });
  
  test('should return flag value or default with getValue', async () => {
    // Mock the axios response for an enabled flag
    axios.post.mockResolvedValue({
      data: {
        success: true,
        data: {
          enabled: true,
          variant: 'variant_a',
          value: 'custom_value',
          reason: 'Default variant'
        }
      }
    });
    
    // Call the getValue method
    const result = await client.getValue('test_flag', 'default_value');
    
    // Check that we get the flag value
    expect(result).toBe('custom_value');
    
    // Now mock a disabled flag
    axios.post.mockResolvedValue({
      data: {
        success: true,
        data: {
          enabled: false,
          variant: null,
          value: null,
          reason: 'Feature flag is disabled'
        }
      }
    });
    
    // Call getValue again
    const result2 = await client.getValue('test_flag', 'default_value');
    
    // Check that we get the default value
    expect(result2).toBe('default_value');
  });
});
