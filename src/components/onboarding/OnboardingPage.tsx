import React, { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useOnboarding } from '../../hooks/useOnboarding';
import { useLocationSelection } from '../../hooks/useLocationSelection';
import BackgroundShapes from '../common/BackgroundShapes';
import SearchSection from '../SearchSection'; // Your existing component
import { SelectedLocation } from '../../types';

interface OnboardingPageProps {
  onNavigate: (page: string) => void;
}

const OnboardingPage: React.FC<OnboardingPageProps> = ({ onNavigate }) => {
  const { user, token } = useAuth();
  const { step, data, loading, error, updateData, nextStep, prevStep, saveStep, totalSteps } = useOnboarding();
  const { selectedLocations, handleNeighborhoodToggle, removeLocation } = useLocationSelection({ maxSelections: 5 });

  // Update onboarding data when locations change
  useEffect(() => {
    updateData({ location: selectedLocations });
  }, [selectedLocations, updateData]);

  const handleNext = async () => {
    if (token && await saveStep(token)) {
      if (step === totalSteps) {
        // Onboarding complete, go to dashboard
        onNavigate('dashboard');
      } else {
        nextStep();
      }
    }
  };

  const handlePrev = () => {
    prevStep();
  };

  const updatePreferences = (field: string, value: string) => {
    updateData({
      preferences: {
        ...data.preferences,
        [field]: value
      }
    });
  };

  const handleSearch = (locations: SelectedLocation[]) => {
    // This integrates with your existing SearchSection
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Where do you want to live?</h2>
              <p className="text-blue-200">Select up to 5 neighborhoods you'd consider</p>
            </div>

            <SearchSection onSearch={handleSearch} />

            <div className="space-y-4">
              <div>
                <label className="block text-white mb-2 font-semibold">Housing Situation</label>
                <select
                  value={data.housingSituation}
                  onChange={(e) => updateData({ housingSituation: e.target.value as any })}
                  className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white border border-white border-opacity-20 focus:border-blue-400 focus:outline-none"
                >
                  <option value="">Select your situation</option>
                  <option value="looking">Looking for a place together</option>
                  <option value="have-apartment">I have a place, need roommate</option>
                  <option value="flexible">Flexible with either option</option>
                </select>
              </div>

              <div>
                <label className="block text-white mb-2 font-semibold">Budget Range</label>
                <select
                  value={data.budget}
                  onChange={(e) => updateData({ budget: e.target.value })}
                  className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white border border-white border-opacity-20 focus:border-blue-400 focus:outline-none"
                >
                  <option value="">Select budget range</option>
                  <option value="1000-1500">$1,000 - $1,500/month</option>
                  <option value="1500-2000">$1,500 - $2,000/month</option>
                  <option value="2000-2500">$2,000 - $2,500/month</option>
                  <option value="2500-3000">$2,500 - $3,000/month</option>
                  <option value="3000+">$3,000+/month</option>
                </select>
              </div>

              <div>
                <label className="block text-white mb-2 font-semibold">Move-in Timeline</label>
                <select
                  value={data.moveInDate}
                  onChange={(e) => updateData({ moveInDate: e.target.value })}
                  className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white border border-white border-opacity-20 focus:border-blue-400 focus:outline-none"
                >
                  <option value="">Select timeline</option>
                  <option value="immediately">Immediately</option>
                  <option value="1-month">Within 1 month</option>
                  <option value="2-3-months">2-3 months</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Lifestyle Preferences</h2>
              <p className="text-blue-200">Help us find your most compatible roommate</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-white mb-3 font-semibold">How important is cleanliness to you?</label>
                <div className="grid grid-cols-1 gap-3">
                  {['Very clean - everything in its place', 'Clean & organized', 'Moderately clean', 'Pretty relaxed about cleanliness'].map((option) => (
                    <button
                      key={option}
                      onClick={() => updatePreferences('cleanliness', option)}
                      className={`p-3 rounded-lg text-left transition-colors ${
                        data.preferences.cleanliness === option
                          ? 'bg-blue-500 bg-opacity-50 border-blue-400'
                          : 'bg-white bg-opacity-10 border-white border-opacity-20 hover:bg-opacity-20'
                      } border`}
                    >
                      <span className="text-white">{option}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-white mb-3 font-semibold">What's your social preference?</label>
                <div className="grid grid-cols-1 gap-3">
                  {['Love hosting friends & parties', 'Social but not too loud', 'Quiet & respectful', 'Pretty private - minimal interaction'].map((option) => (
                    <button
                      key={option}
                      onClick={() => updatePreferences('socialLevel', option)}
                      className={`p-3 rounded-lg text-left transition-colors ${
                        data.preferences.socialLevel === option
                          ? 'bg-blue-500 bg-opacity-50 border-blue-400'
                          : 'bg-white bg-opacity-10 border-white border-opacity-20 hover:bg-opacity-20'
                      } border`}
                    >
                      <span className="text-white">{option}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-white mb-3 font-semibold">What's your work schedule like?</label>
                <div className="grid grid-cols-1 gap-3">
                  {['Standard 9-5', 'Hybrid remote', 'Fully remote', 'Creative/flexible schedule', 'Night shift/irregular hours'].map((option) => (
                    <button
                      key={option}
                      onClick={() => updatePreferences('workSchedule', option)}
                      className={`p-3 rounded-lg text-left transition-colors ${
                        data.preferences.workSchedule === option
                          ? 'bg-blue-500 bg-opacity-50 border-blue-400'
                          : 'bg-white bg-opacity-10 border-white border-opacity-20 hover:bg-opacity-20'
                      } border`}
                    >
                      <span className="text-white">{option}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Review Your Profile</h2>
              <p className="text-blue-200">Make sure everything looks good before we find your matches</p>
            </div>

            <div className="bg-white bg-opacity-5 rounded-lg p-6 space-y-4">
              <div>
                <h3 className="text-white font-semibold mb-2">Selected Areas</h3>
                <div className="flex flex-wrap gap-2">
                  {data.location.map((location, index) => (
                    <span key={location.id} className="bg-blue-500 bg-opacity-30 text-blue-200 px-3 py-1 rounded-full text-sm">
                      {location.borough} - {location.neighborhood}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-white font-semibold mb-1">Housing Situation</h3>
                  <p className="text-blue-200 text-sm">{data.housingSituation || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Budget</h3>
                  <p className="text-blue-200 text-sm">{data.budget || 'Not specified'}</p>
                </div>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-1">Move-in Timeline</h3>
                <p className="text-blue-200 text-sm">{data.moveInDate || 'Not specified'}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h3 className="text-white font-semibold mb-1">Cleanliness</h3>
                  <p className="text-blue-200 text-sm">{data.preferences.cleanliness || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Social Level</h3>
                  <p className="text-blue-200 text-sm">{data.preferences.socialLevel || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Work Schedule</h3>
                  <p className="text-blue-200 text-sm">{data.preferences.workSchedule || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 relative">
      <BackgroundShapes />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-white">Complete Your Profile</h1>
              <span className="text-blue-200">Step {step} of {totalSteps}</span>
            </div>
            <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-500 bg-opacity-20 border border-red-400 rounded-lg">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Step Content */}
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-8 border border-white border-opacity-20 mb-8">
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={handlePrev}
              disabled={step === 1}
              className="bg-white bg-opacity-20 text-white px-6 py-3 rounded-lg hover:bg-opacity-30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            
            <button
              onClick={handleNext}
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'Saving...' : step === totalSteps ? '🎉 Complete Profile' : 'Next →'}
            </button>
          </div>

          {/* Welcome Message */}
          {user && (
            <div className="text-center mt-6">
              <p className="text-blue-300">Welcome, {user.firstName}! Let's find your perfect roommate.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;