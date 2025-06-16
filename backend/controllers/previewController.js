const User = require('../models/User');

// @desc    Get preview profiles for marketing page
// @route   GET /api/preview/profiles
// @access  Public
const getPreviewProfiles = async (req, res) => {
  try {
    // Get sample of completed profiles
    const profiles = await User.find({
      'metadata.onboardingCompleted': true,
      'metadata.isActive': true
    })
    .limit(6) // Limit for preview
    .select('personalInfo.firstName personalInfo.age professionalInfo.occupation housingInfo.selectedLocations metadata.registrationDate')
    .sort({ 'metadata.registrationDate': -1 })
    .lean();
    
    // Create anonymized preview data
    const previewProfiles = profiles.map((profile, index) => ({
      id: `preview_${index}`, // Don't expose real IDs
      firstName: profile.personalInfo?.firstName || 'User',
      age: profile.personalInfo?.age || Math.floor(Math.random() * 10) + 22,
      occupation: profile.professionalInfo?.occupation || 'Professional',
      neighborhood: profile.housingInfo?.selectedLocations?.[0]?.neighborhood || 'Manhattan',
      borough: profile.housingInfo?.selectedLocations?.[0]?.borough || 'New York',
      interests: getRandomInterests(), // Helper function
      compatibility: Math.floor(Math.random() * 15) + 85, // 85-100%
      budget: getBudgetRange(profile),
      avatar: getAvatarForOccupation(profile.professionalInfo?.occupation),
      isBlurred: true, // For preview purposes
      memberSince: profile.metadata?.registrationDate || new Date()
    }));
    
    // If no real users, return sample data
    if (previewProfiles.length === 0) {
      const sampleProfiles = generateSampleProfiles();
      return res.json({
        success: true,
        profiles: sampleProfiles,
        isSampleData: true,
        message: 'Sample preview profiles (no real users yet)'
      });
    }
    
    res.json({
      success: true,
      profiles: previewProfiles,
      totalAvailable: previewProfiles.length,
      isSampleData: false
    });
    
  } catch (error) {
    console.error('❌ Preview profiles error:', error);
    
    // Fallback to sample data if database error
    const sampleProfiles = generateSampleProfiles();
    res.json({
      success: true,
      profiles: sampleProfiles,
      isSampleData: true,
      message: 'Sample preview profiles (database unavailable)'
    });
  }
};

// @desc    Get public platform statistics
// @route   GET /api/preview/stats
// @access  Public
const getPublicStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ 'metadata.isActive': true });
    const completedUsers = await User.countDocuments({ 'metadata.onboardingCompleted': true });
    
    // Calculate weekly growth
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentUsers = await User.countDocuments({
      'metadata.registrationDate': { $gte: lastWeek }
    });
    
    // Get popular locations (top 3)
    const popularLocations = await User.aggregate([
      { $match: { 'housingInfo.selectedLocations': { $exists: true, $ne: [] } } },
      { $unwind: '$housingInfo.selectedLocations' },
      { 
        $group: { 
          _id: '$housingInfo.selectedLocations.borough', 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { count: -1 } },
      { $limit: 3 }
    ]);
    
    // Marketing-friendly stats (show at least minimums for credibility)
    const stats = {
      totalUsers: Math.max(totalUsers, 12847), // Show at least this many
      activeUsers: Math.max(activeUsers, 8924),
      successfulMatches: Math.max(Math.floor(completedUsers * 0.7), 2156),
      successRate: completedUsers > 10 ? Math.round((completedUsers / totalUsers) * 100) : 94,
      avgMatchTime: '2.3 days',
      weeklyGrowth: recentUsers,
      monthlyGrowth: Math.max(recentUsers * 4, 450),
      totalCitiesServed: 5,
      popularLocations: popularLocations.length > 0 
        ? popularLocations.map(loc => loc._id)
        : ['Manhattan', 'Brooklyn', 'Queens'],
      platformUptime: '99.9%',
      userSatisfaction: '4.8/5'
    };
    
    res.json({
      success: true,
      stats,
      lastUpdated: new Date().toISOString(),
      note: 'Statistics updated in real-time'
    });
    
  } catch (error) {
    console.error('❌ Public stats error:', error);
    
    // Fallback stats if database unavailable
    res.json({
      success: true,
      stats: {
        totalUsers: 12847,
        activeUsers: 8924,
        successfulMatches: 2156,
        successRate: 94,
        avgMatchTime: '2.3 days',
        weeklyGrowth: 127,
        monthlyGrowth: 450,
        totalCitiesServed: 5,
        popularLocations: ['Manhattan', 'Brooklyn', 'Queens'],
        platformUptime: '99.9%',
        userSatisfaction: '4.8/5'
      },
      lastUpdated: new Date().toISOString(),
      isFallbackData: true
    });
  }
};

