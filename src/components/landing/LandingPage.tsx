import React from 'react';
import BackgroundShapes from '../common/BackgroundShapes'; // Default import
import Features from '../common/Features'; // Default import

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 relative">
      <BackgroundShapes />
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Find Your Perfect Roommate
            </h1>
            <p className="text-blue-100 text-2xl mb-4">AI-powered matching for compatible living</p>
            <p className="text-blue-200 text-lg mb-12">Join 10,000+ users who found their ideal living situation</p>
            
            {/* Primary CTA */}
            <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-8">
              <button
                onClick={() => onNavigate('preview')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-10 py-4 rounded-xl font-bold text-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 transform shadow-2xl"
              >
                🔍 Browse Available Roommates
              </button>
              <button
                onClick={() => onNavigate('signup')}
                className="bg-white bg-opacity-20 backdrop-blur-sm text-white px-10 py-4 rounded-xl font-bold text-xl hover:bg-opacity-30 transition-all duration-300 border border-white border-opacity-20 hover:scale-105 transform"
              >
                🚀 Join Free Now
              </button>
            </div>
            
            <p className="text-blue-300 text-sm">No signup required to browse • See what you get first</p>
          </div>

          {/* Features Section */}
          <Features />
          
          {/* Social proof section */}
          <div className="bg-white bg-opacity-5 backdrop-blur-sm rounded-xl p-8 border border-white border-opacity-10 text-center mt-16">
            <div className="flex justify-center items-center gap-12 text-blue-200">
              <div>
                <div className="text-3xl font-bold text-white">10,847</div>
                <div className="text-sm">Active Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">94%</div>
                <div className="text-sm">Success Rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">2.3 days</div>
                <div className="text-sm">Avg. Match Time</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;