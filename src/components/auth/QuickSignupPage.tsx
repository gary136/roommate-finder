import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import BackgroundShapes from '../common/BackgroundShapes';

interface QuickSignupPageProps {
  onNavigate: (page: string) => void;
}

const QuickSignupPage: React.FC<QuickSignupPageProps> = ({ onNavigate }) => {
  const { quickSignup } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(false);

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name required';
    if (!formData.email.trim()) newErrors.email = 'Email required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.password) newErrors.password = 'Password required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be 6+ characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    const result = await quickSignup(formData);
    setLoading(false);
    
    if (result.success) {
      onNavigate('onboarding');
    } else {
      setErrors({ general: result.error || 'Signup failed' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 relative">
      <BackgroundShapes />
      
      <div className="container mx-auto px-4 py-8 relative z-10 flex items-center justify-center min-h-screen">
        <div className="max-w-md mx-auto">
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-8 border border-white border-opacity-20">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Quick Sign Up</h1>
              <p className="text-blue-200">30 seconds to get started • Complete profile later</p>
            </div>

            {errors.general && (
              <div className="mb-6 p-4 bg-red-500 bg-opacity-20 border border-red-400 rounded-lg">
                <p className="text-red-200 text-sm">{errors.general}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white mb-2 font-semibold">First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)}
                    className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-blue-200 border border-white border-opacity-20 focus:border-blue-400 focus:outline-none"
                    placeholder="First name"
                    disabled={loading}
                  />
                  {errors.firstName && <p className="text-red-300 text-sm mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-white mb-2 font-semibold">Last Name *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                    className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-blue-200 border border-white border-opacity-20 focus:border-blue-400 focus:outline-none"
                    placeholder="Last name"
                    disabled={loading}
                  />
                  {errors.lastName && <p className="text-red-300 text-sm mt-1">{errors.lastName}</p>}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-white mb-2 font-semibold">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-blue-200 border border-white border-opacity-20 focus:border-blue-400 focus:outline-none"
                  placeholder="your.email@example.com"
                  disabled={loading}
                />
                {errors.email && <p className="text-red-300 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-white mb-2 font-semibold">Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-blue-200 border border-white border-opacity-20 focus:border-blue-400 focus:outline-none"
                  placeholder="6+ characters"
                  disabled={loading}
                />
                {errors.password && <p className="text-red-300 text-sm mt-1">{errors.password}</p>}
              </div>

              {/* Phone (Optional) */}
              <div>
                <label className="block text-white mb-2 font-semibold">Phone (Optional)</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', formatPhone(e.target.value))}
                  className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-blue-200 border border-white border-opacity-20 focus:border-blue-400 focus:outline-none"
                  placeholder="(XXX) XXX-XXXX"
                  disabled={loading}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-lg font-bold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50"
              >
                {loading ? '🚀 Creating Account...' : '🚀 Create Account & Continue'}
              </button>
            </form>

            <div className="text-center mt-6">
              <p className="text-blue-300 text-sm">
                Already have an account? <button className="text-blue-400 hover:text-blue-300">Sign In</button>
              </p>
              <p className="text-blue-400 text-xs mt-2">
                By signing up, you agree to our Terms & Privacy Policy
              </p>
            </div>
          </div>

          {/* Back button */}
          <div className="text-center mt-6">
            <button
              onClick={() => onNavigate('preview')}
              className="text-blue-300 hover:text-white transition-colors"
            >
              ← Back to Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickSignupPage;