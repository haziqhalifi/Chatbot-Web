import React from 'react';

const DeleteAccountModal = ({ show, onCancel, onConfirm }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full relative">
        <h3 className="text-lg font-bold mb-4">Confirm Account Deletion</h3>
        <p className="mb-6">
          Are you sure you want to delete your account? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-2">
          <button
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
