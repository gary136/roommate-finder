const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Account Information
  account: {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 8
    },
    phoneNumber: {
      type: String,
      required: false,
      trim: true
    }
  },

  // Personal Information
  personalInfo: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    ssn: {
      type: String,
      required: false,
      // Encrypted SSN storage in production
    },
    age: {
      type: Number,
      required: false,
      min: 18,
      max: 100
    },
    sex: [{
      type: String,
      enum: ['male', 'female'],
      required: true
    }],
    ethnicity: {
      type: String,
      enum: [
        'asian', 'black', 'hispanic', 'white', 'middle-eastern',
        'native-american', 'pacific-islander', 'mixed', 'other', 'prefer-not-say'
      ],
      required: false
    }
  },

  // Housing Information
  housingInfo: {
    selectedLocations: [{
      borough: {
        type: String,
        required: false
      },
      neighborhood: {
        type: String,
        required: false
      },
      id: {
        type: String,
        required: false
      }
    }],    
    // NEW: Rent preferences
    rentPreferences: {
      minRent: {
        type: Number,
        required: false,
        min: 0
      },
      maxRent: {
        type: Number,
        required: false,
        min: 0
      }
    },
    // Housing situation (new field)
    housingSituation: { 
        type: String, 
        enum: ['looking', 'have-apartment', 'flexible'],
        required: false 
    },
    maxDistanceToMetro: {
      type: String,
      required: false,
      enum: ['5', '10', '15', 'no-preference']
    },
    moveInDate: {
      type: Date,
      required: false
    },
    rentDuration: {
        type: Number,  // Change from String to Number
        required: false,
        min: [3, 'Minimum rental duration is 3 months'],
        max: [60, 'Maximum rental duration is 60 months'],
        validate: {
          validator: function(value) {
            return Number.isInteger(value);
          },
          message: 'Rental duration must be a whole number of months'
        }
      },
  },

  // Professional Information
  professionalInfo: {
    occupation: {
      type: String,
      required: false,
      enum: [
        'tech', 'finance', 'healthcare', 'education', 'legal',
        'media', 'arts', 'hospitality', 'retail', 'real-estate',
        'construction', 'government', 'non-profit', 'student',
        'unemployed', 'other'
      ]
    },
    annualIncome: {
      type: Number,
      required: false,
      min: 0
    },
    languages: [{
      type: String,
      required: false,
      enum: [
        'english', 'spanish', 'chinese', 'cantonese', 'russian',
        'korean', 'bengali', 'hindi', 'french', 'arabic',
        'hebrew', 'italian', 'portuguese', 'japanese', 'polish',
        'german', 'urdu', 'tagalog', 'vietnamese', 'other'
      ]
    }]
  },

  // Lifestyle Preferences
  lifestyle: {
    children: {
      type: String,
      required: false,
      enum: ['no', 'will-have', 'yes']
    },
    pets: {
      type: String,
      required: false,
      enum: ['no', 'will-have', 'yes']
    },
    smoking: {
      type: String,
      required: false,
      enum: ['no', 'sometimes', 'often']
    },
    drinking: {
      type: String,
      required: false,
      enum: ['no', 'sometimes', 'often']
    },
    weed: {
      type: String,
      required: false,
      enum: ['no', 'sometimes', 'often']
    },
    drugs: {
      type: String,
      required: false,
      enum: ['no', 'sometimes', 'often']
    }
  },

  // Optional Demographics
  demographics: {
    religion: {
      type: String,
      enum: [
        'christianity', 'judaism', 'islam', 'hinduism', 'buddhism',
        'atheist', 'agnostic', 'spiritual', 'other', 'prefer-not-say'
      ]
    },
    sexualOrientation: {
      type: String,
      enum: [
        'straight', 'gay', 'bisexual', 'pansexual', 'asexual',
        'queer', 'other', 'prefer-not-say'
      ]
    },
    political: {
      type: String,
      enum: [
        'very-liberal', 'liberal', 'moderate', 'conservative',
        'very-conservative', 'libertarian', 'apolitical', 'other', 'prefer-not-say'
      ]
    }
  },

  // Metadata
  metadata: {
    profileCompleted: {
      type: Boolean,
      default: false
    },
    // NEW: Onboarding tracking fields
    onboardingCompleted: {
      type: Boolean,
      default: false
    },
    profileCompleteness: {
      type: Number,
      default: 25,      // 25% for basic signup
      min: 0,
      max: 100
    },
    onboardingStep: {
      type: Number,
      default: 0
    },
    onboardingCompletedAt: {
      type: Date
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLogin: {
      type: Date,
      default: Date.now
    },
    registrationDate: {
      type: Date,
      default: Date.now
    },
    ipAddress: String,
    userAgent: String
  }
}, {
  timestamps: true,
  toJSON: { 
    transform: function(doc, ret) {
      delete ret.account.password;
      delete ret.personalInfo.ssn;
      return ret;
    }
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('account.password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.account.password = await bcrypt.hash(this.account.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.account.password);
};

// Calculate recommended rent based on income
userSchema.methods.getRecommendedRent = function() {
  return Math.floor((this.professionalInfo.annualIncome * 0.3) / 12);
};

// Get compatibility score with another user
userSchema.methods.getCompatibilityScore = function(otherUser) {
  let score = 0;
  const weights = {
    lifestyle: 0.4,
    location: 0.3,
    demographics: 0.2,
    professional: 0.1
  };

  // Lifestyle compatibility
  const lifestyleMatch = this.calculateLifestyleMatch(otherUser);
  score += lifestyleMatch * weights.lifestyle;

  // Location compatibility
  const locationMatch = this.calculateLocationMatch(otherUser);
  score += locationMatch * weights.location;

  return Math.round(score * 100);
};

userSchema.methods.calculateLifestyleMatch = function(otherUser) {
  const lifestyleFields = ['children', 'pets', 'smoking', 'drinking', 'weed', 'drugs'];
  let matches = 0;
  
  lifestyleFields.forEach(field => {
    if (this.lifestyle[field] === otherUser.lifestyle[field]) {
      matches++;
    }
  });
  
  return matches / lifestyleFields.length;
};

userSchema.methods.calculateLocationMatch = function(otherUser) {
  const myLocations = this.housingInfo.selectedLocations.map(loc => loc.id);
  const theirLocations = otherUser.housingInfo.selectedLocations.map(loc => loc.id);
  
  const commonLocations = myLocations.filter(loc => theirLocations.includes(loc));
  const totalUniqueLocations = new Set([...myLocations, ...theirLocations]).size;
  
  return commonLocations.length / totalUniqueLocations;
};

// ========================================
// NEW METHODS for onboarding tracking
// ========================================

// Calculate profile completeness
userSchema.methods.calculateCompleteness = function() {
  let completeness = 35; // ⬅️ UPDATED: Higher base due to required username + sex
  
  // Account info
  if (this.account.phoneNumber) completeness += 5;
  
  // Personal info
  if (this.personalInfo.age) completeness += 10;
  
  // Housing info
  if (this.housingInfo.selectedLocations && this.housingInfo.selectedLocations.length > 0) completeness += 15;
  if (this.housingInfo.housingSituation) completeness += 10;
  if (this.housingInfo.rentPreferences && this.housingInfo.rentPreferences.minRent && this.housingInfo.rentPreferences.maxRent) completeness += 10;
  
  // Professional info
  if (this.professionalInfo.occupation) completeness += 5;
  if (this.professionalInfo.languages && this.professionalInfo.languages.length > 0) completeness += 5;
  if (this.professionalInfo.annualIncome) completeness += 5;
  
  // Lifestyle
  const lifestyleFields = ['children', 'pets', 'smoking', 'drinking'];
  const completedLifestyle = lifestyleFields.filter(field => this.lifestyle[field]).length;
  completeness += (completedLifestyle / lifestyleFields.length) * 15;
  
  return Math.min(completeness, 100);
};

// Get budget range as string (for frontend compatibility)
userSchema.methods.getBudgetRange = function() {
  if (this.housingInfo.rentPreferences && 
      this.housingInfo.rentPreferences.minRent && 
      this.housingInfo.rentPreferences.maxRent) {
    return `$${this.housingInfo.rentPreferences.minRent.toLocaleString()}-${this.housingInfo.rentPreferences.maxRent.toLocaleString()}`;
  }
  return null;
};

// Check if user can see full profiles
userSchema.methods.canViewFullProfiles = function() {
  return this.metadata.onboardingCompleted;
};

// Get user's selected neighborhoods as simple array (for frontend)
userSchema.methods.getSelectedNeighborhoods = function() {
  return this.housingInfo.selectedLocations.map(loc => ({
    value: loc.id,
    label: `${loc.neighborhood}, ${loc.borough}`,
    borough: loc.borough,
    neighborhood: loc.neighborhood
  }));
};

// Indexes for better query performance
userSchema.index({ 'account.email': 1 });
userSchema.index({ 'account.username': 1 });
userSchema.index({ 'housingInfo.selectedLocations.borough': 1 });
userSchema.index({ 'housingInfo.selectedLocations.neighborhood': 1 });
userSchema.index({ 'professionalInfo.occupation': 1 });
userSchema.index({ 'metadata.registrationDate': -1 });

// NEW: Add indexes for onboarding tracking
userSchema.index({ 'metadata.onboardingCompleted': 1 });
userSchema.index({ 'metadata.profileCompleteness': 1 });

module.exports = mongoose.model('User', userSchema);