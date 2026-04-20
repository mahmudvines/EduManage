// components/common/LoadingSpinner.js
import React from 'react';

export const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className={`${sizes[size]} border-4 border-blue-500 border-t-transparent rounded-full animate-spin`} />
      {text && <p className="text-sm text-gray-400">{text}</p>}
    </div>
  );
};

export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
    {Icon && (
      <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <Icon size={28} className="text-gray-400" />
      </div>
    )}
    <div>
      <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300">{title}</h3>
      {description && <p className="text-sm text-gray-400 mt-1">{description}</p>}
    </div>
    {action}
  </div>
);

export const ErrorAlert = ({ message, onDismiss }) => (
  <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
    <div className="w-2 h-2 mt-1.5 rounded-full bg-red-500 flex-shrink-0" />
    <p className="text-sm text-red-700 dark:text-red-400 flex-1">{message}</p>
    {onDismiss && (
      <button onClick={onDismiss} className="text-red-400 hover:text-red-600 text-xs">✕</button>
    )}
  </div>
);

export const SuccessAlert = ({ message }) => (
  <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
    <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
    <p className="text-sm text-green-700 dark:text-green-400">{message}</p>
  </div>
);

export default LoadingSpinner;
