import { FormData } from '../hooks/useRegistrationForm';
import { SelectedLocation } from '../types';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// ADD NEW TYPES for value-first journey
export interface QuickSignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface OnboardingStepData {
  step: number;
  data: {
    location?: string[];
    housingSituation?: string;
    budget?: string;
    moveInDate?: string;
    preferences?: {
      cleanliness?: string;
      socialLevel?: string;
      workSchedule?: string;
    };
  };
}

export interface PreviewProfile {
  id: string;
  name: string;
  age: number;
  occupation: string;
  location: string[];
  budget: string;
  bio: string;
  preferences: {
    cleanliness: string;
    socialLevel: string;
    workSchedule: string;
  };
  compatibility: number;
  photo?: string;
}

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

export interface UserRegistrationResponse {
  user: {
    _id: string;
    account: {
      username: string;
      email: string;
      phoneNumber: string;
    };
    personalInfo: any;
    housingInfo: any;
    professionalInfo: any;
    lifestyle: any;
    demographics: any;
    metadata: {
      registrationDate: string;
      profileCompleted: boolean;
    };
  };
  recommendedRent: number;
  nextSteps: string[];
}

export interface CompatibleUser {
  user: any;
  compatibilityScore: number;
  commonLocations: number;
}

// API Service Class - ENHANCED
class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Generic request method with error handling
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Transform frontend form data to backend format
  private transformFormData(formData: FormData, locations: SelectedLocation[]) {
    return {
      account: {
        username: formData.account,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
      },
      personalInfo: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        ssn: formData.ssn.replace(/\D/g, '').replace(/(\d{3})(\d{2})(\d{4})/, '$1-$2-$3'),
        age: parseInt(formData.age),
        sex: formData.sex,
        ethnicity: formData.ethnicity || undefined,
      },
      housingInfo: {
        selectedLocations: locations,
        rentPreferences: {
          minRent: parseInt(formData.minRent),
          maxRent: parseInt(formData.maxRent)
        },
        maxDistanceToMetro: formData.maxDistanceToMetro,
        moveInDate: formData.moveInDate,
        rentDuration: parseInt(formData.rentDuration),
      },
      professionalInfo: {
        occupation: formData.occupation,
        annualIncome: parseInt(formData.annualIncome),
        languages: formData.languages,
      },
      lifestyle: {
        children: formData.children,
        pets: formData.pets,
        smoking: formData.smoking,
        drinking: formData.drinking,
        weed: formData.weed,
        drugs: formData.drugs,
      },
      demographics: {
        religion: formData.religion || undefined,
        sexualOrientation: formData.sexualOrientation || undefined,
        political: formData.political || undefined,
      },
    };
  }

  // Register a new user
  async registerUser(
    formData: FormData,
    locations: SelectedLocation[]
  ): Promise<UserRegistrationResponse> {
    const transformedData = this.transformFormData(formData, locations);
    
    const response = await this.request<UserRegistrationResponse>('/users/register', {
      method: 'POST',
      body: JSON.stringify(transformedData),
    });

    if (!response.success) {
      throw new Error(response.message);
    }

    return response.data!;
  }

  // Get user profile
  async getUserProfile(userId: string) {
    const response = await this.request(`/users/profile/${userId}`);
    
    if (!response.success) {
      throw new Error(response.message);
    }

    return response.data;
  }

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<FormData>) {
    const response = await this.request(`/users/profile/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });

    if (!response.success) {
      throw new Error(response.message);
    }

    return response.data;
  }

  // Find compatible roommates
  async findCompatibleRoommates(
    userId: string,
    options: { limit?: number; minScore?: number } = {}
  ) {
    const queryParams = new URLSearchParams();
    if (options.limit) queryParams.append('limit', options.limit.toString());
    if (options.minScore) queryParams.append('minScore', options.minScore.toString());
    
    const response = await this.request(
      `/users/compatible/${userId}?${queryParams.toString()}`
    );

    if (!response.success) {
      throw new Error(response.message);
    }

    return response.data;
  }

  // Get platform statistics
  async getStats() {
    const response = await this.request('/users/stats');
    
    if (!response.success) {
      throw new Error(response.message);
    }

    return response.data;
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL.replace('/api', '')}/health`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }
  
  // NEW METHODS for value-first journey

  // Quick signup - streamlined registration
  async quickSignup(data: QuickSignupData): Promise<ApiResponse<{ user: any; token: string }>> {
    const response = await this.request<{ user: any; token: string }>('/auth/quick-signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!response.success) {
      throw new Error(response.message);
    }

    return response;
  }

  // Login user
  async loginUser(credentials: { email: string; password: string }): Promise<ApiResponse<{ user: any; token: string }>> {
    const response = await this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (!response.success) {
      throw new Error(response.message);
    }

    return response;
  }

  // Get preview profiles for non-authenticated users
  async getPreviewProfiles(): Promise<ApiResponse<{ profiles: PreviewProfile[] }>> {
    const response = await this.request<{ profiles: PreviewProfile[] }>('/preview/profiles');
    
    if (!response.success) {
      throw new Error(response.message);
    }

    return response;
  }

  // Get preview stats for landing page
  async getPreviewStats(): Promise<ApiResponse<{ stats: { totalUsers: number; successRate: number; avgMatchTime: number } }>> {
    const response = await this.request<{ stats: any }>('/preview/stats');
    
    if (!response.success) {
      throw new Error(response.message);
    }

    return response;
  }

  // Update onboarding step
  async updateOnboardingStep(data: OnboardingStepData, token: string): Promise<ApiResponse<any>> {
    const response = await this.request<any>('/onboarding/step', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.success) {
      throw new Error(response.message);
    }

    return response;
  }

}

// Create singleton instance
const apiService = new ApiService();

// Export individual methods for easier importing
export const registerUser = (formData: FormData, locations: SelectedLocation[]) =>
  apiService.registerUser(formData, locations);

export const getUserProfile = (userId: string) =>
  apiService.getUserProfile(userId);

export const updateUserProfile = (userId: string, updates: Partial<FormData>) =>
  apiService.updateUserProfile(userId, updates);

export const findCompatibleRoommates = (
  userId: string,
  options?: { limit?: number; minScore?: number }
) => apiService.findCompatibleRoommates(userId, options);

export const getStats = () => apiService.getStats();

export const healthCheck = () => apiService.healthCheck();

// NEW CONVENIENCE EXPORTS for value-first journey
export const authAPI = {
  quickSignup: (data: QuickSignupData) => apiService.quickSignup(data),
  login: (email: string, password: string) => apiService.loginUser({ email, password }),
};

export const previewAPI = {
  getProfiles: () => apiService.getPreviewProfiles(),
  getStats: () => apiService.getPreviewStats(),
};

export const onboardingAPI = {
  updateStep: (data: OnboardingStepData, token: string) => apiService.updateOnboardingStep(data, token),
};

export default apiService;