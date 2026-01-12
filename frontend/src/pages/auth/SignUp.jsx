import React, { useState, useEffect } from 'react';
import { Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  FormInput,
  PasswordInput,
  ValidationMessage,
  SocialLoginButtons,
  VerificationCodeInput,
  PasswordStrengthIndicator,
  AuthLayout,
} from '../../components/auth';

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    verificationCode: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isResendLoading, setIsResendLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

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
    setErrors((prev) => ({ ...prev, general: '' }));

    try {
      const endpoint = isCodeSent ? '/resend-verification-code' : '/send-verification-code';

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Failed to send verification code. Please try again.';

        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          errorMessage = data.detail || errorMessage;
        }

        if (response.status === 429) {
          errorMessage = 'Too many requests. Please wait a moment before trying again.';
        } else if (response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }

        throw new Error(errorMessage);
      }

      setIsCodeSent(true);
      setCountdown(60);
      setFormData((prev) => ({ ...prev, verificationCode: '' }));

      const data = await response.json();
      setErrors((prev) => ({
        ...prev,
        general: '',
        verification: data.message || `Verification code sent to ${formData.email}`,
      }));

      // Clear success message after 5 seconds
      setTimeout(() => {
        setErrors((prev) => ({ ...prev, verification: '' }));
      }, 5000);
    } catch (error) {
      console.error('Send code error:', error);

      let errorMessage = 'Failed to send verification code. Please try again.';

      if (error.name === 'AbortError') {
        errorMessage = 'Request timeout. Please check your internet connection.';
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
      setIsResendLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors((prev) => ({ ...prev, general: '' }));

    try {
      // First, verify the signup code
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const verifyResponse = await fetch(
        `http://localhost:8000/verify-signup-code?code=${encodeURIComponent(formData.verificationCode)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!verifyResponse.ok) {
        const contentType = verifyResponse.headers.get('content-type');
        let errorMessage = 'Email verification failed. Please check your code.';

        if (contentType && contentType.includes('application/json')) {
          const data = await verifyResponse.json();
          errorMessage = data.detail || errorMessage;
        }

        if (verifyResponse.status === 400) {
          errorMessage = 'Invalid or expired verification code. Please request a new one.';
        }

        throw new Error(errorMessage);
      }

      // Verification successful, now create the account
      const timeoutId2 = setTimeout(() => controller.abort(), 15000);

      const signupResponse = await fetch('http://localhost:8000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId2);

      if (!signupResponse.ok) {
        const contentType = signupResponse.headers.get('content-type');
        let errorMessage = 'Registration failed. Please try again.';

        if (contentType && contentType.includes('application/json')) {
          const data = await signupResponse.json();
          errorMessage = data.detail || errorMessage;
        }

        if (signupResponse.status === 400) {
          errorMessage = 'Email already registered. Please sign in instead.';
        } else if (signupResponse.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }

        throw new Error(errorMessage);
      }

      // Success - navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      let errorMessage = 'Registration failed. Please try again.';

      if (error.name === 'AbortError') {
        errorMessage = 'Request timeout. Please check your internet connection.';
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

  const handleSocialSignUp = (provider) => {
    setIsLoading(true);
    setErrors((prev) => ({ ...prev, general: '' }));

    setTimeout(() => {
      setErrors((prev) => ({
        ...prev,
        general: `${provider} sign up is not yet configured. Please use email registration.`,
      }));
      setIsLoading(false);
    }, 500);
  };

  const handleSignIn = () => {
    navigate('/signin');
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
        let errorMessage = 'Google sign up failed. Please try again.';

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

      navigate('/dashboard');
    } catch (error) {
      let errorMessage = 'Google sign up failed. Please try again.';

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
      <div className="bg-white shadow-xl rounded-lg border-2 border-blue-200 p-8">
        <SocialLoginButtons onGoogleResponse={handleGoogleResponse} mode="signup" />

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
          <ValidationMessage type="error" message={errors.general} />
          {errors.verification && (
            <ValidationMessage type="success" message={errors.verification} />
          )}

          <FormInput
            id="email"
            name="email"
            type="email"
            label="Email"
            value={formData.email}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder="Enter your email address"
            error={getFieldError('email')}
            isValid={isFieldValid('email')}
            icon={Mail}
          />

          <div>
            <PasswordInput
              id="password"
              name="password"
              label="Password"
              value={formData.password}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="Create a strong password"
              error={getFieldError('password')}
              isValid={isFieldValid('password')}
            />
            <PasswordStrengthIndicator password={formData.password} />
          </div>

          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder="Confirm your password"
            error={getFieldError('confirmPassword')}
            isValid={isFieldValid('confirmPassword')}
          />

          <VerificationCodeInput
            value={formData.verificationCode}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onSendCode={handleSendCode}
            isCodeSent={isCodeSent}
            isResendLoading={isResendLoading}
            countdown={countdown}
            error={getFieldError('verificationCode')}
            isValid={isFieldValid('verificationCode')}
            email={formData.email}
            emailError={errors.email}
          />

          {/* Terms and Privacy */}
          <div className="text-xs text-gray-500 text-center">
            By signing up, you consent to DisasterWatch's{' '}
            <a
              href="/terms-of-use"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-500 underline"
            >
              Terms of Use
            </a>{' '}
            and{' '}
            <a
              href="/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-500 underline"
            >
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
    </AuthLayout>
  );
};

export default SignUpPage;
