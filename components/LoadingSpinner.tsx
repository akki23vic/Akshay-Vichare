import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <svg 
        className="animate-spin h-8 w-8" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
    >
        <defs>
            <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{stopColor: '#60A5FA', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#60A5FA', stopOpacity: 0}} />
            </linearGradient>
        </defs>
        <path 
            d="M12 2A10 10 0 1 0 22 12" 
            stroke="url(#spinner-gradient)" 
            strokeWidth="4" 
            strokeLinecap="round"
        />
        <path 
            d="M12 2A10 10 0 1 0 22 12" 
            stroke="rgba(96, 165, 250, 0.2)" 
            strokeWidth="4" 
            strokeLinecap="round"
        />
    </svg>
  );
};