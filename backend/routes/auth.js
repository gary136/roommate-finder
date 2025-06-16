const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();
// Add this after const router = express.Router();
router.get('/', (req, res) => {
  res.json({
    message: 'RoomieMatch Auth API',
    version: '2.0.0',
    endpoints: {
      'POST /api/auth/quick-signup': 'Create new user account with minimal fields',
      'POST /api/auth/login': 'Authenticate user and get JWT token',
      'GET /api/auth/onboarding-status': 'Get user onboarding progress (requires auth)',
      'POST /api/auth/onboarding/housing': 'Update housing preferences (requires auth)',
      'POST /api/auth/onboarding/lifestyle': 'Update lifestyle preferences (requires auth)',
      'POST /api/auth/onboarding/professional': 'Update professional info (requires auth)',
      'POST /api/auth/onboarding/complete': 'Complete onboarding process (requires auth)',
      'GET /api/auth/me': 'Get current user profile (requires auth)'
    },
    authentication: 'Include "Authorization: Bearer <token>" header for protected routes'
  });
});

// ========================================
// LOGIN ROUTE
// ========================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ 'account.email': email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.metadata.lastLogin = new Date();
    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.account.email,
        username: user.account.username,
        firstName: user.personalInfo.firstName,
        lastName: user.personalInfo.lastName,
        profileCompleteness: user.calculateCompleteness(),
        onboardingCompleted: user.metadata.onboardingCompleted
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========================================
// QUICK SIGNUP ROUTE
// ========================================
router.post('/quick-signup', async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      firstName,
      lastName,
      sex
    } = req.body;

    // Basic validation
    if (!username || !email || !password || !firstName || !lastName || !sex) {
      return res.status(400).json({ 
        message: 'All fields are required',
        required: ['username', 'email', 'password', 'firstName', 'lastName', 'sex']
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { 'account.email': email },
        { 'account.username': username }
      ]
    });

    if (existingUser) {
      const field = existingUser.account.email === email ? 'email' : 'username';
      return res.status(400).json({ 
        message: `User with this ${field} already exists`,
        field 
      });
    }

    // Validate sex field
    if (!['male', 'female'].includes(sex)) {
      return res.status(400).json({ 
        message: 'Invalid sex value. Must be "male" or "female"'
      });
    }

    // Create new user with minimal required fields
    const newUser = new User({
      account: {
        username: username.toLowerCase().trim(),
        email: email.toLowerCase().trim(),
        password: password
      },
      personalInfo: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        sex: [sex]
      },
      metadata: {
        profileCompleted: false,
        onboardingCompleted: false,
        onboardingStep: 0,
        profileCompleteness: 35, // Base completeness for required fields
        registrationDate: new Date(),
        lastLogin: new Date(),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    // Calculate actual completeness
    newUser.metadata.profileCompleteness = newUser.calculateCompleteness();

    // Save user
    await newUser.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: {
        id: newUser._id,
        username: newUser.account.username,
        email: newUser.account.email,
        firstName: newUser.personalInfo.firstName,
        lastName: newUser.personalInfo.lastName,
        sex: newUser.personalInfo.sex[0],
        profileCompleteness: newUser.metadata.profileCompleteness,
        onboardingCompleted: newUser.metadata.onboardingCompleted,
        onboardingStep: newUser.metadata.onboardingStep
      },
      nextStep: {
        step: 1,
        title: 'Tell us about your housing preferences',
        description: 'Help us find the perfect roommates for you!'
      }
    });

  } catch (error) {
    console.error('Quick signup error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));
      return res.status(400).json({ 
        message: 'Validation failed',
        errors 
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const fieldName = field.includes('username') ? 'username' : 'email';
      return res.status(400).json({ 
        message: `User with this ${fieldName} already exists`,
        field: fieldName
      });
    }

    res.status(500).json({ message: 'Server error during signup' });
  }
});

