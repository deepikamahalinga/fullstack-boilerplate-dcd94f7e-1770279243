import React from 'react';

interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({ 
  size = 'medium', 
  text,
  className = ''
}) => {
  // Size mappings for the spinner
  const sizeClasses = {
    small: 'w-4 h-4 border-2',
    medium: 'w-8 h-8 border-3',
    large: 'w-12 h-12 border-4'
  };

  // Size mappings for the text
  const textSizes = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`
          ${sizeClasses[size]}
          border-gray-200
          border-t-blue-500
          rounded-full
          animate-spin
        `}
        role="status"
        aria-label="loading"
      />
      {text && (
        <p className={`
          mt-2
          ${textSizes[size]}
          text-gray-600
          font-medium
        `}>
          {text}
        </p>
      )}
    </div>
  );
};

// Alternative Skeleton Loading Component
interface SkeletonProps {
  size?: 'small' | 'medium' | 'large';
  count?: number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  size = 'medium',
  count = 1,
  className = ''
}) => {
  const heightClasses = {
    small: 'h-4',
    medium: 'h-6',
    large: 'h-8'
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {[...Array(count)].map((_, index) => (
        <div
          key={index}
          className={`
            ${heightClasses[size]}
            bg-gray-200
            rounded
            animate-pulse
          `}
        />
      ))}
    </div>
  );
};

export default Loading;