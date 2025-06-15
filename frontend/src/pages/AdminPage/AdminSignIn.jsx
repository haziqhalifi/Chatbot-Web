import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminSignInPage = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
    adminCode: '', // Additional admin verification code
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showAdminCode, setShowAdminCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const navigate = useNavigate();

  // Real-time validation functions
  const validateEmail = (email) => {
    if (!email) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address';

    // Check for government, education, or personal emails
    const domain = email.split('@')[1]?.toLowerCase() || '';

    // Government domains
    const isGovernment =
      domain.endsWith('.gov') ||
      domain.endsWith('.gov.my') ||
      domain.endsWith('.mil') ||
      domain.includes('government') ||
      domain.includes('emergency') ||
      domain.includes('disaster');

    // Education domains
    const isEducation =
      domain.endsWith('.edu') ||
      domain.endsWith('.edu.my') ||
      domain.endsWith('.ac.my') ||
      domain.includes('university') ||
      domain.includes('college');

    // Personal email domains
    const personalDomains = [
      'gmail.com',
      'yahoo.com',
      'hotmail.com',
      'outlook.com',
      'live.com',
      'icloud.com',
      'protonmail.com',
      'tutanota.com',
    ];
    const isPersonal = personalDomains.includes(domain);

    if (!isGovernment && !isEducation && !isPersonal) {
      return 'Please use a government, education, or personal email address';
    }

    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 12) return 'Admin password must be at least 12 characters';
    if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number';
    if (!/(?=.*[@$!%*?&])/.test(password))
      return 'Password must contain at least one special character';
    return '';
  };

  const validateAdminCode = (code) => {
    if (!code) return 'Admin verification code is required';
    if (code.length !== 8) return 'Admin code must be 8 characters';
    if (!/^[A-Z0-9]+$/.test(code))
      return 'Admin code must contain only uppercase letters and numbers';
    return '';
  };
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let fieldValue = type === 'checkbox' ? checked : value;

    // Auto-convert admin code to uppercase
    if (name === 'adminCode') {
      fieldValue = value.toUpperCase();
    }

    setFormData((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));

    // Real-time validation
    if (name === 'email') {
      const emailError = validateEmail(value);
      setErrors((prev) => ({ ...prev, email: emailError }));
    } else if (name === 'password') {
      const passwordError = validatePassword(value);
      setErrors((prev) => ({ ...prev, password: passwordError }));
    } else if (name === 'adminCode') {
      const adminCodeError = validateAdminCode(fieldValue); // Use uppercase value
      setErrors((prev) => ({ ...prev, adminCode: adminCodeError }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const validateForm = () => {
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    const adminCodeError = validateAdminCode(formData.adminCode);

    const newErrors = {
      email: emailError,
      password: passwordError,
      adminCode: adminCodeError,
    };

    setErrors(newErrors);
    setTouched({ email: true, password: true, adminCode: true });

    return !emailError && !passwordError && !adminCodeError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors((prev) => ({ ...prev, general: '' }));

    try {
      const response = await fetch('http://localhost:8000/admin/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          adminCode: formData.adminCode,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.detail || 'Invalid admin credentials. Please verify your information.'
        );
      }

      const data = await response.json();
      // Set admin role in login
      login(data.token, { ...data.user, role: 'admin' });
      navigate('/admin/dashboard');
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        general: error.message || 'Invalid admin credentials. Please verify your information.',
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToRegularSignIn = () => {
    navigate('/signin');
  };

  const getFieldError = (fieldName) => {
    return touched[fieldName] && errors[fieldName];
  };

  const isFieldValid = (fieldName) => {
    return touched[fieldName] && !errors[fieldName] && formData[fieldName];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-red-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-white" />
          </div>{' '}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Portal</h1>
          <p className="text-sm text-gray-600">
            Authorized Personnel Only - Use Government Email Only
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-lg p-8 border-l-4 border-red-500">
          {/* Security Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Security Notice</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  This portal is restricted to authorized emergency management personnel only. All
                  access attempts are logged and monitored.
                </p>
              </div>
            </div>
          </div>

          {/* Sign In Form */}
          <div className="space-y-6">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start">
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-red-700 text-sm">{errors.general}</p>
              </div>
            )}
            {/* Email Field */}{' '}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Government Email Only
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-10 py-3 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200 ${
                    getFieldError('email')
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : isFieldValid('email')
                        ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                        : 'border-gray-300'
                  }`}
                  placeholder="Enter your government email address"
                />
                {isFieldValid('email') && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                )}
              </div>
              {getFieldError('email') && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.email}
                </p>
              )}
            </div>
            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Admin Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-10 py-3 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200 ${
                    getFieldError('password')
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : isFieldValid('password')
                        ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                        : 'border-gray-300'
                  }`}
                  placeholder="Enter your admin password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {getFieldError('password') && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.password}
                </p>
              )}
            </div>
            {/* Admin Code Field */}
            <div>
              <label htmlFor="adminCode" className="block text-sm font-medium text-gray-700 mb-2">
                Admin Verification Code
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Shield className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="adminCode"
                  name="adminCode"
                  type={showAdminCode ? 'text' : 'password'}
                  value={formData.adminCode}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-10 py-3 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200 uppercase tracking-wider ${
                    getFieldError('adminCode')
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : isFieldValid('adminCode')
                        ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                        : 'border-gray-300'
                  }`}
                  placeholder="XXXXXXXX"
                  maxLength="8"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminCode(!showAdminCode)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showAdminCode ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {getFieldError('adminCode') && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.adminCode}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                8-character code provided by your system administrator
              </p>
            </div>
            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                Keep me signed in on this device
              </label>
            </div>
            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading || !!errors.email || !!errors.password || !!errors.adminCode}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-all duration-200 ${
                isLoading || !!errors.email || !!errors.password || !!errors.adminCode
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-offset-2 focus:ring-red-500 hover:shadow-lg transform hover:-translate-y-0.5'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Authenticating...
                </div>
              ) : (
                <div className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Access Admin Portal
                </div>
              )}
            </button>
            {/* Back to Regular Sign In */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleBackToRegularSignIn}
                className="text-sm text-gray-600 hover:text-gray-500 underline"
              >
                ← Back to Regular Sign In
              </button>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-2">For technical support or account issues:</div>
          <button
            onClick={() => alert('Emergency IT Support: +1-800-DISASTER')}
            className="text-sm text-red-600 hover:text-red-500 underline font-medium"
          >
            Emergency IT Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSignInPage;
