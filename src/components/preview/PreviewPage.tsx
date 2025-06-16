import React, { useState, useEffect } from 'react';
import BackgroundShapes from '../common/BackgroundShapes';
import { previewAPI } from '../../services/apiService';

interface PreviewPageProps {
  onNavigate: (page: string) => void;
}

interface PreviewProfile {
  id: string;
  name: string;
  age: number;
  occupation: string;
  location: string[];
  budget: string;
  bio: string;
  preferences: {
    cleanliness: string;
    socialLevel: string;
    workSchedule: string;
  };
  compatibility: number;
  photo?: string;
}

const PreviewPage: React.FC<PreviewPageProps> = ({ onNavigate }) => {
  const [profiles, setProfiles] = useState<PreviewProfile[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, successRate: 0, avgMatchTime: 0 });
  const [loading, setLoading] = useState(true);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profilesData, statsData] = await Promise.all([
          previewAPI.getProfiles(),
          previewAPI.getStats()
        ]);
        setProfiles(profilesData.data?.profiles || mockProfiles);
        setStats(statsData.data?.stats || mockStats);
      } catch (error) {
        // Fallback to mock data if API fails
        console.log('Using mock data for preview');
        setProfiles(mockProfiles);
        setStats(mockStats);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const nextProfile = () => {
    setCurrentProfileIndex((prev) => (prev + 1) % profiles.length);
  };

  const prevProfile = () => {
    setCurrentProfileIndex((prev) => (prev - 1 + profiles.length) % profiles.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading preview...</div>
      </div>
    );
  }

  const currentProfile = profiles[currentProfileIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 relative">
      <BackgroundShapes />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">See What You Get</h1>
          <p className="text-blue-200 text-lg mb-6">Browse sample roommate matches • No signup required</p>
          
          {/* Stats */}
          <div className="flex justify-center items-center gap-8 text-blue-200 mb-8">
            <div>
              <div className="text-2xl font-bold text-white">{stats.totalUsers.toLocaleString()}</div>
              <div className="text-sm">Active Users</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.successRate}%</div>
              <div className="text-sm">Success Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.avgMatchTime} days</div>
              <div className="text-sm">Avg. Match Time</div>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-8 border border-white border-opacity-20 mb-8">
            {/* Profile Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">{currentProfile.name}, {currentProfile.age}</h2>
                <p className="text-blue-200">{currentProfile.occupation}</p>
              </div>
              <div className="text-right">
                <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {currentProfile.compatibility}% Match
                </div>
              </div>
            </div>

            {/* Profile Photo Placeholder */}
            <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center">
              <span className="text-4xl text-white font-bold">
                {currentProfile.name.charAt(0)}
              </span>
            </div>

            {/* Location & Budget */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-white font-semibold mb-2">Preferred Areas</h3>
                <div className="flex flex-wrap gap-2">
                  {currentProfile.location.map((loc, index) => (
                    <span key={index} className="bg-blue-500 bg-opacity-30 text-blue-200 px-3 py-1 rounded-full text-sm">
                      {loc}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">Budget</h3>
                <p className="text-blue-200">{currentProfile.budget}</p>
              </div>
            </div>

            {/* Bio */}
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-2">About</h3>
              <p className="text-blue-200">{currentProfile.bio}</p>
            </div>

            {/* Lifestyle Preferences */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <h4 className="text-white font-semibold mb-1">Cleanliness</h4>
                <p className="text-blue-200 text-sm">{currentProfile.preferences.cleanliness}</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1">Social Level</h4>
                <p className="text-blue-200 text-sm">{currentProfile.preferences.socialLevel}</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1">Work Schedule</h4>
                <p className="text-blue-200 text-sm">{currentProfile.preferences.workSchedule}</p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={prevProfile}
                className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition-colors"
              >
                ← Previous
              </button>
              
              <span className="text-blue-200">
                {currentProfileIndex + 1} of {profiles.length}
              </span>
              
              <button
                onClick={nextProfile}
                className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition-colors"
              >
                Next →
              </button>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <p className="text-blue-200 mb-6">Ready to find your perfect roommate match?</p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button
                onClick={() => onNavigate('signup')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-bold hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
              >
                🚀 Get Started - It's Free
              </button>
              <button
                onClick={() => onNavigate('landing')}
                className="bg-white bg-opacity-20 text-white px-8 py-3 rounded-lg font-bold hover:bg-opacity-30 transition-colors"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mock data fallbacks
const mockProfiles: PreviewProfile[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    age: 26,
    occupation: 'Software Engineer',
    location: ['Manhattan - East Village', 'Brooklyn - Williamsburg'],
    budget: '$1,800 - $2,200/month',
    bio: "I'm a tech professional who loves exploring NYC's food scene and hiking on weekends. Looking for someone clean, respectful, and social but not party-crazy. I work remotely 2-3 days a week.",
    preferences: {
      cleanliness: 'Very Clean',
      socialLevel: 'Social but not loud',
      workSchedule: 'Hybrid remote'
    },
    compatibility: 94
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    age: 28,
    occupation: 'Marketing Manager',
    location: ['Manhattan - Upper West Side', 'Jersey City - Downtown'],
    budget: '$1,600 - $2,000/month',
    bio: "Fitness enthusiast who loves cooking and hosting small gatherings. I'm pretty social and enjoy having friends over occasionally. Work standard hours and travel sometimes for work.",
    preferences: {
      cleanliness: 'Clean & Organized',
      socialLevel: 'Love hosting friends',
      workSchedule: 'Standard 9-5'
    },
    compatibility: 87
  },
  {
    id: '3',
    name: 'Emma Rodriguez',
    age: 24,
    occupation: 'Graphic Designer',
    location: ['Brooklyn - Park Slope', 'Queens - Astoria'],
    budget: '$1,400 - $1,800/month',
    bio: "Creative professional who's pretty chill and low-key. I love plants, reading, and quiet weekends. Looking for someone who respects personal space but is friendly.",
    preferences: {
      cleanliness: 'Moderately clean',
      socialLevel: 'Quiet & respectful',
      workSchedule: 'Creative schedule'
    },
    compatibility: 91
  }
];

const mockStats = {
  totalUsers: 10847,
  successRate: 94,
  avgMatchTime: 2.3
};

export default PreviewPage;