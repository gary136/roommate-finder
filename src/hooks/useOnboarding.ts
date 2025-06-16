import { useState } from 'react';
import { onboardingAPI, OnboardingStepData } from '../services/apiService';
import { SelectedLocation } from '../types'; // Import your existing type

export interface OnboardingData {
  location: SelectedLocation[]; // Changed from string[] to SelectedLocation[]
  housingSituation: 'looking' | 'have-apartment' | 'flexible' | '';
  budget: string;
  moveInDate: string;
  preferences: {
    cleanliness: string;
    socialLevel: string;
    workSchedule: string;
  };
}

const initialData: OnboardingData = {
  location: [],
  housingSituation: '',
  budget: '',
  moveInDate: '',
  preferences: {
    cleanliness: '',
    socialLevel: '',
    workSchedule: ''
  }
};

export const useOnboarding = () => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const saveStep = async (token: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const stepData: OnboardingStepData = {
        step,
        data: {
          // Convert SelectedLocation[] to string[] for API
          location: data.location.map(loc => `${loc.borough} - ${loc.neighborhood}`),
          housingSituation: data.housingSituation,
          budget: data.budget,
          moveInDate: data.moveInDate,
          preferences: data.preferences
        }
      };

      const response = await onboardingAPI.updateStep(stepData, token);
      
      if (response.success) {
        return true;
      }
      
      setError(response.message || 'Failed to save step');
      return false;
    } catch (err) {
      setError((err as Error).message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(1);
    setData(initialData);
    setError(null);
  };

  return {
    step,
    data,
    loading,
    error,
    updateData,
    nextStep,
    prevStep,
    saveStep,
    reset,
    totalSteps: 3
  };
};