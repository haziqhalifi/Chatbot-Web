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
} from '../components/auth';

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

    try {
      // Use resend endpoint if code was already sent, otherwise use send endpoint
      const endpoint = isCodeSent ? '/resend-verification-code' : '/send-verification-code';
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to send verification code');
      }

      setIsCodeSent(true);
      setCountdown(60); // 60 second countdown
      // Clear previous code when resending
      setFormData((prev) => ({ ...prev, verificationCode: '' }));
      const data = await response.json();
      alert(data.message || `Verification code sent to ${formData.email}`);
    } catch (error) {
      console.error('Send code error:', error);
      setErrors((prev) => ({
        ...prev,
        general: error.message || 'Failed to send verification code. Please try again.',
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
      const verifyResponse = await fetch(
        `http://localhost:8000/verify-signup-code?code=${encodeURIComponent(formData.verificationCode)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email }),
        }
      );

      if (!verifyResponse.ok) {
        const data = await verifyResponse.json();
        throw new Error(data.detail || 'Email verification failed');
      }

      // Verification successful, now create the account
      const signupResponse = await fetch('http://localhost:8000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!signupResponse.ok) {
        const data = await signupResponse.json();
        throw new Error(data.detail || 'Registration failed');
      }

      navigate('/dashboard');
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        general:
          error.message || 'Registration failed. Please check your information and try again.',
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
    try {
      const res = await fetch('http://localhost:8000/google-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Google sign up failed');
      }
      navigate('/dashboard');
    } catch (error) {
      setErrors((prev) => ({ ...prev, general: error.message || 'Google sign up failed.' }));
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
    </AuthLayout>
  );
};

export default SignUpPage;
