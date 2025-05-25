import React, { useState, useEffect } from 'react';
import { SelectedLocation } from '../types';
import { cities, boroughs, neighborhoods } from '../data/locationData';

interface RegistrationPageProps {
  initialLocations: SelectedLocation[];
  onBack: () => void;
}

// Data for dropdowns
const ethnicities = [
  { value: '', label: 'Select Ethnicity' },
  { value: 'asian', label: 'Asian' },
  { value: 'black', label: 'Black or African American' },
  { value: 'hispanic', label: 'Hispanic or Latino' },
  { value: 'white', label: 'White' },
  { value: 'middle-eastern', label: 'Middle Eastern' },
  { value: 'native-american', label: 'Native American' },
  { value: 'pacific-islander', label: 'Pacific Islander' },
  { value: 'mixed', label: 'Mixed/Multiple' },
  { value: 'other', label: 'Other' },
  { value: 'prefer-not-say', label: 'Prefer not to say' },
];

const occupations = [
  { value: '', label: 'Select Occupation' },
  { value: 'tech', label: 'Technology/IT' },
  { value: 'finance', label: 'Finance/Banking' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'education', label: 'Education' },
  { value: 'legal', label: 'Legal' },
  { value: 'media', label: 'Media/Entertainment' },
  { value: 'arts', label: 'Arts/Creative' },
  { value: 'hospitality', label: 'Hospitality/Tourism' },
  { value: 'retail', label: 'Retail/Sales' },
  { value: 'real-estate', label: 'Real Estate' },
  { value: 'construction', label: 'Construction' },
  { value: 'government', label: 'Government' },
  { value: 'non-profit', label: 'Non-profit' },
  { value: 'student', label: 'Student' },
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'other', label: 'Other' },
];

const languages = [
  { value: 'english', label: 'English' },
  { value: 'spanish', label: 'Spanish' },
  { value: 'chinese', label: 'Chinese (Mandarin)' },
  { value: 'cantonese', label: 'Chinese (Cantonese)' },
  { value: 'russian', label: 'Russian' },
  { value: 'korean', label: 'Korean' },
  { value: 'bengali', label: 'Bengali' },
  { value: 'hindi', label: 'Hindi' },
  { value: 'french', label: 'French' },
  { value: 'arabic', label: 'Arabic' },
  { value: 'hebrew', label: 'Hebrew' },
  { value: 'italian', label: 'Italian' },
  { value: 'portuguese', label: 'Portuguese' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'polish', label: 'Polish' },
  { value: 'german', label: 'German' },
  { value: 'urdu', label: 'Urdu' },
  { value: 'tagalog', label: 'Tagalog' },
  { value: 'vietnamese', label: 'Vietnamese' },
  { value: 'other', label: 'Other' },
];

const religions = [
  { value: '', label: 'Select Religion' },
  { value: 'christianity', label: 'Christianity' },
  { value: 'judaism', label: 'Judaism' },
  { value: 'islam', label: 'Islam' },
  { value: 'hinduism', label: 'Hinduism' },
  { value: 'buddhism', label: 'Buddhism' },
  { value: 'atheist', label: 'Atheist' },
  { value: 'agnostic', label: 'Agnostic' },
  { value: 'spiritual', label: 'Spiritual but not religious' },
  { value: 'other', label: 'Other' },
  { value: 'prefer-not-say', label: 'Prefer not to say' },
];

const sexualOrientations = [
  { value: '', label: 'Select Sexual Orientation' },
  { value: 'straight', label: 'Straight/Heterosexual' },
  { value: 'gay', label: 'Gay/Lesbian' },
  { value: 'bisexual', label: 'Bisexual' },
  { value: 'pansexual', label: 'Pansexual' },
  { value: 'asexual', label: 'Asexual' },
  { value: 'queer', label: 'Queer' },
  { value: 'other', label: 'Other' },
  { value: 'prefer-not-say', label: 'Prefer not to say' },
];

