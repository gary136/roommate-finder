const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();
// Root route for onboarding endpoints
router.get('/', (req, res) => {
  res.json({
    message: 'RoomieMatch Onboarding API',
    version: '2.0.0',
    endpoints: {
      'GET /api/onboarding/step/:stepNumber': 'Get onboarding step data (requires auth)',
      'PUT /api/onboarding/update': 'Update user data for any onboarding step (requires auth)',
      'POST /api/onboarding/skip/:stepNumber': 'Skip onboarding step (requires auth)',
      'GET /api/onboarding/progress': 'Get detailed progress breakdown (requires auth)',
      'POST /api/onboarding/force-complete': 'Force complete onboarding - for testing (requires auth)'
    },
    authentication: 'Include "Authorization: Bearer <token>" header for all routes',
    steps: {
      1: 'Housing Preferences',
      2: 'Lifestyle Preferences', 
      3: 'Professional Information'
    }
  });
});

// ========================================
// ONBOARDING FLOW ROUTES
// ========================================

// Get onboarding data for current step
router.get('/step/:stepNumber', auth, async (req, res) => {
  try {
    const { stepNumber } = req.params;
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const stepData = getOnboardingStepData(parseInt(stepNumber), user);
    
    res.json({
      step: parseInt(stepNumber),
      currentUserStep: user.metadata.onboardingStep,
      completeness: user.calculateCompleteness(),
      ...stepData
    });

  } catch (error) {
    console.error('Get onboarding step error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user data for any onboarding step
router.put('/update', auth, async (req, res) => {
  try {
    const { step, data } = req.body;
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user data based on step
    const updateResult = await updateUserForStep(user, step, data);
    
    if (!updateResult.success) {
      return res.status(400).json({ 
        message: updateResult.message,
        errors: updateResult.errors
      });
    }

    // Update onboarding progress
    user.metadata.onboardingStep = Math.max(user.metadata.onboardingStep, step);
    user.metadata.profileCompleteness = user.calculateCompleteness();

    await user.save();

    // Check if onboarding should be completed
    const shouldComplete = shouldCompleteOnboarding(user);
    if (shouldComplete && !user.metadata.onboardingCompleted) {
      user.metadata.onboardingCompleted = true;
      user.metadata.onboardingCompletedAt = new Date();
      await user.save();
    }

    res.json({
      message: 'Profile updated successfully!',
      currentStep: user.metadata.onboardingStep,
      completeness: user.metadata.profileCompleteness,
      onboardingCompleted: user.metadata.onboardingCompleted,
      nextStep: getNextStep(user.metadata.onboardingStep, user.metadata.profileCompleteness),
      canViewProfiles: user.canViewFullProfiles()
    });

  } catch (error) {
    console.error('Update onboarding error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Skip current step (optional data)
router.post('/skip/:stepNumber', auth, async (req, res) => {
  try {
    const { stepNumber } = req.params;
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const step = parseInt(stepNumber);
    user.metadata.onboardingStep = Math.max(user.metadata.onboardingStep, step);
    user.metadata.profileCompleteness = user.calculateCompleteness();

    await user.save();

    res.json({
      message: `Step ${step} skipped`,
      currentStep: user.metadata.onboardingStep,
      completeness: user.metadata.profileCompleteness,
      nextStep: getNextStep(user.metadata.onboardingStep, user.metadata.profileCompleteness)
    });

  } catch (error) {
    console.error('Skip step error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get profile progress summary
router.get('/progress', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const progress = calculateDetailedProgress(user);

    res.json({
      overall: user.calculateCompleteness(),
      onboardingCompleted: user.metadata.onboardingCompleted,
      currentStep: user.metadata.onboardingStep,
      breakdown: progress,
      recommendations: getCompletionRecommendations(user)
    });

  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Force complete onboarding (for testing or admin)
router.post('/force-complete', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.metadata.onboardingCompleted = true;
    user.metadata.onboardingCompletedAt = new Date();
    user.metadata.onboardingStep = 3; // Max step
    
    await user.save();

    res.json({
      message: 'Onboarding force completed!',
      onboardingCompleted: true,
      canViewProfiles: user.canViewFullProfiles()
    });

  } catch (error) {
    console.error('Force complete error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========================================
// HELPER FUNCTIONS
// ========================================

function getOnboardingStepData(stepNumber, user) {
  const steps = {
    1: {
      title: 'Housing Preferences',
      description: 'Tell us where you want to live and your housing situation',
      fields: ['selectedLocations', 'housingSituation', 'rentPreferences', 'moveInDate'],
      currentData: {
        selectedLocations: user.housingInfo.selectedLocations || [],
        housingSituation: user.housingInfo.housingSituation || '',
        rentMin: user.housingInfo.rentPreferences?.minRent || '',
        rentMax: user.housingInfo.rentPreferences?.maxRent || '',
        moveInDate: user.housingInfo.moveInDate || ''
      },
      validation: {
        required: ['selectedLocations'],
        optional: ['housingSituation', 'rentMin', 'rentMax', 'moveInDate']
      }
    },
    2: {
      title: 'Lifestyle Preferences',
      description: 'Help us match you with compatible roommates',
      fields: ['children', 'pets', 'smoking', 'drinking', 'weed', 'drugs'],
      currentData: {
        children: user.lifestyle.children || '',
        pets: user.lifestyle.pets || '',
        smoking: user.lifestyle.smoking || '',
        drinking: user.lifestyle.drinking || '',
        weed: user.lifestyle.weed || '',
        drugs: user.lifestyle.drugs || ''
      },
      validation: {
        required: ['children', 'pets', 'smoking', 'drinking'],
        optional: ['weed', 'drugs']
      }
    },
    3: {
      title: 'Professional Information',
      description: 'Tell us about your work and income',
      fields: ['occupation', 'annualIncome', 'languages'],
      currentData: {
        occupation: user.professionalInfo.occupation || '',
        annualIncome: user.professionalInfo.annualIncome || '',
        languages: user.professionalInfo.languages || []
      },
      validation: {
        required: ['occupation'],
        optional: ['annualIncome', 'languages']
      }
    }
  };

  return steps[stepNumber] || {
    title: 'Unknown Step',
    description: 'Invalid step number',
    fields: [],
    currentData: {},
    validation: { required: [], optional: [] }
  };
}

async function updateUserForStep(user, step, data) {
  try {
    switch (step) {
      case 1: // Housing
        return updateHousingInfo(user, data);
      case 2: // Lifestyle  
        return updateLifestyleInfo(user, data);
      case 3: // Professional
        return updateProfessionalInfo(user, data);
      default:
        return { success: false, message: 'Invalid step number' };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
}

function updateHousingInfo(user, data) {
  const errors = [];

  // Validate and update selected locations
  if (data.selectedLocations) {
    if (!Array.isArray(data.selectedLocations) || data.selectedLocations.length === 0) {
      errors.push({ field: 'selectedLocations', message: 'At least one location is required' });
    } else {
      user.housingInfo.selectedLocations = data.selectedLocations.map(loc => ({
        borough: loc.borough,
        neighborhood: loc.neighborhood,
        id: loc.id || `${loc.neighborhood.toLowerCase().replace(/\s+/g, '-')}-${loc.borough.toLowerCase()}`
      }));
    }
  }

  // Update housing situation
  if (data.housingSituation) {
    const validSituations = ['looking', 'have-apartment', 'flexible'];
    if (validSituations.includes(data.housingSituation)) {
      user.housingInfo.housingSituation = data.housingSituation;
    } else {
      errors.push({ field: 'housingSituation', message: 'Invalid housing situation' });
    }
  }

  // Update rent preferences
  if (data.rentMin || data.rentMax) {
    if (!user.housingInfo.rentPreferences) {
      user.housingInfo.rentPreferences = {};
    }
    if (data.rentMin) user.housingInfo.rentPreferences.minRent = parseInt(data.rentMin);
    if (data.rentMax) user.housingInfo.rentPreferences.maxRent = parseInt(data.rentMax);
  }

  // Update move-in date
  if (data.moveInDate) {
    user.housingInfo.moveInDate = new Date(data.moveInDate);
  }

  return errors.length > 0 
    ? { success: false, message: 'Validation failed', errors }
    : { success: true };
}

function updateLifestyleInfo(user, data) {
  const errors = [];
  const validOptions = {
    children: ['no', 'will-have', 'yes'],
    pets: ['no', 'will-have', 'yes'],
    smoking: ['no', 'sometimes', 'often'],
    drinking: ['no', 'sometimes', 'often'],
    weed: ['no', 'sometimes', 'often'],
    drugs: ['no', 'sometimes', 'often']
  };

  Object.keys(validOptions).forEach(field => {
    if (data[field]) {
      if (validOptions[field].includes(data[field])) {
        user.lifestyle[field] = data[field];
      } else {
        errors.push({ field, message: `Invalid value for ${field}` });
      }
    }
  });

  return errors.length > 0 
    ? { success: false, message: 'Validation failed', errors }
    : { success: true };
}

function updateProfessionalInfo(user, data) {
  const errors = [];
  const validOccupations = [
    'tech', 'finance', 'healthcare', 'education', 'legal',
    'media', 'arts', 'hospitality', 'retail', 'real-estate',
    'construction', 'government', 'non-profit', 'student',
    'unemployed', 'other'
  ];

  // Update occupation
  if (data.occupation) {
    if (validOccupations.includes(data.occupation)) {
      user.professionalInfo.occupation = data.occupation;
    } else {
      errors.push({ field: 'occupation', message: 'Invalid occupation' });
    }
  }

  // Update annual income
  if (data.annualIncome) {
    const income = parseInt(data.annualIncome);
    if (income >= 0) {
      user.professionalInfo.annualIncome = income;
    } else {
      errors.push({ field: 'annualIncome', message: 'Income must be a positive number' });
    }
  }

  // Update languages
  if (data.languages && Array.isArray(data.languages)) {
    user.professionalInfo.languages = data.languages;
  }

  return errors.length > 0 
    ? { success: false, message: 'Validation failed', errors }
    : { success: true };
}

function shouldCompleteOnboarding(user) {
  // Complete onboarding if user has finished step 2 and has basic info
  return user.metadata.onboardingStep >= 2 && 
         user.housingInfo.selectedLocations?.length > 0 &&
         user.lifestyle.children &&
         user.lifestyle.pets;
}

function getNextStep(currentStep, completeness) {
  if (completeness >= 75 || currentStep >= 3) {
    return {
      step: 'complete',
      title: 'Profile Complete!',
      description: 'You can now browse and match with roommates.',
      action: 'Go to Dashboard'
    };
  }

  const steps = [
    { step: 1, title: 'Housing Preferences', description: 'Where do you want to live?' },
    { step: 2, title: 'Lifestyle', description: 'Tell us about your lifestyle' },
    { step: 3, title: 'Professional Info', description: 'Work and income information' }
  ];

  return steps[currentStep] || steps[0];
}

function calculateDetailedProgress(user) {
  return {
    account: {
      completed: 100, // Always complete after signup
      fields: {
        username: !!user.account.username,
        email: !!user.account.email,
        phoneNumber: !!user.account.phoneNumber
      }
    },
    personal: {
      completed: calculateSectionCompleteness(user, 'personal'),
      fields: {
        firstName: !!user.personalInfo.firstName,
        lastName: !!user.personalInfo.lastName,
        sex: !!user.personalInfo.sex?.length,
        age: !!user.personalInfo.age
      }
    },
    housing: {
      completed: calculateSectionCompleteness(user, 'housing'),
      fields: {
        selectedLocations: !!user.housingInfo.selectedLocations?.length,
        housingSituation: !!user.housingInfo.housingSituation,
        rentPreferences: !!(user.housingInfo.rentPreferences?.minRent && user.housingInfo.rentPreferences?.maxRent),
        moveInDate: !!user.housingInfo.moveInDate
      }
    },
    professional: {
      completed: calculateSectionCompleteness(user, 'professional'),
      fields: {
        occupation: !!user.professionalInfo.occupation,
        annualIncome: !!user.professionalInfo.annualIncome,
        languages: !!user.professionalInfo.languages?.length
      }
    },
    lifestyle: {
      completed: calculateSectionCompleteness(user, 'lifestyle'),
      fields: {
        children: !!user.lifestyle.children,
        pets: !!user.lifestyle.pets,
        smoking: !!user.lifestyle.smoking,
        drinking: !!user.lifestyle.drinking,
        weed: !!user.lifestyle.weed,
        drugs: !!user.lifestyle.drugs
      }
    }
  };
}

function calculateSectionCompleteness(user, section) {
  switch (section) {
    case 'personal':
      const personalFields = ['firstName', 'lastName', 'sex', 'age'];
      const completedPersonal = personalFields.filter(field => {
        if (field === 'sex') return user.personalInfo.sex?.length > 0;
        return !!user.personalInfo[field];
      }).length;
      return Math.round((completedPersonal / personalFields.length) * 100);

    case 'housing':
      let housingScore = 0;
      if (user.housingInfo.selectedLocations?.length > 0) housingScore += 40;
      if (user.housingInfo.housingSituation) housingScore += 20;
      if (user.housingInfo.rentPreferences?.minRent && user.housingInfo.rentPreferences?.maxRent) housingScore += 30;
      if (user.housingInfo.moveInDate) housingScore += 10;
      return housingScore;

    case 'professional':
      let professionalScore = 0;
      if (user.professionalInfo.occupation) professionalScore += 50;
      if (user.professionalInfo.annualIncome) professionalScore += 30;
      if (user.professionalInfo.languages?.length > 0) professionalScore += 20;
      return professionalScore;

    case 'lifestyle':
      const lifestyleFields = ['children', 'pets', 'smoking', 'drinking'];
      const completedLifestyle = lifestyleFields.filter(field => !!user.lifestyle[field]).length;
      return Math.round((completedLifestyle / lifestyleFields.length) * 100);

    default:
      return 0;
  }
}

function getCompletionRecommendations(user) {
  const recommendations = [];

  // Housing recommendations
  if (!user.housingInfo.selectedLocations?.length) {
    recommendations.push({
      section: 'housing',
      priority: 'high',
      message: 'Add your preferred neighborhoods to find compatible roommates nearby',
      action: 'Add locations'
    });
  }

  // Lifestyle recommendations
  const lifestyleFields = ['children', 'pets', 'smoking', 'drinking'];
  const missingLifestyle = lifestyleFields.filter(field => !user.lifestyle[field]);
  if (missingLifestyle.length > 0) {
    recommendations.push({
      section: 'lifestyle',
      priority: 'high',
      message: `Complete your lifestyle preferences (${missingLifestyle.join(', ')}) for better matches`,
      action: 'Update lifestyle'
    });
  }

  // Professional recommendations
  if (!user.professionalInfo.occupation) {
    recommendations.push({
      section: 'professional',
      priority: 'medium',
      message: 'Add your occupation to help roommates understand your schedule',
      action: 'Add occupation'
    });
  }

  if (!user.professionalInfo.annualIncome) {
    recommendations.push({
      section: 'professional',
      priority: 'medium',
      message: 'Adding income helps with rent affordability matching',
      action: 'Add income'
    });
  }

  // Personal recommendations
  if (!user.personalInfo.age) {
    recommendations.push({
      section: 'personal',
      priority: 'low',
      message: 'Add your age for age-compatible roommate matching',
      action: 'Add age'
    });
  }

  return recommendations;
}

module.exports = router;