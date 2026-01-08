import React from 'react';
import { Shield, Clock, AlertCircle, CheckCircle } from 'lucide-react';

const VerificationCodeInput = ({
  value,
  onChange,
  onBlur,
  onSendCode,
  isCodeSent,
  isResendLoading,
  countdown,
  error,
  isValid,
  email,
  emailError,
  disabled,
}) => {
  return (
    <div>
      <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-2">
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
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={!isCodeSent || disabled}
            className={`w-full pl-10 pr-3 py-3 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
              !isCodeSent || disabled
                ? 'bg-gray-100 cursor-not-allowed'
                : error
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : isValid
                    ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                    : 'border-gray-300'
            }`}
            placeholder={isCodeSent ? 'Enter 6-digit code' : 'Click Send Code first'}
          />
        </div>
        <button
          type="button"
          onClick={onSendCode}
          disabled={isResendLoading || countdown > 0 || !email || !!emailError}
          className={`px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors duration-200 ${
            isResendLoading || countdown > 0 || !email || !!emailError
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
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </p>
      )}
      {isCodeSent && !error && (
        <p className="mt-2 text-sm text-green-600 flex items-center">
          <CheckCircle className="h-4 w-4 mr-1" />
          Verification code sent to {email}
        </p>
      )}
    </div>
  );
};

export default VerificationCodeInput;
