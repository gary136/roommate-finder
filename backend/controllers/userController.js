const { validationResult } = require('express-validator');
const User = require('../models/User');

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      account,
      personalInfo,
      housingInfo,
      professionalInfo,
      lifestyle,
      demographics
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { 'account.email': account.email },
        { 'account.username': account.username }
      ]
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email or username'
      });
    }

    // Get client IP and user agent for metadata
    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const userAgent = req.get('User-Agent');

    // Create new user
    const user = new User({
      account: {
        username: account.username,
        email: account.email,
        password: account.password,
        phoneNumber: account.phoneNumber
      },
      personalInfo: {
        firstName: personalInfo.firstName,
        lastName: personalInfo.lastName,
        ssn: personalInfo.ssn, // In production, encrypt this
        age: personalInfo.age,
        sex: personalInfo.sex,
        ethnicity: personalInfo.ethnicity
      },
      housingInfo: {
        selectedLocations: housingInfo.selectedLocations,
        maxDistanceToMetro: housingInfo.maxDistanceToMetro,
        moveInDate: new Date(housingInfo.moveInDate),
        rentDuration: housingInfo.rentDuration
      },
      professionalInfo: {
        occupation: professionalInfo.occupation,
        annualIncome: professionalInfo.annualIncome,
        languages: professionalInfo.languages
      },
      lifestyle: {
        children: lifestyle.children,
        pets: lifestyle.pets,
        smoking: lifestyle.smoking,
        drinking: lifestyle.drinking,
        weed: lifestyle.weed,
        drugs: lifestyle.drugs
      },
      demographics: {
        religion: demographics?.religion,
        sexualOrientation: demographics?.sexualOrientation,
        political: demographics?.political
      },
      metadata: {
        profileCompleted: true,
        isActive: true,
        lastLogin: new Date(),
        registrationDate: new Date(),
        ipAddress: clientIP,
        userAgent: userAgent
      }
    });

    // Save user to database
    const savedUser = await user.save();

    // Calculate recommended rent
    const recommendedRent = savedUser.getRecommendedRent();

    // Log successful registration
    console.log(`✅ New user registered: ${savedUser.account.username} (${savedUser.account.email})`);

    // Return success response (password will be filtered out by toJSON transform)
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: savedUser,
        recommendedRent: recommendedRent,
        nextSteps: [
          'Profile completed successfully',
          'You can now browse compatible roommates',
          'Check your email for verification instructions'
        ]
      }
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    
    // Handle MongoDB duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(409).json({
        success: false,
        message: `A user with this ${field.includes('email') ? 'email' : 'username'} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile/:userId
// @access  Public (in production, this should be protected)
const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
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
        recommendedRent: user.getRecommendedRent()
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
// @route   PUT /api/users/profile/:userId
// @access  Public (in production, this should be protected)
const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { ...updates, 'metadata.lastLogin': new Date() },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
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
// @route   GET /api/users/compatible/:userId
// @access  Public (in production, this should be protected)
const findCompatibleRoommates = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, minScore = 50 } = req.query;

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find users with overlapping locations
    const userLocationIds = currentUser.housingInfo.selectedLocations.map(loc => loc.id);
    
    const potentialMatches = await User.find({
      _id: { $ne: userId },
      'metadata.isActive': true,
      'housingInfo.selectedLocations.id': { $in: userLocationIds }
    }).limit(parseInt(limit) * 2); // Get more to filter by compatibility

    // Calculate compatibility scores
    const compatibleUsers = potentialMatches
      .map(user => ({
        user: user,
        compatibilityScore: currentUser.getCompatibilityScore(user),
        commonLocations: user.housingInfo.selectedLocations.filter(
          loc => userLocationIds.includes(loc.id)
        ).length
      }))
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

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Public
const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ 'metadata.isActive': true });
    const recentUsers = await User.countDocuments({
      'metadata.registrationDate': { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    // Popular locations
    const locationStats = await User.aggregate([
      { $unwind: '$housingInfo.selectedLocations' },
      { 
        $group: { 
          _id: '$housingInfo.selectedLocations.borough', 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Popular occupations
    const occupationStats = await User.aggregate([
      { 
        $group: { 
          _id: '$professionalInfo.occupation', 
          count: { $sum: 1 } 
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeUsers,
          recentUsers,
          registrationRate: ((recentUsers / 7) * 100).toFixed(1) + '% per day'
        },
        popularLocations: locationStats,
        popularOccupations: occupationStats,
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

module.exports = {
  registerUser,
  getUserProfile,
  updateUserProfile,
  findCompatibleRoommates,
  getUserStats
};