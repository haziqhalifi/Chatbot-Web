import React, { useState, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  AlertCircle,
  CheckCircle,
  Shield,
  Clock,
} from 'lucide-react';

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    verificationCode: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isResendLoading, setIsResendLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resend code
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Real-time validation functions
  const validateEmail = (email) => {
    if (!email) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address';
    // Check for specific email domains if needed
    const allowedDomains = ['gov', 'edu', 'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
    const domain = email.split('@')[1];
    if (domain && !allowedDomains.some((allowed) => domain.includes(allowed))) {
      return 'Please use government, education, or personal email';
    }
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number';
    if (!/(?=.*[@$!%*?&])/.test(password))
      return 'Password must contain at least one special character';
    return '';
  };

  const validateConfirmPassword = (confirmPassword, password) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (confirmPassword !== password) return 'Passwords do not match';
    return '';
  };

  const validateVerificationCode = (code) => {
    if (!code) return 'Verification code is required';
    if (!/^\d{6}$/.test(code)) return 'Verification code must be 6 digits';
    return '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Real-time validation
    if (name === 'email') {
      const emailError = validateEmail(value);
      setErrors((prev) => ({ ...prev, email: emailError }));
    } else if (name === 'password') {
      const passwordError = validatePassword(value);
      setErrors((prev) => ({ ...prev, password: passwordError }));
      // Also revalidate confirm password if it exists
      if (formData.confirmPassword) {
        const confirmError = validateConfirmPassword(formData.confirmPassword, value);
        setErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
      }
    } else if (name === 'confirmPassword') {
      const confirmError = validateConfirmPassword(value, formData.password);
      setErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
    } else if (name === 'verificationCode') {
      const codeError = validateVerificationCode(value);
      setErrors((prev) => ({ ...prev, verificationCode: codeError }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const validateForm = () => {
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(
      formData.confirmPassword,
      formData.password
    );
    const codeError = isCodeSent ? validateVerificationCode(formData.verificationCode) : '';

    const newErrors = {
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
      verificationCode: codeError,
    };

    setErrors(newErrors);
    setTouched({
      email: true,
      password: true,
      confirmPassword: true,
      verificationCode: isCodeSent,
    });

    return !emailError && !passwordError && !confirmPasswordError && (!isCodeSent || !codeError);
  };

  const handleSendCode = async () => {
    // Validate email first
    const emailError = validateEmail(formData.email);
    if (emailError) {
      setErrors((prev) => ({ ...prev, email: emailError }));
      setTouched((prev) => ({ ...prev, email: true }));
      return;
    }

    setIsResendLoading(true);

    try {
      // Simulate API call to send verification code
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setIsCodeSent(true);
      setCountdown(60); // 60 second countdown
      alert(`Verification code sent to ${formData.email}`);
    } catch (error) {
      console.error('Send code error:', error);
      setErrors((prev) => ({
        ...prev,
        general: 'Failed to send verification code. Please try again.',
      }));
    } finally {
      setIsResendLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors((prev) => ({ ...prev, general: '' }));

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate random success/failure for demo
      if (Math.random() > 0.2) {
        console.log('Sign up successful with:', {
          email: formData.email,
          verificationCode: formData.verificationCode,
        });

        alert('Account created successfully! Please check your email for further instructions.');
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      setErrors((prev) => ({
        ...prev,
        general: 'Registration failed. Please check your information and try again.',
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignUp = (provider) => {
    setIsLoading(true);
    setTimeout(() => {
      alert(`${provider} sign up initiated!`);
      setIsLoading(false);
    }, 1000);
  };

  const handleSignIn = () => {
    alert('Redirecting to sign in page...');
  };

  const getFieldError = (fieldName) => {
    return touched[fieldName] && errors[fieldName];
  };

  const isFieldValid = (fieldName) => {
    return touched[fieldName] && !errors[fieldName] && formData[fieldName];
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, text: '' };

    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (/(?=.*[a-z])/.test(password)) strength += 20;
    if (/(?=.*[A-Z])/.test(password)) strength += 20;
    if (/(?=.*\d)/.test(password)) strength += 20;
    if (/(?=.*[@$!%*?&])/.test(password)) strength += 20;

    if (strength <= 40) return { strength, text: 'Weak', color: 'bg-red-500' };
    if (strength <= 60) return { strength, text: 'Fair', color: 'bg-yellow-500' };
    if (strength <= 80) return { strength, text: 'Good', color: 'bg-blue-500' };
    return { strength, text: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <User className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to DisasterWatch</h1>
          {/* <p className="text-sm text-gray-600">
            Only login via government email, education email or personal email
          </p> */}
        </div>

        <div className="bg-white shadow-xl rounded-lg border-2 border-blue-200 p-8">
          {/* Social Sign Up Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleSocialSignUp('Google')}
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign up with Google
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or create account with email</span>
            </div>
          </div>

          {/* Sign Up Form */}
          <div className="space-y-6">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start">
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-red-700 text-sm">{errors.general}</p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
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
                  className={`w-full pl-10 pr-10 py-3 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                    getFieldError('email')
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : isFieldValid('email')
                        ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                        : 'border-gray-300'
                  }`}
                  placeholder="Enter your email address"
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
                Password
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
                  className={`w-full pl-10 pr-10 py-3 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                    getFieldError('password')
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : isFieldValid('password')
                        ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                        : 'border-gray-300'
                  }`}
                  placeholder="Create a strong password"
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

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600">Password strength:</span>
                    <span
                      className={`font-medium ${
                        passwordStrength.strength <= 40
                          ? 'text-red-600'
                          : passwordStrength.strength <= 60
                            ? 'text-yellow-600'
                            : passwordStrength.strength <= 80
                              ? 'text-blue-600'
                              : 'text-green-600'
                      }`}
                    >
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${passwordStrength.strength}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {getFieldError('password') && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-10 py-3 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                    getFieldError('confirmPassword')
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : isFieldValid('confirmPassword')
                        ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                        : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {getFieldError('confirmPassword') && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Verification Code Section */}
            <div>
              <label
                htmlFor="verificationCode"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Code
              </label>
              <div className="flex space-x-3">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Shield className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="verificationCode"
                    name="verificationCode"
                    type="text"
                    maxLength="6"
                    value={formData.verificationCode}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    disabled={!isCodeSent}
                    className={`w-full pl-10 pr-3 py-3 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                      !isCodeSent
                        ? 'bg-gray-100 cursor-not-allowed'
                        : getFieldError('verificationCode')
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                          : isFieldValid('verificationCode')
                            ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                            : 'border-gray-300'
                    }`}
                    placeholder={isCodeSent ? 'Enter 6-digit code' : 'Click Send Code first'}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={isResendLoading || countdown > 0 || !formData.email || !!errors.email}
                  className={`px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors duration-200 ${
                    isResendLoading || countdown > 0 || !formData.email || !!errors.email
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  }`}
                >
                  {isResendLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                      Sending...
                    </div>
                  ) : countdown > 0 ? (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {countdown}s
                    </div>
                  ) : (
                    'Send Code'
                  )}
                </button>
              </div>
              {getFieldError('verificationCode') && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.verificationCode}
                </p>
              )}
              {isCodeSent && !getFieldError('verificationCode') && (
                <p className="mt-2 text-sm text-green-600 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Verification code sent to {formData.email}
                </p>
              )}
            </div>

            {/* Terms and Privacy */}
            <div className="text-xs text-gray-500 text-center">
              By signing up, you consent to DisasterWatch's{' '}
              <a href="#" className="text-blue-600 hover:text-blue-500 underline">
                Terms of Use
              </a>{' '}
              and{' '}
              <a href="#" className="text-blue-600 hover:text-blue-500 underline">
                Privacy Policy
              </a>
              .
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={
                isLoading ||
                !isCodeSent ||
                !!errors.email ||
                !!errors.password ||
                !!errors.confirmPassword ||
                !!errors.verificationCode
              }
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-all duration-200 ${
                isLoading ||
                !isCodeSent ||
                !!errors.email ||
                !!errors.password ||
                !!errors.confirmPassword ||
                !!errors.verificationCode
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 hover:shadow-lg transform hover:-translate-y-0.5'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                'Sign Up'
              )}
            </button>

            {/* Sign In Link */}
            <div className="text-center">
              <span className="text-sm text-gray-600">Already have an account? </span>
              <button
                type="button"
                onClick={handleSignIn}
                className="text-sm text-blue-600 hover:text-blue-500 underline font-medium"
              >
                Log in
              </button>
            </div>
          </div>
        </div>

        {/* Contact Us */}
        <div className="text-center">
          <button
            onClick={() => alert('Contact us clicked')}
            className="text-sm text-gray-600 hover:text-gray-500 underline"
          >
            Contact us
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