// ========================================
// ONBOARDING STATUS ROUTE
// ========================================
router.get('/onboarding-status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const completeness = user.calculateCompleteness();
    
    res.json({
      currentStep: user.metadata.onboardingStep,
      completeness: completeness,
      onboardingCompleted: user.metadata.onboardingCompleted,
      profileCompleted: user.metadata.profileCompleted,
      nextStep: getNextOnboardingStep(user.metadata.onboardingStep, completeness)
    });

  } catch (error) {
    console.error('Onboarding status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========================================
// ONBOARDING STEP 1: HOUSING PREFERENCES
// ========================================
router.post('/onboarding/housing', auth, async (req, res) => {
  try {
    const {
      selectedLocations,
      housingSituation,
      rentMin,
      rentMax,
      moveInDate
    } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate locations
    if (!selectedLocations || !Array.isArray(selectedLocations) || selectedLocations.length === 0) {
      return res.status(400).json({ 
        message: 'At least one location is required',
        field: 'selectedLocations'
      });
    }

    // Update housing info
    user.housingInfo.selectedLocations = selectedLocations.map(loc => ({
      borough: loc.borough,
      neighborhood: loc.neighborhood,
      id: loc.id || `${loc.neighborhood.toLowerCase().replace(/\s+/g, '-')}-${loc.borough.toLowerCase()}`
    }));

    if (housingSituation) {
      user.housingInfo.housingSituation = housingSituation;
    }

    if (rentMin && rentMax) {
      user.housingInfo.rentPreferences = {
        minRent: parseInt(rentMin),
        maxRent: parseInt(rentMax)
      };
    }

    if (moveInDate) {
      user.housingInfo.moveInDate = new Date(moveInDate);
    }

    // Update onboarding progress
    user.metadata.onboardingStep = Math.max(user.metadata.onboardingStep, 1);
    user.metadata.profileCompleteness = user.calculateCompleteness();

    await user.save();

    res.json({
      message: 'Housing preferences updated!',
      completeness: user.metadata.profileCompleteness,
      currentStep: user.metadata.onboardingStep,
      nextStep: getNextOnboardingStep(user.metadata.onboardingStep, user.metadata.profileCompleteness)
    });

  } catch (error) {
    console.error('Housing onboarding error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========================================
// ONBOARDING STEP 2: LIFESTYLE PREFERENCES
// ========================================
router.post('/onboarding/lifestyle', auth, async (req, res) => {
  try {
    const {
      children,
      pets,
      smoking,
      drinking,
      weed,
      drugs
    } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update lifestyle preferences
    if (children) user.lifestyle.children = children;
    if (pets) user.lifestyle.pets = pets;
    if (smoking) user.lifestyle.smoking = smoking;
    if (drinking) user.lifestyle.drinking = drinking;
    if (weed) user.lifestyle.weed = weed;
    if (drugs) user.lifestyle.drugs = drugs;

    // Update onboarding progress
    user.metadata.onboardingStep = Math.max(user.metadata.onboardingStep, 2);
    user.metadata.profileCompleteness = user.calculateCompleteness();

    await user.save();

    res.json({
      message: 'Lifestyle preferences updated!',
      completeness: user.metadata.profileCompleteness,
      currentStep: user.metadata.onboardingStep,
      nextStep: getNextOnboardingStep(user.metadata.onboardingStep, user.metadata.profileCompleteness)
    });

  } catch (error) {
    console.error('Lifestyle onboarding error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========================================
// ONBOARDING STEP 3: PROFESSIONAL INFO
// ========================================
router.post('/onboarding/professional', auth, async (req, res) => {
  try {
    const {
      occupation,
      annualIncome,
      languages
    } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update professional info
    if (occupation) user.professionalInfo.occupation = occupation;
    if (annualIncome) user.professionalInfo.annualIncome = parseInt(annualIncome);
    if (languages && Array.isArray(languages)) user.professionalInfo.languages = languages;

    // Update onboarding progress
    user.metadata.onboardingStep = Math.max(user.metadata.onboardingStep, 3);
    user.metadata.profileCompleteness = user.calculateCompleteness();

    await user.save();

    res.json({
      message: 'Professional info updated!',
      completeness: user.metadata.profileCompleteness,
      currentStep: user.metadata.onboardingStep,
      nextStep: getNextOnboardingStep(user.metadata.onboardingStep, user.metadata.profileCompleteness)
    });

  } catch (error) {
    console.error('Professional onboarding error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========================================
// COMPLETE ONBOARDING
// ========================================
router.post('/onboarding/complete', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Mark onboarding as completed
    user.metadata.onboardingCompleted = true;
    user.metadata.onboardingCompletedAt = new Date();
    user.metadata.profileCompleteness = user.calculateCompleteness();

    // If completeness is high enough, mark profile as completed too
    if (user.metadata.profileCompleteness >= 80) {
      user.metadata.profileCompleted = true;
    }

    await user.save();

    res.json({
      message: 'Onboarding completed! Welcome to RoomieMatch!',
      completeness: user.metadata.profileCompleteness,
      onboardingCompleted: true,
      profileCompleted: user.metadata.profileCompleted,
      canViewProfiles: user.canViewFullProfiles()
    });

  } catch (error) {
    console.error('Complete onboarding error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========================================
// GET CURRENT USER
// ========================================
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-account.password -personalInfo.ssn');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      ...user.toJSON(),
      profileCompleteness: user.calculateCompleteness(),
      budgetRange: user.getBudgetRange(),
      selectedNeighborhoods: user.getSelectedNeighborhoods(),
      canViewFullProfiles: user.canViewFullProfiles()
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========================================
// HELPER FUNCTIONS
// ========================================
function getNextOnboardingStep(currentStep, completeness) {
  const steps = [
    {
      step: 0,
      title: 'Welcome!',
      description: 'Let\'s set up your profile step by step.',
      route: '/onboarding/housing'
    },
    {
      step: 1,
      title: 'Housing Preferences',
      description: 'Tell us where you want to live and your budget.',
      route: '/onboarding/lifestyle'
    },
    {
      step: 2,
      title: 'Lifestyle',
      description: 'Help us match you with compatible roommates.',
      route: '/onboarding/professional'
    },
    {
      step: 3,
      title: 'Professional Info',
      description: 'Almost done! Tell us about your work and income.',
      route: '/onboarding/complete'
    }
  ];

  if (currentStep >= 3 || completeness >= 75) {
    return {
      step: 'complete',
      title: 'Profile Complete!',
      description: 'You can now browse and match with roommates.',
      route: '/dashboard'
    };
  }

  return steps[currentStep + 1] || steps[0];
}

module.exports = router;