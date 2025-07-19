// vitaq-website/context/LoadingContext.tsx
'use client';

import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';

interface LoadingContextType {
  progress: number;
  isLoaded: boolean;
  setProgress: (progress: number) => void;
  setIsLoaded: (isLoaded: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    progress,
    isLoaded,
    setProgress,
    setIsLoaded,
  }), [progress, isLoaded]);

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};