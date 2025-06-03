import React, { useState } from 'react';
import { SelectedLocation } from '../types';
import { useLocationSelection } from '../hooks/useLocationSelection';
import { useRegistrationForm } from '../hooks/useRegistrationForm';
import { prepareSubmissionData, formatCurrency, calculateRecommendedRent } from '../utils/formUtils';
import { registerUser } from '../services/apiService';
import {
  ethnicities,
  occupations,
  languages,
  metroDistanceOptions,
  religions,
  sexualOrientations,
  politicalViews,
  lifestyleOptions,
} from '../constants/formData';
import { boroughs, neighborhoods } from '../data/locationData';

interface RegistrationPageProps {
  initialLocations: SelectedLocation[];
  onBack: () => void;
}

const RegistrationPage: React.FC<RegistrationPageProps> = ({ initialLocations, onBack }) => {
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  // Location management
  const {
    expandedBoroughs,
    selectedLocations,
    toggleBorough,
    handleNeighborhoodToggle,
    isNeighborhoodSelected,
    removeLocation,
    getBoroughLabel,
    getNeighborhoodLabel,
    isAtMaxSelection,
    setSelectedLocations,
  } = useLocationSelection({ initialLocations, maxSelections: 5 });

  // Form management
  const {
    formData,
    errors,
    isSubmitting,
    updateField,
    handleSexToggle,
    handleLanguageToggle,
    handleSSNChange,
    validateForm,
    getCompletionPercentage,
    setIsSubmitting,
  } = useRegistrationForm();

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm() || selectedLocations.length === 0) {
      if (selectedLocations.length === 0) {
        alert('Please select at least one location.');
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // Call the API to register the user
      const response = await registerUser(formData, selectedLocations);

      console.log('✅ Registration successful:', response);

      // Show success message with user details
      const successMessage = `
🎉 Registration Complete!

Welcome ${response.user.personalInfo.firstName}!

✅ Account created successfully
✅ Profile completed
✅ Recommended max rent: ${formatCurrency(response.recommendedRent)}/month

Next Steps:
${response.nextSteps.map(step => `• ${step}`).join('\n')}

User ID: ${response.user._id}
      `.trim();

      alert(successMessage);

      // Clear form data from localStorage after successful submission
      if (typeof window !== 'undefined') {
        localStorage.removeItem('roommate-registration-form');
      }

      // In a real app, you might redirect to a dashboard or login page
      // window.location.href = '/dashboard';

    } catch (error) {
      console.error('❌ Registration error:', error);

      let errorMessage = 'Registration failed. Please try again.';

      if (error instanceof Error) {
        // Handle specific error types
        if (error.message.includes('email') && error.message.includes('exists')) {
          errorMessage = 'An account with this email already exists. Please use a different email or try logging in.';
        } else if (error.message.includes('username') && error.message.includes('exists')) {
          errorMessage = 'This username is already taken. Please choose a different username.';
        } else if (error.message.includes('Validation failed')) {
          errorMessage = 'Please check your form data and try again. Some fields may contain invalid information.';
        } else if (error.message.includes('Network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        } else {
          errorMessage = error.message;
        }
      }

      alert(`❌ Registration Error:\n\n${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const completionPercentage = getCompletionPercentage();
  const recommendedRent = calculateRecommendedRent(formData.annualIncome);

  return (
    <div className="registration-page">
      {/* Header */}
      <div className="reg-header">
        <button onClick={onBack} className="back-button">
          ← Back to Search
        </button>
        <h1 className="reg-title">Complete Your Profile</h1>
        <p className="reg-subtitle">
          Our AI-powered matching system will automatically pair you with compatible roommates
          who are searching for the same locations and share similar lifestyles.
          The more accurate information you provide, the better we can match you with your ideal roommate!
        </p>

        {/* Progress Indicator */}
        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <span className="progress-text">{completionPercentage}% Complete</span>
        </div>
      </div>

      {/* Selected Locations */}
      <div className="section-card">
        <h2 className="section-title">Your Selected Locations</h2>
        <p className="section-description">
          These are the neighborhoods where you're looking to rent. You can update your selections below.
        </p>

        {selectedLocations.length > 0 && (
          <div className="selected-locations-display">
            {selectedLocations.map((location) => (
              <div key={location.id} className="location-chip">
                <span>
                  {getBoroughLabel(location.borough)} - {getNeighborhoodLabel(location.borough, location.neighborhood)}
                </span>
                <button onClick={() => removeLocation(location.id)} className="chip-remove">×</button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => setShowLocationSelector(!showLocationSelector)}
          className="toggle-locations-btn"
        >
          {showLocationSelector ? 'Hide' : 'Update'} Location Preferences
        </button>

        {showLocationSelector && (
          <div className="location-selector-reg">
            <div className="borough-grid-reg">
              {boroughs.map((borough) => (
                <div key={borough.value} className="borough-section-reg">
                  <button
                    onClick={() => toggleBorough(borough.value)}
                    className="borough-toggle-reg"
                  >
                    <span>{borough.label}</span>
                    <span>{expandedBoroughs.has(borough.value) ? '−' : '+'}</span>
                  </button>

                  {expandedBoroughs.has(borough.value) && (
                    <div className="neighborhood-list-reg">
                      {neighborhoods[borough.value]?.map((neighborhood) => {
                        const isSelected = isNeighborhoodSelected(borough.value, neighborhood.value);
                        const isDisabled = isAtMaxSelection() && !isSelected;

                        return (
                          <label key={neighborhood.value} className="neighborhood-item-reg">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleNeighborhoodToggle(borough.value, neighborhood.value)}
                              disabled={isDisabled}
                            />
                            <span>{neighborhood.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {isAtMaxSelection() && (
              <p className="max-warning">Maximum of 5 locations reached.</p>
            )}
          </div>
        )}
      </div>

      {/* Personal Information */}
      <div className="section-card">
        <h2 className="section-title">Personal Information</h2>
        <p className="section-description">
          Tell us about yourself. This information helps us verify your identity and match you with roommates in your budget range.
        </p>

        <div className="form-grid">
          {/* Account Information First */}
          <div className="form-group">
            <label className="form-label">Account Username *</label>
            <input
              type="text"
              placeholder="Choose a username"
              value={formData.account}
              onChange={(e) => updateField('account', e.target.value)}
              className={`form-input ${errors.account ? 'error' : ''}`}
            />
            {errors.account && <span className="error-message">{errors.account}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <input
              type="password"
              placeholder="Choose a secure password"
              value={formData.password}
              onChange={(e) => updateField('password', e.target.value)}
              className={`form-input ${errors.password ? 'error' : ''}`}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
            <small className="form-hint">At least 8 characters with uppercase, lowercase, and numbers</small>
          </div>

          <div className="form-group">
            <label className="form-label">Email *</label>
            <input
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              className={`form-input ${errors.email ? 'error' : ''}`}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number *</label>
            <input
              type="tel"
              placeholder="(555) 123-4567"
              value={formData.phoneNumber}
              onChange={(e) => updateField('phoneNumber', e.target.value)}
              className={`form-input ${errors.phoneNumber ? 'error' : ''}`}
            />
            {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
          </div>

          {/* Personal Information */}
          <div className="form-group">
            <label className="form-label">First Name *</label>
            <input
              type="text"
              placeholder="Enter your first name"
              value={formData.firstName}
              onChange={(e) => updateField('firstName', e.target.value)}
              className={`form-input ${errors.firstName ? 'error' : ''}`}
            />
            {errors.firstName && <span className="error-message">{errors.firstName}</span>}
          </div>

          {/* Last Name */}
          <div className="form-group">
            <label className="form-label">Last Name *</label>
            <input
              type="text"
              placeholder="Enter your last name"
              value={formData.lastName}
              onChange={(e) => updateField('lastName', e.target.value)}
              className={`form-input ${errors.lastName ? 'error' : ''}`}
            />
            {errors.lastName && <span className="error-message">{errors.lastName}</span>}
          </div>

          {/* Social Security Number */}
          <div className="form-group">
            <label className="form-label">Social Security Number *</label>
            <input
              type="text"
              placeholder="XXX-XX-XXXX"
              value={formData.ssn}
              onChange={(e) => handleSSNChange(e.target.value)}
              maxLength={11}
              className={`form-input ${errors.ssn ? 'error' : ''}`}
            />
            {errors.ssn && <span className="error-message">{errors.ssn}</span>}
            <small className="form-hint">Required for background checks. Your SSN is encrypted and secure.</small>
          </div>

          {/* Sex */}
          <div className="form-group">
            <label className="form-label">Sex *</label>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.sex.includes('male')}
                  onChange={() => handleSexToggle('male')}
                />
                <span>Male</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.sex.includes('female')}
                  onChange={() => handleSexToggle('female')}
                />
                <span>Female</span>
              </label>
            </div>
            {errors.sex && <span className="error-message">{errors.sex}</span>}
          </div>

          {/* Age */}
          <div className="form-group">
            <label className="form-label">Age *</label>
            <input
              type="number"
              min="18"
              max="100"
              placeholder="Enter your age"
              value={formData.age}
              onChange={(e) => updateField('age', e.target.value)}
              className={`form-input ${errors.age ? 'error' : ''}`}
            />
            {errors.age && <span className="error-message">{errors.age}</span>}
          </div>

          {/* Rent Range Preferences */}
          <div className="form-group">
            <label className="form-label">Minimum Rent (per person) *</label>
            <input
              type="number"
              placeholder="e.g., 800"
              value={formData.minRent}
              onChange={(e) => updateField('minRent', e.target.value)}
              className={`form-input ${errors.minRent ? 'error' : ''}`}
              min="0"
              step="50"
            />
            {errors.minRent && <span className="error-message">{errors.minRent}</span>}
            <small className="form-hint">Your minimum acceptable monthly rent per person</small>
          </div>

          <div className="form-group">
            <label className="form-label">Maximum Rent (per person) *</label>
            <input
              type="number"
              placeholder="e.g., 2000"
              value={formData.maxRent}
              onChange={(e) => updateField('maxRent', e.target.value)}
              className={`form-input ${errors.maxRent ? 'error' : ''}`}
              min="0"
              step="50"
            />
            {errors.maxRent && <span className="error-message">{errors.maxRent}</span>}
            <small className="form-hint">
              Your maximum budget per person. {formData.maxRent && `$${parseInt(formData.maxRent) * 12}/year`}
            </small>
          </div>

          {/* Maximum Walking Distance to Metro */}
          <div className="form-group">
            <label className="form-label">Maximum Walking Distance to Metro *</label>
            <select
              value={formData.maxDistanceToMetro}
              onChange={(e) => updateField('maxDistanceToMetro', e.target.value)}
              className={`form-select ${errors.maxDistanceToMetro ? 'error' : ''}`}
            >
              {metroDistanceOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            {errors.maxDistanceToMetro && <span className="error-message">{errors.maxDistanceToMetro}</span>}
          </div>

          {/* Move-in Date */}
          <div className="form-group">
            <label className="form-label">Estimated Move-in Date *</label>
            <input
              type="date"
              value={formData.moveInDate}
              onChange={(e) => updateField('moveInDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className={`form-input ${errors.moveInDate ? 'error' : ''}`}
            />
            {errors.moveInDate && <span className="error-message">{errors.moveInDate}</span>}
          </div>

          {/* Rent Duration */}
          <div className="form-group">
            <label className="form-label">Estimated Rental Duration *</label>
            <div className="input-with-suffix">
              <input
                type="number"
                placeholder="12"
                value={formData.rentDuration}
                onChange={(e) => updateField('rentDuration', e.target.value)}
                className={`form-input ${errors.rentDuration ? 'error' : ''}`}
                min="3"
                max="60"
                step="1"
                style={{ paddingRight: '80px' }}
              />
              <span className="input-suffix">months</span>
            </div>
            {errors.rentDuration && <span className="error-message">{errors.rentDuration}</span>}
          </div>

          {/* Ethnicity */}
          <div className="form-group">
            <label className="form-label">Ethnicity</label>
            <select
              value={formData.ethnicity}
              onChange={(e) => updateField('ethnicity', e.target.value)}
              className="form-select"
            >
              {ethnicities.map(eth => (
                <option key={eth.value} value={eth.value}>{eth.label}</option>
              ))}
            </select>
          </div>

          {/* Demographics Row 1: Occupation / Languages / Annual Income */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Occupation *</label>
              <select
                value={formData.occupation}
                onChange={(e) => updateField('occupation', e.target.value)}
                className={`form-select ${errors.occupation ? 'error' : ''}`}
              >
                {occupations.map(occ => (
                  <option key={occ.value} value={occ.value}>{occ.label}</option>
                ))}
              </select>
              {errors.occupation && <span className="error-message">{errors.occupation}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Languages Spoken *</label>
              <div className="multi-select-container">
                <button
                  type="button"
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className={`multi-select-trigger ${errors.languages ? 'error' : ''}`}
                >
                  {formData.languages.length > 0
                    ? `${formData.languages.length} selected`
                    : 'Select languages'}
                  <span>{showLanguageDropdown ? '▲' : '▼'}</span>
                </button>

                {showLanguageDropdown && (
                  <div className="multi-select-dropdown">
                    {languages.map(lang => (
                      <label key={lang.value} className="multi-select-option">
                        <input
                          type="checkbox"
                          checked={formData.languages.includes(lang.value)}
                          onChange={() => handleLanguageToggle(lang.value)}
                        />
                        <span>{lang.label}</span>
                      </label>
                    ))}
                  </div>
                )}

                {formData.languages.length > 0 && (
                  <div className="selected-languages">
                    {formData.languages.map(lang => (
                      <span key={lang} className="language-chip">
                        {languages.find(l => l.value === lang)?.label}
                        <button
                          type="button"
                          onClick={() => handleLanguageToggle(lang)}
                          className="chip-remove"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {errors.languages && <span className="error-message">{errors.languages}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Annual Income *</label>
              <input
                type="number"
                placeholder="e.g., 75000"
                value={formData.annualIncome}
                onChange={(e) => updateField('annualIncome', e.target.value)}
                className={`form-input ${errors.annualIncome ? 'error' : ''}`}
              />
              {errors.annualIncome && <span className="error-message">{errors.annualIncome}</span>}
              <small className="form-hint">
                USD before taxes. {recommendedRent > 0 && `Recommended max rent: ${formatCurrency(recommendedRent)}/month`}
              </small>
            </div>
          </div>

          {/* Demographics Row 2: Political Views / Religion / Sexual Orientation */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Political Views</label>
              <select
                value={formData.political}
                onChange={(e) => updateField('political', e.target.value)}
                className="form-select"
              >
                {politicalViews.map(pol => (
                  <option key={pol.value} value={pol.value}>{pol.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Religion</label>
              <select
                value={formData.religion}
                onChange={(e) => updateField('religion', e.target.value)}
                className="form-select"
              >
                {religions.map(rel => (
                  <option key={rel.value} value={rel.value}>{rel.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Sexual Orientation</label>
              <select
                value={formData.sexualOrientation}
                onChange={(e) => updateField('sexualOrientation', e.target.value)}
                className="form-select"
              >
                {sexualOrientations.map(so => (
                  <option key={so.value} value={so.value}>{so.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Lifestyle Preferences */}
      <div className="section-card">
        <h2 className="section-title">Lifestyle Preferences</h2>
        <p className="section-description">
          Help us understand your daily habits and preferences to find roommates with compatible lifestyles.
        </p>

        <div className="form-grid">
          {/* Children */}
          <div className="form-group">
            <label className="form-label">Children *</label>
            <div className="radio-group">
              {lifestyleOptions.children.map(option => (
                <label key={option.value} className="radio-label">
                  <input
                    type="radio"
                    name="children"
                    value={option.value}
                    checked={formData.children === option.value}
                    onChange={(e) => updateField('children', e.target.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            {errors.children && <span className="error-message">{errors.children}</span>}
          </div>

          {/* Pets */}
          <div className="form-group">
            <label className="form-label">Pets *</label>
            <div className="radio-group">
              {lifestyleOptions.pets.map(option => (
                <label key={option.value} className="radio-label">
                  <input
                    type="radio"
                    name="pets"
                    value={option.value}
                    checked={formData.pets === option.value}
                    onChange={(e) => updateField('pets', e.target.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            {errors.pets && <span className="error-message">{errors.pets}</span>}
          </div>

          {/* Smoking */}
          <div className="form-group">
            <label className="form-label">Smoking *</label>
            <div className="radio-group">
              {lifestyleOptions.frequency.map(option => (
                <label key={option.value} className="radio-label">
                  <input
                    type="radio"
                    name="smoking"
                    value={option.value}
                    checked={formData.smoking === option.value}
                    onChange={(e) => updateField('smoking', e.target.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            {errors.smoking && <span className="error-message">{errors.smoking}</span>}
          </div>

          {/* Drinking */}
          <div className="form-group">
            <label className="form-label">Drinking *</label>
            <div className="radio-group">
              {lifestyleOptions.frequency.map(option => (
                <label key={option.value} className="radio-label">
                  <input
                    type="radio"
                    name="drinking"
                    value={option.value}
                    checked={formData.drinking === option.value}
                    onChange={(e) => updateField('drinking', e.target.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            {errors.drinking && <span className="error-message">{errors.drinking}</span>}
          </div>

          {/* Cannabis */}
          <div className="form-group">
            <label className="form-label">Cannabis Use *</label>
            <div className="radio-group">
              {lifestyleOptions.frequency.map(option => (
                <label key={option.value} className="radio-label">
                  <input
                    type="radio"
                    name="weed"
                    value={option.value}
                    checked={formData.weed === option.value}
                    onChange={(e) => updateField('weed', e.target.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            {errors.weed && <span className="error-message">{errors.weed}</span>}
          </div>

          {/* Other Substances */}
          <div className="form-group">
            <label className="form-label">Other Substances *</label>
            <div className="radio-group">
              {lifestyleOptions.frequency.map(option => (
                <label key={option.value} className="radio-label">
                  <input
                    type="radio"
                    name="drugs"
                    value={option.value}
                    checked={formData.drugs === option.value}
                    onChange={(e) => updateField('drugs', e.target.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            {errors.drugs && <span className="error-message">{errors.drugs}</span>}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="submit-section">
        <button
          onClick={handleSubmit}
          className="submit-btn"
          disabled={isSubmitting || selectedLocations.length === 0}
        >
          {isSubmitting ? (
            <span className="loading-state">
              <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing Registration...
            </span>
          ) : (
            'Complete Registration & Find Roommates'
          )}
        </button>
        <p className="submit-note">
          * Required fields. Your information is encrypted and kept strictly confidential.
          We use bank-level security to protect your personal data.
        </p>
      </div>
    </div>
  );
};

export default RegistrationPage;