// file: context/NavbarContext.tsx
'use client';

import React, { createContext, useState, useContext, ReactNode, useMemo, RefObject } from 'react';

// The context will hold a reference to the placeholder div in the navbar
interface NavbarContextType {
  // THE FIX: The ref can be null initially
  logoPlaceholderRef: RefObject<HTMLDivElement | null> | null; 
  setLogoPlaceholderRef: (ref: RefObject<HTMLDivElement | null>) => void;
}

const NavbarContext = createContext<NavbarContextType | undefined>(undefined);

export const NavbarProvider = ({ children }: { children: ReactNode }) => {
  const [logoPlaceholderRef, setLogoPlaceholderRef] = useState<RefObject<HTMLDivElement | null> | null>(null);

  const value = useMemo(() => ({
    logoPlaceholderRef,
    setLogoPlaceholderRef,
  }), [logoPlaceholderRef]);

  return (
    <NavbarContext.Provider value={value}>
      {children}
    </NavbarContext.Provider>
  );
};

export const useNavbar = () => {
  const context = useContext(NavbarContext);
  if (context === undefined) {
    throw new Error('useNavbar must be used within a NavbarProvider');
  }
  return context;
};