const politicalViews = [
  { value: '', label: 'Select Political View' },
  { value: 'very-liberal', label: 'Very Liberal' },
  { value: 'liberal', label: 'Liberal' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'conservative', label: 'Conservative' },
  { value: 'very-conservative', label: 'Very Conservative' },
  { value: 'libertarian', label: 'Libertarian' },
  { value: 'apolitical', label: 'Not Political' },
  { value: 'other', label: 'Other' },
  { value: 'prefer-not-say', label: 'Prefer not to say' },
];

const RegistrationPage: React.FC<RegistrationPageProps> = ({ initialLocations, onBack }) => {
  // Location state (from landing page)
  const [expandedBoroughs, setExpandedBoroughs] = useState<Set<string>>(new Set());
  const [selectedLocations, setSelectedLocations] = useState<SelectedLocation[]>(initialLocations);
  const [showLocationSelector, setShowLocationSelector] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    sex: [] as string[],
    age: '',
    ethnicity: '',
    occupation: '',
    languages: [] as string[],
    maxDistanceToMetro: '',
    religion: '',
    sexualOrientation: '',
    political: '',
    children: '',
    pets: '',
    smoking: '',
    drinking: '',
    weed: '',
    drugs: '',
  });

  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  // Location management functions (same as SearchSection)
  const toggleBorough = (borough: string): void => {
    const newExpanded = new Set(expandedBoroughs);
    if (newExpanded.has(borough)) {
      newExpanded.delete(borough);
    } else {
      newExpanded.add(borough);
    }
    setExpandedBoroughs(newExpanded);
  };

  const handleNeighborhoodToggle = (borough: string, neighborhood: string): void => {
    const locationId = `${borough}-${neighborhood}`;
    const existingIndex = selectedLocations.findIndex(loc => loc.id === locationId);
    
    if (existingIndex !== -1) {
      setSelectedLocations(selectedLocations.filter(loc => loc.id !== locationId));
    } else if (selectedLocations.length < 5) {
      setSelectedLocations([...selectedLocations, {
        borough,
        neighborhood,
        id: locationId
      }]);
    }
  };

  const isNeighborhoodSelected = (borough: string, neighborhood: string): boolean => {
    return selectedLocations.some(loc => loc.id === `${borough}-${neighborhood}`);
  };

  const removeLocation = (locationId: string): void => {
    setSelectedLocations(selectedLocations.filter(loc => loc.id !== locationId));
  };

  const getBoroughLabel = (value: string): string => {
    return boroughs.find(b => b.value === value)?.label || value;
  };

  const getNeighborhoodLabel = (borough: string, neighborhood: string): string => {
    return neighborhoods[borough]?.find(n => n.value === neighborhood)?.label || neighborhood;
  };

  // Form handlers
  const handleSexToggle = (value: string): void => {
    setFormData(prev => ({
      ...prev,
      sex: prev.sex.includes(value)
        ? prev.sex.filter(s => s !== value)
        : [...prev.sex, value]
    }));
  };

  const handleLanguageToggle = (value: string): void => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(value)
        ? prev.languages.filter(l => l !== value)
        : [...prev.languages, value]
    }));
  };

  const handleInputChange = (field: string, value: string): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (): void => {
    console.log('Form submitted:', { locations: selectedLocations, ...formData });
    alert('Registration complete! In a real app, this would save your profile and start matching you with compatible roommates.');
  };

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
          The more information you provide, the better we can match you!
        </p>
      </div>

      {/* Selected Locations */}
      <div className="section-card">
        <h2 className="section-title">Your Selected Locations</h2>
        <p className="section-description">
          These are the neighborhoods where you're looking for a place. You can update your selections below.
        </p>
        
        {selectedLocations.length > 0 && (
          <div className="selected-locations-display">
            {selectedLocations.map((location) => (
              <div key={location.id} className="location-chip">
                <span>{getBoroughLabel(location.borough)} - {getNeighborhoodLabel(location.borough, location.neighborhood)}</span>
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
                      {neighborhoods[borough.value]?.map((neighborhood) => (
                        <label key={neighborhood.value} className="neighborhood-item-reg">
                          <input
                            type="checkbox"
                            checked={isNeighborhoodSelected(borough.value, neighborhood.value)}
                            onChange={() => handleNeighborhoodToggle(borough.value, neighborhood.value)}
                            disabled={selectedLocations.length >= 5 && !isNeighborhoodSelected(borough.value, neighborhood.value)}
                          />
                          <span>{neighborhood.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {selectedLocations.length >= 5 && (
              <p className="max-warning">Maximum of 5 locations reached.</p>
            )}
          </div>
        )}
      </div>

      {/* Personal Information */}
      <div className="section-card">
        <h2 className="section-title">Personal Information</h2>
        <p className="section-description">
          Tell us about yourself. This information helps us match you with compatible roommates who share similar backgrounds and lifestyles.
        </p>

        <div className="form-grid">
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
              onChange={(e) => handleInputChange('age', e.target.value)}
              className="form-input"
            />
          </div>

          {/* Ethnicity */}
          <div className="form-group">
            <label className="form-label">Ethnicity</label>
            <select
              value={formData.ethnicity}
              onChange={(e) => handleInputChange('ethnicity', e.target.value)}
              className="form-select"
            >
              {ethnicities.map(eth => (
                <option key={eth.value} value={eth.value}>{eth.label}</option>
              ))}
            </select>
          </div>

          {/* Occupation */}
          <div className="form-group">
            <label className="form-label">Occupation *</label>
            <select
              value={formData.occupation}
              onChange={(e) => handleInputChange('occupation', e.target.value)}
              className="form-select"
            >
              {occupations.map(occ => (
                <option key={occ.value} value={occ.value}>{occ.label}</option>
              ))}
            </select>
          </div>

          {/* Languages */}
          <div className="form-group full-width">
            <label className="form-label">Languages Spoken *</label>
            <div className="multi-select-container">
              <button
                type="button"
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className="multi-select-trigger"
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
          </div>

          {/* Max Distance to Metro */}
          <div className="form-group">
            <label className="form-label">Max Walking Distance to Metro (minutes) *</label>
            <input
              type="number"
              min="1"
              max="60"
              placeholder="e.g., 10"
              value={formData.maxDistanceToMetro}
              onChange={(e) => handleInputChange('maxDistanceToMetro', e.target.value)}
              className="form-input"
            />
          </div>

          {/* Religion */}
          <div className="form-group">
            <label className="form-label">Religion</label>
            <select
              value={formData.religion}
              onChange={(e) => handleInputChange('religion', e.target.value)}
              className="form-select"
            >
              {religions.map(rel => (
                <option key={rel.value} value={rel.value}>{rel.label}</option>
              ))}
            </select>
          </div>

          {/* Sexual Orientation */}
          <div className="form-group">
            <label className="form-label">Sexual Orientation</label>
            <select
              value={formData.sexualOrientation}
              onChange={(e) => handleInputChange('sexualOrientation', e.target.value)}
              className="form-select"
            >
              {sexualOrientations.map(so => (
                <option key={so.value} value={so.value}>{so.label}</option>
              ))}
            </select>
          </div>

          {/* Political Views */}
          <div className="form-group">
            <label className="form-label">Political Views</label>
            <select
              value={formData.political}
              onChange={(e) => handleInputChange('political', e.target.value)}
              className="form-select"
            >
              {politicalViews.map(pol => (
                <option key={pol.value} value={pol.value}>{pol.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lifestyle Preferences */}
      <div className="section-card">
        <h2 className="section-title">Lifestyle Preferences</h2>
        <p className="section-description">
          Help us understand your lifestyle to find roommates with compatible habits and preferences.
        </p>

        <div className="form-grid">
          {/* Children */}
          <div className="form-group">
            <label className="form-label">Children *</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="children"
                  value="no"
                  checked={formData.children === 'no'}
                  onChange={(e) => handleInputChange('children', e.target.value)}
                />
                <span>No</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="children"
                  value="will-have"
                  checked={formData.children === 'will-have'}
                  onChange={(e) => handleInputChange('children', e.target.value)}
                />
                <span>Will soon have</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="children"
                  value="yes"
                  checked={formData.children === 'yes'}
                  onChange={(e) => handleInputChange('children', e.target.value)}
                />
                <span>Yes</span>
              </label>
            </div>
          </div>

          {/* Pets */}
          <div className="form-group">
            <label className="form-label">Pets *</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="pets"
                  value="no"
                  checked={formData.pets === 'no'}
                  onChange={(e) => handleInputChange('pets', e.target.value)}
                />
                <span>No</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="pets"
                  value="will-have"
                  checked={formData.pets === 'will-have'}
                  onChange={(e) => handleInputChange('pets', e.target.value)}
                />
                <span>Will soon have</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="pets"
                  value="yes"
                  checked={formData.pets === 'yes'}
                  onChange={(e) => handleInputChange('pets', e.target.value)}
                />
                <span>Yes</span>
              </label>
            </div>
          </div>

          {/* Smoking */}
          <div className="form-group">
            <label className="form-label">Smoking *</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="smoking"
                  value="no"
                  checked={formData.smoking === 'no'}
                  onChange={(e) => handleInputChange('smoking', e.target.value)}
                />
                <span>No</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="smoking"
                  value="sometimes"
                  checked={formData.smoking === 'sometimes'}
                  onChange={(e) => handleInputChange('smoking', e.target.value)}
                />
                <span>Sometimes</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="smoking"
                  value="often"
                  checked={formData.smoking === 'often'}
                  onChange={(e) => handleInputChange('smoking', e.target.value)}
                />
                <span>Often</span>
              </label>
            </div>
          </div>

          {/* Drinking */}
          <div className="form-group">
            <label className="form-label">Drinking *</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="drinking"
                  value="no"
                  checked={formData.drinking === 'no'}
                  onChange={(e) => handleInputChange('drinking', e.target.value)}
                />
                <span>No</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="drinking"
                  value="sometimes"
                  checked={formData.drinking === 'sometimes'}
                  onChange={(e) => handleInputChange('drinking', e.target.value)}
                />
                <span>Sometimes</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="drinking"
                  value="often"
                  checked={formData.drinking === 'often'}
                  onChange={(e) => handleInputChange('drinking', e.target.value)}
                />
                <span>Often</span>
              </label>
            </div>
          </div>

          {/* Weed */}
          <div className="form-group">
            <label className="form-label">Cannabis Use *</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="weed"
                  value="no"
                  checked={formData.weed === 'no'}
                  onChange={(e) => handleInputChange('weed', e.target.value)}
                />
                <span>No</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="weed"
                  value="sometimes"
                  checked={formData.weed === 'sometimes'}
                  onChange={(e) => handleInputChange('weed', e.target.value)}
                />
                <span>Sometimes</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="weed"
                  value="often"
                  checked={formData.weed === 'often'}
                  onChange={(e) => handleInputChange('weed', e.target.value)}
                />
                <span>Often</span>
              </label>
            </div>
          </div>

          {/* Drugs */}
          <div className="form-group">
            <label className="form-label">Other Substances *</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="drugs"
                  value="no"
                  checked={formData.drugs === 'no'}
                  onChange={(e) => handleInputChange('drugs', e.target.value)}
                />
                <span>No</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="drugs"
                  value="sometimes"
                  checked={formData.drugs === 'sometimes'}
                  onChange={(e) => handleInputChange('drugs', e.target.value)}
                />
                <span>Sometimes</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="drugs"
                  value="often"
                  checked={formData.drugs === 'often'}
                  onChange={(e) => handleInputChange('drugs', e.target.value)}
                />
                <span>Often</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="submit-section">
        <button onClick={handleSubmit} className="submit-btn">
          Complete Registration & Find Roommates
        </button>
        <p className="submit-note">
          * Required fields. Your information is kept private and only shared with matched roommates.
        </p>
      </div>
    </div>
  );
};

export default RegistrationPage;