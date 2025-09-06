// Sample Express application that uses the Feature Flag Service
const express = require('express');
const { FeatureFlagClient } = require('./node-client');

// Initialize the Feature Flag Client
const featureFlags = new FeatureFlagClient({
  apiUrl: 'http://localhost:3000/api',
  projectId: 'your-project-id', // Replace with your actual project ID
  environment: 'production',     // Change as needed
});

const app = express();
app.use(express.json());

// Middleware to attach user information to the request
app.use((req, res, next) => {
  // In a real app, you'd get the user ID from the session or token
  req.userId = req.headers['x-user-id'] || 'anonymous';
  
  // You can also attach user context information
  req.userContext = {
    country: req.headers['x-country'] || 'unknown',
    userType: req.headers['x-user-type'] || 'free',
    deviceType: req.headers['user-agent'] ? 
      (req.headers['user-agent'].includes('Mobile') ? 'mobile' : 'desktop') : 
      'unknown'
  };
  
  next();
});

// Middleware to check feature flags
const checkFeatureFlag = (flagKey, redirectUrl = '/') => {
  return async (req, res, next) => {
    try {
      const isEnabled = await featureFlags.isEnabled(
        flagKey, 
        req.userId, 
        req.userContext
      );
      
      if (isEnabled) {
        next();
      } else {
        res.redirect(redirectUrl);
      }
    } catch (error) {
      console.error(`Error checking feature flag ${flagKey}:`, error);
      res.redirect(redirectUrl);
    }
  };
};

// Example route that uses feature flag
app.get('/new-homepage', 
  checkFeatureFlag('new_homepage', '/old-homepage'), 
  (req, res) => {
    res.send('Welcome to the new homepage!');
  }
);

app.get('/old-homepage', (req, res) => {
  res.send('Welcome to the original homepage');
});

// Example route that changes behavior based on a feature flag
app.get('/api/products', async (req, res) => {
  try {
    // Check if the new recommendation algorithm is enabled
    const useNewAlgo = await featureFlags.isEnabled(
      'new_recommendation_algorithm', 
      req.userId, 
      req.userContext
    );
    
    if (useNewAlgo) {
      // Use the new algorithm
      const products = getProductsWithNewAlgo(req.userContext);
      res.json(products);
    } else {
      // Use the old algorithm
      const products = getProductsWithOldAlgo();
      res.json(products);
    }
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Example route that uses a feature flag value
app.get('/api/search', async (req, res) => {
  try {
    // Get the search algorithm version from the feature flag
    const searchAlgoVersion = await featureFlags.getValue(
      'search_algorithm_version',
      'v1', // Default value if flag is disabled
      req.userId,
      req.userContext
    );
    
    // Perform search with the specified algorithm version
    const results = performSearch(req.query.q, searchAlgoVersion);
    
    res.json({
      version: searchAlgoVersion,
      results
    });
  } catch (error) {
    console.error('Error processing search:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Example route that checks multiple flags at once
app.get('/api/dashboard', async (req, res) => {
  try {
    // Evaluate multiple flags in a single request
    const flags = await featureFlags.evaluateBatch(
      ['new_dashboard', 'realtime_updates', 'advanced_analytics'],
      req.userId,
      req.userContext
    );
    
    res.json({
      showNewDashboard: flags.new_dashboard.enabled,
      enableRealtimeUpdates: flags.realtime_updates.enabled,
      showAdvancedAnalytics: flags.advanced_analytics.enabled,
      // You can also use the values
      updateInterval: flags.realtime_updates.enabled ? 
        flags.realtime_updates.value : 60000, // Default to 1 minute
    });
  } catch (error) {
    console.error('Error getting dashboard config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mock functions
function getProductsWithNewAlgo(userContext) {
  return [
    { id: 1, name: 'Product 1 (Recommended for you)' },
    { id: 2, name: 'Product 2 (Based on your location)' },
    { id: 3, name: 'Product 3 (New algorithm)' },
  ];
}

function getProductsWithOldAlgo() {
  return [
    { id: 1, name: 'Product 1' },
    { id: 2, name: 'Product 2' },
    { id: 3, name: 'Product 3' },
  ];
}

function performSearch(query, version) {
  if (version === 'v2') {
    return [
      { id: 1, name: `Result 1 for ${query} (v2 algorithm)` },
      { id: 2, name: `Result 2 for ${query} (v2 algorithm)` },
    ];
  } else {
    return [
      { id: 1, name: `Result 1 for ${query}` },
      { id: 2, name: `Result 2 for ${query}` },
    ];
  }
}

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Sample application listening on port ${PORT}`);
});
