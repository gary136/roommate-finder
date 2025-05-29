import { FormData } from '../hooks/useRegistrationForm';
import { SelectedLocation } from '../types';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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

// API Service Class
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
        maxDistanceToMetro: formData.maxDistanceToMetro,
        moveInDate: formData.moveInDate,
        rentDuration: formData.rentDuration,
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

export default apiService;