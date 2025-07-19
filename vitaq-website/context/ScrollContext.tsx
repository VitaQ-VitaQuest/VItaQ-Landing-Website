// file: context/ScrollContext.tsx
'use client';

import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';

interface ScrollContextType {
  scrollProgress: number;
  setScrollProgress: (progress: number) => void;
}

const ScrollContext = createContext<ScrollContextType | undefined>(undefined);

export const ScrollProvider = ({ children }: { children: ReactNode }) => {
  const [scrollProgress, setScrollProgress] = useState(0);

  const value = useMemo(() => ({
    scrollProgress,
    setScrollProgress,
  }), [scrollProgress]);

  return (
    <ScrollContext.Provider value={value}>
      {children}
    </ScrollContext.Provider>
  );
};

export const useScroll = () => {
  const context = useContext(ScrollContext);
  if (context === undefined) {
    throw new Error('useScroll must be used within a ScrollProvider');
  }
  return context;
};