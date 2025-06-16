import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import BackgroundShapes from '../common/BackgroundShapes';

interface DashboardPageProps {
  onNavigate: (page: string) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    onNavigate('landing');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 relative">
      <BackgroundShapes />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-blue-200">Your roommate matches are ready</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition-colors"
          >
            Sign Out
          </button>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Completeness */}
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
            <h2 className="text-xl font-bold text-white mb-4">Profile Status</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-blue-200">Completeness</span>
                <span className="text-white font-semibold">{user?.profileCompleteness || 85}%</span>
              </div>
              <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full"
                  style={{ width: `${user?.profileCompleteness || 85}%` }}
                ></div>
              </div>
              <button className="text-blue-400 hover:text-blue-300 text-sm">
                Complete your profile →
              </button>
            </div>
          </div>

          {/* New Matches */}
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
            <h2 className="text-xl font-bold text-white mb-4">New Matches</h2>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">5</div>
              <p className="text-blue-200 text-sm mb-4">New potential roommates</p>
              <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all">
                View Matches
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
            <h2 className="text-xl font-bold text-white mb-4">Messages</h2>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">3</div>
              <p className="text-blue-200 text-sm mb-4">Unread conversations</p>
              <button className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition-colors">
                Open Messages
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl border border-white border-opacity-20">
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white border-opacity-10 pb-4">
                  <div>
                    <p className="text-white font-semibold">Sarah viewed your profile</p>
                    <p className="text-blue-200 text-sm">2 hours ago</p>
                  </div>
                  <button className="text-blue-400 hover:text-blue-300">View</button>
                </div>
                <div className="flex items-center justify-between border-b border-white border-opacity-10 pb-4">
                  <div>
                    <p className="text-white font-semibold">New match with Marcus</p>
                    <p className="text-blue-200 text-sm">1 day ago</p>
                  </div>
                  <button className="text-blue-400 hover:text-blue-300">Message</button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold">Emma sent you a message</p>
                    <p className="text-blue-200 text-sm">2 days ago</p>
                  </div>
                  <button className="text-blue-400 hover:text-blue-300">Reply</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-20 hover:bg-opacity-20 transition-colors text-center">
              <div className="text-2xl mb-2">🔍</div>
              <p className="text-white font-semibold">Browse Matches</p>
              <p className="text-blue-200 text-sm">Discover new roommates</p>
            </button>
            
            <button className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-20 hover:bg-opacity-20 transition-colors text-center">
              <div className="text-2xl mb-2">💬</div>
              <p className="text-white font-semibold">Messages</p>
              <p className="text-blue-200 text-sm">Chat with matches</p>
            </button>
            
            <button className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-20 hover:bg-opacity-20 transition-colors text-center">
              <div className="text-2xl mb-2">⚙️</div>
              <p className="text-white font-semibold">Settings</p>
              <p className="text-blue-200 text-sm">Update preferences</p>
            </button>
            
            <button className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-20 hover:bg-opacity-20 transition-colors text-center">
              <div className="text-2xl mb-2">📝</div>
              <p className="text-white font-semibold">Edit Profile</p>
              <p className="text-blue-200 text-sm">Update your info</p>
            </button>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-2">💡 Pro Tip</h3>
            <p className="text-blue-100 mb-4">
              Complete your profile to get better matches! Users with complete profiles get 3x more responses.
            </p>
            <button className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition-colors">
              Complete Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;