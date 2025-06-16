const express = require('express');
const router = express.Router();
const {
  getPreviewProfiles,
  getPublicStats
} = require('../controllers/previewController');

// ========================================
// PUBLIC PREVIEW ROUTES (No Authentication Required)
// ========================================

// Root route for preview endpoints documentation
router.get('/', (req, res) => {
  res.json({
    message: 'RoomieMatch Preview API',
    description: 'Public endpoints for marketing and preview functionality',
    version: '2.0.0',
    endpoints: {
      'GET /api/preview/profiles': 'Get sample roommate profiles for homepage preview',
      'GET /api/preview/stats': 'Get public platform statistics (user count, success rates)',
      'GET /api/preview/': 'This documentation'
    },
    note: 'All preview endpoints are public and do not require authentication',
    usage: {
      profiles: 'Used for displaying sample roommates on landing page before signup',
      stats: 'Used for showing platform growth and success metrics on marketing pages'
    }
  });
});

// Get sample roommate profiles for preview (homepage/marketing)
router.get('/profiles', getPreviewProfiles);

// Get public platform statistics
router.get('/stats', getPublicStats);

module.exports = router;