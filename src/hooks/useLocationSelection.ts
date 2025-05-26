import { useState } from 'react';
import { SelectedLocation } from '../types';
import { boroughs, neighborhoods } from '../data/locationData';

interface UseLocationSelectionProps {
  initialLocations?: SelectedLocation[];
  maxSelections?: number;
}

export const useLocationSelection = ({ 
  initialLocations = [], 
  maxSelections = 5 
}: UseLocationSelectionProps = {}) => {
  const [expandedBoroughs, setExpandedBoroughs] = useState<Set<string>>(new Set());
  const [selectedLocations, setSelectedLocations] = useState<SelectedLocation[]>(initialLocations);

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
    } else if (selectedLocations.length < maxSelections) {
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

  const clearAllLocations = (): void => {
    setSelectedLocations([]);
    setExpandedBoroughs(new Set());
  };

  const getBoroughLabel = (value: string): string => {
    return boroughs.find(b => b.value === value)?.label || value;
  };

  const getNeighborhoodLabel = (borough: string, neighborhood: string): string => {
    return neighborhoods[borough]?.find(n => n.value === neighborhood)?.label || neighborhood;
  };

  const isAtMaxSelection = (): boolean => {
    return selectedLocations.length >= maxSelections;
  };

  return {
    expandedBoroughs,
    selectedLocations,
    toggleBorough,
    handleNeighborhoodToggle,
    isNeighborhoodSelected,
    removeLocation,
    clearAllLocations,
    getBoroughLabel,
    getNeighborhoodLabel,
    isAtMaxSelection,
    setSelectedLocations,
  };
};