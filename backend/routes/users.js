const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  findCompatibleRoommates,
  getUserStats,
  getUsers,
  deleteUser
} = require('../controllers/userController');
const auth = require('../middleware/auth');

// ========================================
// ROOT ROUTE DOCUMENTATION
// ========================================

// Root route for users endpoints documentation
router.get('/docs', (req, res) => {
  res.json({
    message: 'RoomieMatch Users API',
    version: '2.0.0',
    endpoints: {
      'GET /api/users/stats': 'Get platform statistics (public)',
      'GET /api/users/:userId': 'Get user profile by ID (public)',
      'GET /api/users': 'List users with filters (requires auth)',
      'PUT /api/users/:userId': 'Update user profile (requires auth)',
      'GET /api/users/:userId/compatible': 'Find compatible roommates (requires auth)',
      'DELETE /api/users/:userId': 'Delete user account (requires auth)'
    },
    authentication: 'Include "Authorization: Bearer <token>" header for protected routes',
    examples: {
      getUserStats: 'GET /api/users/stats',
      getProfile: 'GET /api/users/123',
      findMatches: 'GET /api/users/123/compatible?limit=10&minScore=70',
      updateProfile: 'PUT /api/users/123 (with auth)',
      listUsers: 'GET /api/users?page=1&limit=20&onboardingCompleted=true (with auth)'
    }
  });
});

// ========================================
// PUBLIC ROUTES (No Authentication Required)
// ========================================

// Get platform statistics
router.get('/stats', getUserStats);

// Get user profile by ID (public for viewing potential matches)
router.get('/:userId', getUserProfile);

// ========================================
// PROTECTED ROUTES (Authentication Required)
// ========================================

// Get all users with filtering (admin functionality)
router.get('/', auth, getUsers);

// Update user profile
router.put('/:userId', auth, updateUserProfile);

// Find compatible roommates for a user
router.get('/:userId/compatible', auth, findCompatibleRoommates);

// Delete user (admin or user themselves)
router.delete('/:userId', auth, deleteUser);

module.exports = router;