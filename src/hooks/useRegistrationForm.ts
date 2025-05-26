// src/hooks/useRegistrationForm.ts

import { useState, useCallback, useEffect } from 'react';

export interface FormData {
  // Personal Information
  firstName: string;
  lastName: string;
  ssn: string;
  annualIncome: string;
  moveInDate: string;
  rentDuration: string;
  
  // Account Information
  email: string;
  phoneNumber: string;
  account: string;
  password: string;
  
  // Demographics
  sex: string[];
  age: string;
  ethnicity: string;
  occupation: string;
  languages: string[];
  maxDistanceToMetro: string;
  religion: string;
  sexualOrientation: string;
  political: string;
  
  // Lifestyle
  children: string;
  pets: string;
  smoking: string;
  drinking: string;
  weed: string;
  drugs: string;
}

export interface FormErrors {
  [key: string]: string;
}

const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  ssn: '',
  annualIncome: '',
  moveInDate: '',
  rentDuration: '',
  email: '',
  phoneNumber: '',
  account: '',
  password: '',
  sex: [],
  age: '',
  ethnicity: '',
  occupation: '',
  languages: [],
  maxDistanceToMetro: '',
  religion: '',
  sexualOrientation: '',
  political: '',
  children: '',
  pets: '',
  smoking: '',
  drinking: '',
  weed: '',
  drugs: '',
};

const STORAGE_KEY = 'roommate-registration-form';

export const useRegistrationForm = (saveToStorage: boolean = true) => {
  const [formData, setFormData] = useState<FormData>(() => {
    if (saveToStorage && typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return { ...initialFormData, ...JSON.parse(saved) };
        } catch (error) {
          console.error('Error parsing saved form data:', error);
        }
      }
    }
    return initialFormData;
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Save to localStorage on form data change
  useEffect(() => {
    if (saveToStorage && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData, saveToStorage]);

  const updateField = useCallback((field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const handleSexToggle = useCallback((value: string) => {
    setFormData(prev => ({
      ...prev,
      sex: prev.sex.includes(value)
        ? prev.sex.filter(s => s !== value)
        : [...prev.sex, value]
    }));
    
    if (errors.sex) {
      setErrors(prev => ({ ...prev, sex: '' }));
    }
  }, [errors.sex]);

  const handleLanguageToggle = useCallback((value: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(value)
        ? prev.languages.filter(l => l !== value)
        : [...prev.languages, value]
    }));
    
    if (errors.languages) {
      setErrors(prev => ({ ...prev, languages: '' }));
    }
  }, [errors.languages]);

  const formatSSN = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 9)}`;
  };

  const handleSSNChange = useCallback((value: string) => {
    const formatted = formatSSN(value);
    updateField('ssn', formatted);
  }, [updateField]);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // Required field validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.ssn || formData.ssn.replace(/\D/g, '').length !== 9) {
      newErrors.ssn = 'Valid 9-digit SSN is required';
    }

    if (!formData.annualIncome || parseInt(formData.annualIncome) <= 0) {
      newErrors.annualIncome = 'Valid annual income is required';
    }

    if (!formData.moveInDate) {
      newErrors.moveInDate = 'Move-in date is required';
    }

    if (!formData.rentDuration.trim()) {
      newErrors.rentDuration = 'Rental duration is required';
    }

    // Account Information validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    if (!formData.account.trim()) {
      newErrors.account = 'Username is required';
    } else if (formData.account.length < 3) {
      newErrors.account = 'Username must be at least 3 characters';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and numbers';
    }

    if (formData.sex.length === 0) {
      newErrors.sex = 'Please select at least one option';
    }

    if (!formData.age || parseInt(formData.age) < 18 || parseInt(formData.age) > 100) {
      newErrors.age = 'Age must be between 18 and 100';
    }

    if (!formData.occupation) {
      newErrors.occupation = 'Occupation is required';
    }

    if (formData.languages.length === 0) {
      newErrors.languages = 'Please select at least one language';
    }

    if (!formData.maxDistanceToMetro) {
      newErrors.maxDistanceToMetro = 'Metro distance preference is required';
    }

    // Lifestyle preferences validation
    const lifestyleFields = ['children', 'pets', 'smoking', 'drinking', 'weed', 'drugs'];
    lifestyleFields.forEach(field => {
      if (!formData[field as keyof FormData]) {
        newErrors[field] = 'This field is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const getCompletionPercentage = useCallback((): number => {
    const requiredFields = [
      'firstName', 'lastName', 'ssn', 'annualIncome', 'moveInDate', 'rentDuration',
      'email', 'phoneNumber', 'account', 'password', 'age', 'occupation', 
      'maxDistanceToMetro', 'children', 'pets', 'smoking', 'drinking', 'weed', 'drugs'
    ];
    
    const arrayFields = ['sex', 'languages'];
    
    let completed = 0;
    
    // Check regular fields
    requiredFields.forEach(field => {
      if (formData[field as keyof FormData]) {
        completed++;
      }
    });
    
    // Check array fields
    arrayFields.forEach(field => {
      if ((formData[field as keyof FormData] as string[]).length > 0) {
        completed++;
      }
    });
    
    const totalRequired = requiredFields.length + arrayFields.length;
    return Math.round((completed / totalRequired) * 100);
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
    if (saveToStorage && typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [saveToStorage]);

  const clearStoredData = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return {
    formData,
    errors,
    isSubmitting,
    updateField,
    handleSexToggle,
    handleLanguageToggle,
    handleSSNChange,
    validateForm,
    getCompletionPercentage,
    resetForm,
    clearStoredData,
    setIsSubmitting,
  };
};