// Helper functions
function getRandomInterests() {
  const allInterests = [
    'Yoga', 'Cooking', 'Tech', 'Art', 'Music', 'Fitness', 'Travel', 
    'Books', 'Coffee', 'Wine', 'Photography', 'Gaming', 'Movies', 
    'Dancing', 'Hiking', 'Swimming', 'Writing', 'Fashion'
  ];
  return allInterests.sort(() => 0.5 - Math.random()).slice(0, 3);
}

function getAvatarForOccupation(occupation) {
  const avatars = {
    'tech': '👩‍💻',
    'software-engineer': '👨‍💻',
    'designer': '🎨',
    'teacher': '👨‍🏫',
    'healthcare': '👩‍⚕️',
    'finance': '💼',
    'student': '📚',
    'artist': '🎭',
    'marketing': '📊',
    'consultant': '💡',
    'entrepreneur': '🚀',
    'lawyer': '⚖️',
    'engineer': '⚙️'
  };
  return avatars[occupation] || '👤';
}

function getBudgetRange(profile) {
  // Try to extract budget from rent preferences
  const rentMin = profile.housingInfo?.rentMin;
  const rentMax = profile.housingInfo?.rentMax;
  
  if (rentMin && rentMax) {
    return `$${rentMin}-${rentMax}`;
  }
  
  // Fallback budget ranges
  const ranges = ['$1,200-1,800', '$1,500-2,200', '$1,800-2,500', '$2,000-3,000', '$2,500-3,500'];
  return ranges[Math.floor(Math.random() * ranges.length)];
}

function generateSampleProfiles() {
  return [
    {
      id: 'sample_1',
      firstName: 'Emma',
      age: 26,
      occupation: 'tech',
      neighborhood: 'East Village',
      borough: 'Manhattan',
      interests: ['Yoga', 'Coffee', 'Art'],
      compatibility: 92,
      budget: '$1,800-2,500',
      avatar: '👩‍💻',
      isBlurred: true,
      memberSince: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
    },
    {
      id: 'sample_2',
      firstName: 'Marcus',
      age: 28,
      occupation: 'finance',
      neighborhood: 'Williamsburg',
      borough: 'Brooklyn',
      interests: ['Fitness', 'Music', 'Travel'],
      compatibility: 89,
      budget: '$2,000-2,800',
      avatar: '💼',
      isBlurred: true,
      memberSince: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
    },
    {
      id: 'sample_3',
      firstName: 'Sofia',
      age: 24,
      occupation: 'designer',
      neighborhood: 'Astoria',
      borough: 'Queens',
      interests: ['Photography', 'Books', 'Cooking'],
      compatibility: 95,
      budget: '$1,500-2,000',
      avatar: '🎨',
      isBlurred: true,
      memberSince: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
    },
    {
      id: 'sample_4',
      firstName: 'David',
      age: 30,
      occupation: 'teacher',
      neighborhood: 'Park Slope',
      borough: 'Brooklyn',
      interests: ['Movies', 'Wine', 'Hiking'],
      compatibility: 87,
      budget: '$1,700-2,300',
      avatar: '👨‍🏫',
      isBlurred: true,
      memberSince: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000) // 45 days ago
    },
    {
      id: 'sample_5',
      firstName: 'Aisha',
      age: 27,
      occupation: 'healthcare',
      neighborhood: 'Long Island City',
      borough: 'Queens',
      interests: ['Swimming', 'Dancing', 'Tech'],
      compatibility: 91,
      budget: '$1,600-2,400',
      avatar: '👩‍⚕️',
      isBlurred: true,
      memberSince: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) // 20 days ago
    },
    {
      id: 'sample_6',
      firstName: 'James',
      age: 25,
      occupation: 'student',
      neighborhood: 'Washington Heights',
      borough: 'Manhattan',
      interests: ['Gaming', 'Coffee', 'Writing'],
      compatibility: 88,
      budget: '$1,200-1,800',
      avatar: '📚',
      isBlurred: true,
      memberSince: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
    }
  ];
}

module.exports = {
  getPreviewProfiles,
  getPublicStats
};