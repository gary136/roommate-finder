import React, { useState } from 'react';
import BackgroundShapes from './components/BackgroundShapes';
import Header from './components/Header';
import SearchSection from './components/SearchSection';
import Features from './components/Features';
import RegistrationPage from './components/RegistrationPage';
import { SelectedLocation } from './types';
import './styles/globals.css';
import './styles/App.css';
import './styles/RegistrationPage.css';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'landing' | 'registration'>('landing');
  const [selectedLocations, setSelectedLocations] = useState<SelectedLocation[]>([]);

  const handleSearch = (locations: SelectedLocation[]) => {
    setSelectedLocations(locations);
    setCurrentPage('registration');
  };

  const handleBack = () => {
    setCurrentPage('landing');
  };

  if (currentPage === 'registration') {
    return (
      <RegistrationPage 
        initialLocations={selectedLocations} 
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="container">
      <BackgroundShapes />
      <Header />
      <main className="main-content">
        <SearchSection onSearch={handleSearch} />
      </main>
      <Features />
    </div>
  );
};

export default App;