import React, { useState } from 'react';
import { cities, boroughs, neighborhoods } from '../data/locationData';
import { SelectedLocation } from '../types';
import { useLocationSelection } from '../hooks/useLocationSelection';

interface SearchSectionProps {
  onSearch: (locations: SelectedLocation[]) => void;
}

const SearchSection: React.FC<SearchSectionProps> = ({ onSearch }) => {
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [showLocationSelector, setShowLocationSelector] = useState(false);

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
  } = useLocationSelection({ maxSelections: 5 });

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const value = e.target.value;
    setSelectedCity(value);
    setShowLocationSelector(value !== '');
  };

  const handleSearch = (): void => {
    if (selectedCity && selectedLocations.length > 0) {
      setIsSearching(true);
      setTimeout(() => {
        setIsSearching(false);
        onSearch(selectedLocations);
      }, 1500);
    }
  };

  return (
    <div className="search-section">
      {/* City Selector */}
      <div className="city-selector">
        <select
          className="dropdown city-dropdown"
          value={selectedCity}
          onChange={handleCityChange}
        >
          {cities.map((city) => (
            <option key={city.value} value={city.value}>
              {city.label}
            </option>
          ))}
        </select>
      </div>

      {/* Selected Locations Bar */}
      {selectedLocations.length > 0 && (
        <div className="selected-locations-bar">
          <div className="selected-locations-content">
            <span className="selected-count">Selected ({selectedLocations.length}/5):</span>
            {selectedLocations.map((location) => (
              <div key={location.id} className="location-tag">
                <span>
                  {getBoroughLabel(location.borough)} - {getNeighborhoodLabel(location.borough, location.neighborhood)}
                </span>
                <button
                  onClick={() => removeLocation(location.id)}
                  className="remove-btn"
                  aria-label="Remove location"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Borough and Neighborhood Selector */}
      {showLocationSelector && (
        <div className="location-selector">
          <div className="borough-grid">
            {boroughs.map((borough) => (
              <div key={borough.value} className="borough-section">
                <button
                  onClick={() => toggleBorough(borough.value)}
                  className="borough-toggle"
                  aria-expanded={expandedBoroughs.has(borough.value)}
                >
                  <span>{borough.label}</span>
                  <span className="toggle-icon">
                    {expandedBoroughs.has(borough.value) ? '−' : '+'}
                  </span>
                </button>
                
                {expandedBoroughs.has(borough.value) && (
                  <div className="neighborhood-list">
                    {neighborhoods[borough.value]?.map((neighborhood) => {
                      const isSelected = isNeighborhoodSelected(borough.value, neighborhood.value);
                      const isDisabled = isAtMaxSelection() && !isSelected;
                      
                      return (
                        <label
                          key={neighborhood.value}
                          className={`neighborhood-item ${isDisabled ? 'disabled' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleNeighborhoodToggle(borough.value, neighborhood.value)}
                            disabled={isDisabled}
                            className="neighborhood-checkbox"
                          />
                          <span className="neighborhood-label">{neighborhood.label}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {isAtMaxSelection() && (
            <p className="max-selection-warning">
              Maximum of 5 locations reached. Remove a location to select more.
            </p>
          )}
        </div>
      )}

      {/* Search Button */}
      <button
        className="search-btn"
        onClick={handleSearch}
        disabled={!selectedCity || selectedLocations.length === 0 || isSearching}
      >
        {isSearching ? (
          <span className="loading-state">
            <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Searching...
          </span>
        ) : (
          `Search ${selectedLocations.length > 0 ? `(${selectedLocations.length} locations)` : ''}`
        )}
      </button>
    </div>
  );
};

export default SearchSection;