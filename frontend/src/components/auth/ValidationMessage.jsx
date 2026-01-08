import React from 'react';
import { AlertCircle } from 'lucide-react';

const ValidationMessage = ({ type = 'error', message }) => {
  if (!message) return null;

  const styles = {
    error: 'bg-red-50 border-red-200 text-red-700',
    success: 'bg-green-50 border-green-200 text-green-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700',
  };

  return (
    <div className={`border rounded-md p-3 flex items-start ${styles[type]}`}>
      <AlertCircle className="h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
      <p className="text-sm">{message}</p>
    </div>
  );
};

export default ValidationMessage;
