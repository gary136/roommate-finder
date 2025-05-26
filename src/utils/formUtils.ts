import { FormData } from '../hooks/useRegistrationForm';
import { SelectedLocation } from '../types';

export interface SubmissionData {
  locations: SelectedLocation[];
  personalInfo: FormData;
  submittedAt: string;
}

/**
 * Validates if a date is in the future
 */
export const isValidFutureDate = (dateString: string): boolean => {
  const selectedDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selectedDate >= today;
};

/**
 * Validates SSN format (XXX-XX-XXXX)
 */
export const isValidSSN = (ssn: string): boolean => {
  const ssnRegex = /^\d{3}-\d{2}-\d{4}$/;
  return ssnRegex.test(ssn);
};

/**
 * Validates email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Formats currency for display
 */
export const formatCurrency = (amount: string | number): string => {
  const num = typeof amount === 'string' ? parseInt(amount) : amount;
  if (isNaN(num)) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

/**
 * Calculates recommended rent based on income (30% rule)
 */
export const calculateRecommendedRent = (annualIncome: string): number => {
  const income = parseInt(annualIncome);
  if (isNaN(income) || income <= 0) return 0;
  return Math.floor((income * 0.3) / 12);
};

/**
 * Gets the display label for a form option
 */
export const getOptionLabel = (
  options: Array<{ value: string; label: string }>,
  value: string
): string => {
  const option = options.find(opt => opt.value === value);
  return option?.label || value;
};

/**
 * Sanitizes form data before submission
 */
export const sanitizeFormData = (formData: FormData): FormData => {
  return {
    ...formData,
    firstName: formData.firstName.trim(),
    lastName: formData.lastName.trim(),
    ssn: formData.ssn.replace(/\D/g, ''), // Remove formatting for storage
    annualIncome: formData.annualIncome.replace(/[^\d]/g, ''),
    rentDuration: formData.rentDuration.trim(),
  };
};

/**
 * Prepares data for submission to API
 */
export const prepareSubmissionData = (
  formData: FormData,
  locations: SelectedLocation[]
): SubmissionData => {
  return {
    locations,
    personalInfo: sanitizeFormData(formData),
    submittedAt: new Date().toISOString(),
  };
};

/**
 * Validates minimum age requirement
 */
export const isValidAge = (age: string): boolean => {
  const ageNum = parseInt(age);
  return !isNaN(ageNum) && ageNum >= 18 && ageNum <= 100;
};

/**
 * Generates a summary of form completion for progress tracking
 */
export const getFormSummary = (formData: FormData, locations: SelectedLocation[]) => {
  const requiredFields = {
    personalInfo: ['firstName', 'lastName', 'ssn', 'annualIncome', 'moveInDate', 'rentDuration'],
    demographics: ['sex', 'age', 'occupation', 'languages', 'maxDistanceToMetro'],
    lifestyle: ['children', 'pets', 'smoking', 'drinking', 'weed', 'drugs'],
  };

  const summary = {
    locations: locations.length,
    personalInfo: 0,
    demographics: 0,
    lifestyle: 0,
    total: 0,
  };

  // Count completed personal info fields
  requiredFields.personalInfo.forEach(field => {
    if (formData[field as keyof FormData]) {
      summary.personalInfo++;
    }
  });

  // Count completed demographic fields
  requiredFields.demographics.forEach(field => {
    const value = formData[field as keyof FormData];
    if (Array.isArray(value) ? value.length > 0 : value) {
      summary.demographics++;
    }
  });

  // Count completed lifestyle fields
  requiredFields.lifestyle.forEach(field => {
    if (formData[field as keyof FormData]) {
      summary.lifestyle++;
    }
  });

  summary.total = summary.personalInfo + summary.demographics + summary.lifestyle;

  return {
    ...summary,
    percentages: {
      personalInfo: Math.round((summary.personalInfo / requiredFields.personalInfo.length) * 100),
      demographics: Math.round((summary.demographics / requiredFields.demographics.length) * 100),
      lifestyle: Math.round((summary.lifestyle / requiredFields.lifestyle.length) * 100),
      overall: Math.round(summary.total / (requiredFields.personalInfo.length + requiredFields.demographics.length + requiredFields.lifestyle.length) * 100),
    },
  };
};