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
      required: true,
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
      required: true,
      // Encrypted SSN storage in production
    },
    age: {
      type: Number,
      required: true,
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
      ]
    }
  },

  // Housing Information
  housingInfo: {
    selectedLocations: [{
      borough: {
        type: String,
        required: true
      },
      neighborhood: {
        type: String,
        required: true
      },
      id: {
        type: String,
        required: true
      }
    }],
    maxDistanceToMetro: {
      type: String,
      required: true,
      enum: ['5', '10', '15', 'no-preference']
    },
    moveInDate: {
      type: Date,
      required: true
    },
    rentDuration: {
      type: String,
      required: true
    }
  },

  // Professional Information
  professionalInfo: {
    occupation: {
      type: String,
      required: true,
      enum: [
        'tech', 'finance', 'healthcare', 'education', 'legal',
        'media', 'arts', 'hospitality', 'retail', 'real-estate',
        'construction', 'government', 'non-profit', 'student',
        'unemployed', 'other'
      ]
    },
    annualIncome: {
      type: Number,
      required: true,
      min: 0
    },
    languages: [{
      type: String,
      required: true,
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
      required: true,
      enum: ['no', 'will-have', 'yes']
    },
    pets: {
      type: String,
      required: true,
      enum: ['no', 'will-have', 'yes']
    },
    smoking: {
      type: String,
      required: true,
      enum: ['no', 'sometimes', 'often']
    },
    drinking: {
      type: String,
      required: true,
      enum: ['no', 'sometimes', 'often']
    },
    weed: {
      type: String,
      required: true,
      enum: ['no', 'sometimes', 'often']
    },
    drugs: {
      type: String,
      required: true,
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
      default: true
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

// Indexes for better query performance
userSchema.index({ 'account.email': 1 });
userSchema.index({ 'account.username': 1 });
userSchema.index({ 'housingInfo.selectedLocations.borough': 1 });
userSchema.index({ 'housingInfo.selectedLocations.neighborhood': 1 });
userSchema.index({ 'professionalInfo.occupation': 1 });
userSchema.index({ 'metadata.registrationDate': -1 });

module.exports = mongoose.model('User', userSchema);