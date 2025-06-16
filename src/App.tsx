import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { SelectedLocation } from './types';

// Existing components
import RegistrationPage from './components/RegistrationPage';

// New page components
import LandingPage from './components/landing/LandingPage';
import PreviewPage from './components/preview/PreviewPage';
import QuickSignupPage from './components/auth/QuickSignupPage';
import OnboardingPage from './components/onboarding/OnboardingPage';
import DashboardPage from './components/dashboard/DashboardPage';

// Styles
import './styles/globals.css';
import './styles/App.css';
import './styles/RegistrationPage.css';

type PageType = 'landing' | 'preview' | 'signup' | 'onboarding' | 'dashboard' | 'registration';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageType>('landing');
  const [selectedLocations, setSelectedLocations] = useState<SelectedLocation[]>([]);
  const { user, loading } = useAuth();

  const navigate = (page: string, locations?: SelectedLocation[]) => {
    if (locations) {
      setSelectedLocations(locations);
    }
    setCurrentPage(page as PageType);
  };

  // Auto-redirect logic based on user state
  useEffect(() => {
    if (!loading && user) {
      if (!user.onboardingCompleted && currentPage !== 'onboarding') {
        setCurrentPage('onboarding');
      } else if (user.onboardingCompleted && (currentPage === 'onboarding' || currentPage === 'signup')) {
        setCurrentPage('dashboard');
      }
    }
  }, [user, loading, currentPage]);

  const handleBackFromRegistration = () => {
    setCurrentPage('landing');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Route to appropriate page
  switch (currentPage) {
    case 'landing':
      return <LandingPage onNavigate={navigate} />;
      
    case 'preview':
      return <PreviewPage onNavigate={navigate} />;
      
    case 'signup':
      return <QuickSignupPage onNavigate={navigate} />;
      
    case 'onboarding':
      return <OnboardingPage onNavigate={navigate} />;
      
    case 'dashboard':
      return <DashboardPage onNavigate={navigate} />;
      
    case 'registration':
      return (
        <RegistrationPage 
          initialLocations={selectedLocations} 
          onBack={handleBackFromRegistration}
        />
      );
      
    default:
      return <LandingPage onNavigate={navigate} />;
  }
};

export default App;