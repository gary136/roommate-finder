import React, { useState } from 'react';
import { cities, boroughs, neighborhoods } from '../data/locationData';
import { SelectedLocation } from '../types';

interface SearchSectionProps {
  onSearch: (locations: SelectedLocation[]) => void;
}

const SearchSection: React.FC<SearchSectionProps> = ({ onSearch }) => {
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [expandedBoroughs, setExpandedBoroughs] = useState<Set<string>>(new Set());
  const [selectedLocations, setSelectedLocations] = useState<SelectedLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showLocationSelector, setShowLocationSelector] = useState(false);

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const value = e.target.value;
    setSelectedCity(value);
    setExpandedBoroughs(new Set());
    setSelectedLocations([]);
    setShowLocationSelector(value !== '');
  };

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
      // Remove if already selected
      setSelectedLocations(selectedLocations.filter(loc => loc.id !== locationId));
    } else if (selectedLocations.length < 5) {
      // Add if under limit
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

  const handleSearch = (): void => {
    if (selectedCity && selectedLocations.length > 0) {
      setIsSearching(true);
      setTimeout(() => {
        setIsSearching(false);
        onSearch(selectedLocations);
      }, 1500);
    }
  };

  const getBoroughLabel = (value: string): string => {
    return boroughs.find(b => b.value === value)?.label || value;
  };

  const getNeighborhoodLabel = (borough: string, neighborhood: string): string => {
    return neighborhoods[borough]?.find(n => n.value === neighborhood)?.label || neighborhood;
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
                <span>{getBoroughLabel(location.borough)} - {getNeighborhoodLabel(location.borough, location.neighborhood)}</span>
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
                    {neighborhoods[borough.value]?.map((neighborhood) => (
                      <label
                        key={neighborhood.value}
                        className={`neighborhood-item ${
                          selectedLocations.length >= 5 && !isNeighborhoodSelected(borough.value, neighborhood.value)
                            ? 'disabled'
                            : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isNeighborhoodSelected(borough.value, neighborhood.value)}
                          onChange={() => handleNeighborhoodToggle(borough.value, neighborhood.value)}
                          disabled={selectedLocations.length >= 5 && !isNeighborhoodSelected(borough.value, neighborhood.value)}
                          className="neighborhood-checkbox"
                        />
                        <span className="neighborhood-label">{neighborhood.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {selectedLocations.length >= 5 && (
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