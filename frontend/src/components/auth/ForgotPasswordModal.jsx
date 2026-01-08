import React from 'react';

const ForgotPasswordModal = ({
  show,
  email,
  setEmail,
  onSubmit,
  onCancel,
  isLoading,
  error,
  status,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        <h3 className="text-lg font-bold mb-2">Forgot Password</h3>
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type="email"
            className="w-full px-4 py-2 border rounded-md"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {status && <div className="text-green-600 text-sm">{status}</div>}
          <div className="flex space-x-2 mt-2">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <button
              type="button"
              className="flex-1 py-2 px-4 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
