const User = require('../models/User');

// @desc    Get user profile by ID
// @route   GET /api/users/:userId
// @access  Public (should be protected in production)
const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-account.password -personalInfo.ssn');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: user,
        profileCompleteness: user.calculateCompleteness(),
        budgetRange: user.getBudgetRange(),
        selectedNeighborhoods: user.getSelectedNeighborhoods(),
        canViewFullProfiles: user.canViewFullProfiles()
      }
    });

  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving profile'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:userId
// @access  Protected
const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    // Sanitize updates - don't allow direct metadata changes
    delete updates.metadata;
    delete updates.account?.password;

    const user = await User.findByIdAndUpdate(
      userId,
      { 
        ...updates, 
        'metadata.lastLogin': new Date(),
        'metadata.profileCompleteness': undefined // Will be recalculated
      },
      { new: true, runValidators: true }
    ).select('-account.password -personalInfo.ssn');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Recalculate completeness
    user.metadata.profileCompleteness = user.calculateCompleteness();
    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { 
        user,
        profileCompleteness: user.metadata.profileCompleteness
      }
    });

  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
};

// @desc    Find compatible roommates
// @route   GET /api/users/:userId/compatible
// @access  Protected
const findCompatibleRoommates = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, minScore = 70 } = req.query;

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user can view full profiles
    if (!currentUser.canViewFullProfiles()) {
      return res.status(403).json({
        success: false,
        message: 'Complete your profile to view potential matches',
        profileCompleteness: currentUser.calculateCompleteness(),
        required: 75
      });
    }

    // Find users with overlapping locations
    const userLocationIds = currentUser.housingInfo.selectedLocations?.map(loc => loc.id) || [];
    
    if (userLocationIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please add location preferences to find matches'
      });
    }

    const potentialMatches = await User.find({
      _id: { $ne: userId },
      'metadata.isActive': true,
      'metadata.onboardingCompleted': true,
      'housingInfo.selectedLocations.id': { $in: userLocationIds }
    })
    .select('-account.password -personalInfo.ssn')
    .limit(parseInt(limit) * 2); // Get more to filter by compatibility

    // Calculate compatibility scores using your User model method
    const compatibleUsers = potentialMatches
      .map(user => {
        const score = currentUser.getCompatibilityScore(user);
        const commonLocations = user.housingInfo.selectedLocations?.filter(
          loc => userLocationIds.includes(loc.id)
        ) || [];

        return {
          user: user,
          compatibilityScore: score,
          commonLocations: commonLocations,
          budgetCompatible: checkBudgetCompatibility(currentUser, user),
          lifestyleMatch: calculateLifestyleMatch(currentUser, user)
        };
      })
      .filter(match => match.compatibilityScore >= parseInt(minScore))
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: {
        matches: compatibleUsers,
        totalFound: compatibleUsers.length,
        searchCriteria: {
          minCompatibilityScore: parseInt(minScore),
          userLocations: currentUser.housingInfo.selectedLocations,
          limit: parseInt(limit)
        },
        currentUser: {
          budgetRange: currentUser.getBudgetRange(),
          neighborhoods: currentUser.getSelectedNeighborhoods()
        }
      }
    });

  } catch (error) {
    console.error('❌ Find compatible error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error finding compatible roommates'
    });
  }
};

// @desc    Get platform statistics
// @route   GET /api/users/stats
// @access  Public
const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ 'metadata.isActive': true });
    const completedUsers = await User.countDocuments({ 'metadata.onboardingCompleted': true });
    const recentUsers = await User.countDocuments({
      'metadata.registrationDate': { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    // Popular locations analysis
    const locationStats = await User.aggregate([
      { $match: { 'housingInfo.selectedLocations': { $exists: true, $ne: [] } } },
      { $unwind: '$housingInfo.selectedLocations' },
      { 
        $group: { 
          _id: {
            borough: '$housingInfo.selectedLocations.borough',
            neighborhood: '$housingInfo.selectedLocations.neighborhood'
          },
          count: { $sum: 1 } 
        } 
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Popular occupations
    const occupationStats = await User.aggregate([
      { $match: { 'professionalInfo.occupation': { $exists: true } } },
      { 
        $group: { 
          _id: '$professionalInfo.occupation', 
          count: { $sum: 1 } 
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Profile completeness distribution
    const completenessStats = await User.aggregate([
      {
        $bucket: {
          groupBy: '$metadata.profileCompleteness',
          boundaries: [0, 25, 50, 75, 90, 100],
          default: 'unknown',
          output: { count: { $sum: 1 } }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeUsers,
          completedProfiles: completedUsers,
          recentUsers,
          completionRate: totalUsers > 0 ? Math.round((completedUsers / totalUsers) * 100) : 0,
          weeklyGrowth: recentUsers
        },
        popularLocations: locationStats.map(loc => ({
          location: `${loc._id.neighborhood}, ${loc._id.borough}`,
          count: loc.count
        })),
        popularOccupations: occupationStats,
        profileCompleteness: completenessStats,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving statistics'
    });
  }
};

// @desc    Get users list with filters
// @route   GET /api/users
// @access  Protected (admin)
const getUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      onboardingCompleted, 
      isActive,
      occupation,
      borough 
    } = req.query;

    const filters = {};
    
    if (onboardingCompleted !== undefined) {
      filters['metadata.onboardingCompleted'] = onboardingCompleted === 'true';
    }
    
    if (isActive !== undefined) {
      filters['metadata.isActive'] = isActive === 'true';
    }
    
    if (occupation) {
      filters['professionalInfo.occupation'] = occupation;
    }
    
    if (borough) {
      filters['housingInfo.selectedLocations.borough'] = borough;
    }

    const users = await User.find(filters)
      .select('-account.password -personalInfo.ssn')
      .sort({ 'metadata.registrationDate': -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await User.countDocuments(filters);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalUsers: total,
          hasNext: (parseInt(page) * parseInt(limit)) < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('❌ Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving users'
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:userId
// @access  Protected (admin or user themselves)
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting user'
    });
  }
};

// Helper functions
function checkBudgetCompatibility(user1, user2) {
  const range1 = user1.getBudgetRange();
  const range2 = user2.getBudgetRange();
  
  if (!range1 || !range2) return false;
  
  return !(range1.max < range2.min || range2.max < range1.min);
}

function calculateLifestyleMatch(user1, user2) {
  const lifestyle1 = user1.lifestyle || {};
  const lifestyle2 = user2.lifestyle || {};
  
  const factors = ['children', 'pets', 'smoking', 'drinking'];
  let matches = 0;
  
  factors.forEach(factor => {
    if (lifestyle1[factor] === lifestyle2[factor]) {
      matches++;
    }
  });
  
  return Math.round((matches / factors.length) * 100);
}

module.exports = {
  getUserProfile,
  updateUserProfile,
  findCompatibleRoommates,
  getUserStats,
  getUsers,
  deleteUser
};