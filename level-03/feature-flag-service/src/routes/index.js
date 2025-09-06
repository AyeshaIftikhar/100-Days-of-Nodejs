const express = require('express');
const featureFlagRoutes = require('./featureFlagRoutes');
// Import other route files here when created

const router = express.Router();

// Integrate all routes
router.use(featureFlagRoutes);

// Add future routes here
// router.use('/users', userRoutes);
// router.use('/organizations', organizationRoutes);
// router.use('/projects', projectRoutes);

module.exports = router;
