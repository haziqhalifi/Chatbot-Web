import React from 'react';

const ActionButtons = ({ updating, onCancel }) => {
  return (
    <div className="flex gap-4">
      <button
        type="submit"
        disabled={updating}
        className={`px-6 py-3 rounded-lg transition-all duration-200 flex-1 font-medium ${
          updating
            ? 'bg-gray-400 cursor-not-allowed text-white'
            : 'bg-[#0a4974] text-white hover:bg-[#083757] shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
        }`}
      >
        {updating ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Saving Changes...
          </span>
        ) : (
          'Save Changes'
        )}
      </button>

      <button
        type="button"
        onClick={onCancel}
        className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium"
      >
        Cancel
      </button>
    </div>
  );
};

export default ActionButtons;
