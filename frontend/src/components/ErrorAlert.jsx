import React from 'react';
import { X, AlertCircle } from 'lucide-react';

const ErrorAlert = ({ error, onClose }) => {
  if (!error) return null;

  return (
    <div className="mx-6 mt-6 bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-red-200 text-sm">{error}</p>
      </div>
      <button 
        onClick={onClose} 
        className="text-red-200 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ErrorAlert;