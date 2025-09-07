'use strict';

const { apiTest } = require('../../lib/api');
const customMatchers = require('../../lib/utils/custom-matchers');

describe('API Performance Tests', () => {
  // Set up custom matchers
  beforeEach(() => {
    expect.extend(customMatchers);
  });
  
  // Measure response time
  const measureResponseTime = async (fn) => {
    const start = Date.now();
    const response = await fn();
    response.responseTime = Date.now() - start;
    return response;
  };
  
  // Test cases
  test('should respond to GET /api/users within 200ms', async () => {
    // Make the API request and measure time
    const response = await measureResponseTime(() => apiTest.get('/api/users'));
    
    // Assert response status
    expect(response).toHaveStatusCode(200);
    
    // Assert response time
    expect(response).toHaveResponseTimeLessThan(200);
    console.log(`Response time: ${response.responseTime}ms`);
  });
  
  test('should respond to GET /api/users/1 within 100ms', async () => {
    // Make the API request and measure time
    const response = await measureResponseTime(() => apiTest.get('/api/users/1'));
    
    // Assert response status
    expect(response).toHaveStatusCode(200);
    
    // Assert response time
    expect(response).toHaveResponseTimeLessThan(100);
    console.log(`Response time: ${response.responseTime}ms`);
  });
  
  test('should handle 10 sequential requests within 1 second total', async () => {
    const start = Date.now();
    
    // Make 10 sequential requests
    for (let i = 0; i < 10; i++) {
      const response = await apiTest.get('/api/users');
      expect(response).toHaveStatusCode(200);
    }
    
    const totalTime = Date.now() - start;
    
    // Assert total time
    expect(totalTime).toBeLessThan(1000);
    console.log(`Total time for 10 sequential requests: ${totalTime}ms`);
  });
  
  test('should handle 10 parallel requests within 300ms total', async () => {
    const start = Date.now();
    
    // Make 10 parallel requests
    const requests = Array(10).fill().map(() => apiTest.get('/api/users'));
    const responses = await Promise.all(requests);
    
    // Assert all responses are successful
    responses.forEach(response => {
      expect(response).toHaveStatusCode(200);
    });
    
    const totalTime = Date.now() - start;
    
    // Assert total time
    expect(totalTime).toBeLessThan(300);
    console.log(`Total time for 10 parallel requests: ${totalTime}ms`);
  });
  
  test('should maintain performance under load', async () => {
    const results = [];
    
    // Perform 3 rounds of testing
    for (let round = 0; round < 3; round++) {
      const start = Date.now();
      
      // Make 5 parallel requests in each round
      const requests = Array(5).fill().map(() => 
        measureResponseTime(() => apiTest.get('/api/users'))
      );
      
      const responses = await Promise.all(requests);
      
      // Collect response times
      const roundResults = responses.map(response => ({
        status: response.status,
        time: response.responseTime
      }));
      
      results.push({
        round: round + 1,
        totalTime: Date.now() - start,
        avgTime: roundResults.reduce((sum, r) => sum + r.time, 0) / roundResults.length,
        minTime: Math.min(...roundResults.map(r => r.time)),
        maxTime: Math.max(...roundResults.map(r => r.time)),
        responses: roundResults
      });
      
      // Wait a bit between rounds
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Log results
    console.table(results.map(r => ({
      round: r.round,
      totalTime: r.totalTime,
      avgTime: r.avgTime.toFixed(2),
      minTime: r.minTime,
      maxTime: r.maxTime
    })));
    
    // Assert average times are within threshold
    results.forEach(round => {
      expect(round.avgTime).toBeLessThan(100);
      
      // Check for consistency between min and max times
      const variance = round.maxTime / round.minTime;
      expect(variance).toBeLessThan(3); // Max should be less than 3x min
    });
    
    // Check for degradation across rounds
    const firstRoundAvg = results[0].avgTime;
    const lastRoundAvg = results[results.length - 1].avgTime;
    
    // Allow up to 50% degradation
    expect(lastRoundAvg).toBeLessThan(firstRoundAvg * 1.5);
  });
});
