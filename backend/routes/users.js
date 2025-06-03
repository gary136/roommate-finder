const express = require('express');
const { body } = require('express-validator');
const {
  registerUser,
  getUserProfile,
  updateUserProfile,
  findCompatibleRoommates,
  getUserStats
} = require('../controllers/userController');

const router = express.Router();

// Validation rules for user registration
const registerValidation = [
  // Account Information
  body('account.username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('account.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('account.password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('account.phoneNumber')
    .matches(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/)
    .withMessage('Please provide a valid phone number'),

  // Personal Information
  body('personalInfo.firstName')
    .isLength({ min: 1, max: 50 })
    .trim()
    .withMessage('First name is required and must be less than 50 characters'),
  
  body('personalInfo.lastName')
    .isLength({ min: 1, max: 50 })
    .trim()
    .withMessage('Last name is required and must be less than 50 characters'),
  
  body('personalInfo.ssn')
    .matches(/^\d{3}-\d{2}-\d{4}$/)
    .withMessage('SSN must be in format XXX-XX-XXXX'),
  
  body('personalInfo.age')
    .isInt({ min: 18, max: 100 })
    .withMessage('Age must be between 18 and 100'),
  
  body('personalInfo.sex')
    .isArray({ min: 1 })
    .withMessage('Please select at least one sex option'),

  // Housing Information
  body('housingInfo.selectedLocations')
    .isArray({ min: 1, max: 5 })
    .withMessage('Please select between 1 and 5 locations'),
  
  // NEW: Rent preferences validation
  body('housingInfo.rentPreferences.minRent')
    .isInt({ min: 500, max: 10000 })
    .withMessage('Minimum rent must be between $500 and $10,000'),
  
  body('housingInfo.rentPreferences.maxRent')
    .isInt({ min: 500, max: 10000 })
    .withMessage('Maximum rent must be between $500 and $10,000')
    .custom((maxRent, { req }) => {
      const minRent = req.body.housingInfo.rentPreferences.minRent;
      if (parseInt(maxRent) <= parseInt(minRent)) {
        throw new Error('Maximum rent must be higher than minimum rent');
      }
      return true;
    }),
  
  body('housingInfo.moveInDate')
    .isISO8601()
    .isAfter()
    .withMessage('Move-in date must be in the future'),
  
  body('housingInfo.maxDistanceToMetro')
    .isIn(['5', '10', '15', 'no-preference'])
    .withMessage('Invalid metro distance preference'),

  // Updated rental duration validation
  body('housingInfo.rentDuration')
  .isInt({ min: 3, max: 60 })
  .withMessage('Rental duration must be between 3 and 60 months'),

  // Professional Information
  body('professionalInfo.occupation')
    .notEmpty()
    .withMessage('Occupation is required'),
  
  body('professionalInfo.annualIncome')
    .isInt({ min: 0 })
    .withMessage('Annual income must be a positive number'),
  
  body('professionalInfo.languages')
    .isArray({ min: 1 })
    .withMessage('Please select at least one language'),

  // Lifestyle Preferences
  body('lifestyle.children')
    .isIn(['no', 'will-have', 'yes'])
    .withMessage('Invalid children preference'),
  
  body('lifestyle.pets')
    .isIn(['no', 'will-have', 'yes'])
    .withMessage('Invalid pets preference'),
  
  body('lifestyle.smoking')
    .isIn(['no', 'sometimes', 'often'])
    .withMessage('Invalid smoking preference'),
  
  body('lifestyle.drinking')
    .isIn(['no', 'sometimes', 'often'])
    .withMessage('Invalid drinking preference'),
  
  body('lifestyle.weed')
    .isIn(['no', 'sometimes', 'often'])
    .withMessage('Invalid cannabis preference'),
  
  body('lifestyle.drugs')
    .isIn(['no', 'sometimes', 'often'])
    .withMessage('Invalid substances preference')
];

// Routes
router.post('/register', registerValidation, registerUser);
router.get('/profile/:userId', getUserProfile);
router.put('/profile/:userId', updateUserProfile);
router.get('/compatible/:userId', findCompatibleRoommates);
router.get('/stats', getUserStats);

module.exports = router;