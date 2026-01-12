import React, { useState, useEffect } from 'react';
import { Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  FormInput,
  PasswordInput,
  ValidationMessage,
  SocialLoginButtons,
  ForgotPasswordModal,
  AuthLayout,
} from '../../components/auth';

const SignInPage = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState('');
  const [forgotError, setForgotError] = useState('');

  const navigate = useNavigate();

  // Real-time validation functions
  const validateEmail = (email) => {
    if (!email) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address';
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));

    // Real-time validation
    if (name === 'email') {
      setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
    } else if (name === 'password') {
      setErrors((prev) => ({ ...prev, password: validatePassword(value) }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const validateForm = () => {
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    const newErrors = {
      email: emailError,
      password: passwordError,
    };

    setErrors(newErrors);
    setTouched({ email: true, password: true });

    return !emailError && !passwordError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors((prev) => ({ ...prev, general: '' }));
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch('http://localhost:8000/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Invalid email or password. Please try again.';

        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          errorMessage = data.detail || errorMessage;
        }

        // Provide specific error messages based on status code
        if (response.status === 401) {
          errorMessage = 'Invalid email or password. Please check your credentials.';
        } else if (response.status === 404) {
          errorMessage = 'Account not found. Please sign up first.';
        } else if (response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!data.token || !data.user) {
        throw new Error('Invalid response from server. Please try again.');
      }

      login(data.token, data.user);

      // Redirect based on user role
      if (data.user && data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      let errorMessage = 'An unexpected error occurred. Please try again.';

      if (error.name === 'AbortError') {
        errorMessage = 'Request timeout. Please check your internet connection and try again.';
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setErrors((prev) => ({
        ...prev,
        general: errorMessage,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    setIsLoading(true);
    setErrors((prev) => ({ ...prev, general: '' }));

    // Simulate social login
    setTimeout(() => {
      setErrors((prev) => ({
        ...prev,
        general: `${provider} login is not yet configured. Please use email login.`,
      }));
      setIsLoading(false);
    }, 500);
  };

  const handleForgotPassword = () => {
    setForgotStatus('');
    setForgotError('');
    setForgotEmail(formData.email || '');
    setShowForgotModal(true);
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotStatus('');
    setForgotError('');

    const emailError = validateEmail(forgotEmail);
    if (emailError) {
      setForgotError(emailError);
      return;
    }

    setIsLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch('http://localhost:8000/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const contentType = response.headers.get('content-type');
      let data = {};

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to send reset link. Please try again.');
      }

      setForgotStatus('If the email exists, a reset link has been sent to your inbox.');

      // Clear the form after 3 seconds
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotEmail('');
        setForgotStatus('');
      }, 3000);
    } catch (err) {
      let errorMessage = 'Failed to send reset link. Please try again.';

      if (err.name === 'AbortError') {
        errorMessage = 'Request timeout. Please check your internet connection.';
      } else if (err.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setForgotError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  const getFieldError = (fieldName) => {
    return touched[fieldName] && errors[fieldName];
  };

  const isFieldValid = (fieldName) => {
    return touched[fieldName] && !errors[fieldName] && formData[fieldName];
  };

  const handleGoogleResponse = async (response) => {
    setIsLoading(true);
    setErrors((prev) => ({ ...prev, general: '' }));

    try {
      if (!response || !response.credential) {
        throw new Error('Google authentication failed. Please try again.');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const res = await fetch('http://localhost:8000/google-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const contentType = res.headers.get('content-type');
        let errorMessage = 'Google sign in failed. Please try again.';

        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          errorMessage = data.detail || errorMessage;
        }

        if (res.status === 403) {
          errorMessage = 'Access denied. Please contact support.';
        } else if (res.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }

        throw new Error(errorMessage);
      }

      const data = await res.json();

      if (!data.token) {
        throw new Error('Invalid response from server. Please try again.');
      }

      login(data.token, { email: data.email, name: data.name });
      navigate('/dashboard');
    } catch (error) {
      let errorMessage = 'Google sign in failed. Please try again.';

      if (error.name === 'AbortError') {
        errorMessage = 'Request timeout. Please check your internet connection.';
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setErrors((prev) => ({ ...prev, general: errorMessage }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome to DisasterWatch">
      <ForgotPasswordModal
        show={showForgotModal}
        email={forgotEmail}
        setEmail={setForgotEmail}
        onSubmit={handleForgotSubmit}
        onCancel={() => setShowForgotModal(false)}
        isLoading={isLoading}
        error={forgotError}
        status={forgotStatus}
      />

      <div className="bg-white shadow-xl rounded-lg p-8">
        <SocialLoginButtons onGoogleResponse={handleGoogleResponse} mode="signin" />

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with email</span>
          </div>
        </div>

        {/* Sign In Form */}
        <div className="space-y-6">
          <ValidationMessage type="error" message={errors.general} />

          <FormInput
            id="email"
            name="email"
            type="email"
            label="Email Address"
            value={formData.email}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder="Enter your email address"
            error={getFieldError('email')}
            isValid={isFieldValid('email')}
            icon={Mail}
          />

          <PasswordInput
            id="password"
            name="password"
            label="Password"
            value={formData.password}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder="Enter your password"
            error={getFieldError('password')}
            isValid={isFieldValid('password')}
          />

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-blue-600 hover:text-blue-500 underline"
            >
              Forgot password?
            </button>
          </div>

          {/* Terms and Privacy */}
          <div className="text-xs text-gray-500 text-center">
            By signing up or logging in, you consent to DisasterWatch's{' '}
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
            disabled={isLoading || !!errors.email || !!errors.password}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-all duration-200 ${
              isLoading || !!errors.email || !!errors.password
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 hover:shadow-lg transform hover:-translate-y-0.5'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}
          </button>

          {/* Sign Up Link */}
          <div className="text-center">
            <span className="text-sm text-gray-600">Don't have an account? </span>
            <button
              type="button"
              onClick={handleSignUp}
              className="text-sm text-blue-600 hover:text-blue-500 underline font-medium"
            >
              Sign up here
            </button>
          </div>
        </div>
      </div>

      {/* Contact Us */}
      <div className="text-center space-y-2">
        <a
          href="mailto:support@disasterwatch.com"
          className="text-sm text-gray-600 hover:text-gray-500 underline"
        >
          Contact us
        </a>
        <div className="text-xs text-gray-400">
          <button
            onClick={() => navigate('/admin/signin')}
            className="text-gray-400 hover:text-gray-600 underline"
          >
            Emergency Management Access
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default SignInPage;
