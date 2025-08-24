// file: components/layout/Header.tsx
"use client";

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useNavbar } from '@/context/NavbarContext';

export const Header = () => {
  const logoPlaceholderRef = useRef<HTMLDivElement>(null);
  const { setLogoPlaceholderRef } = useNavbar();
  
  useEffect(() => {
    if (logoPlaceholderRef.current) {
        setLogoPlaceholderRef(logoPlaceholderRef);
    }
  }, [setLogoPlaceholderRef]);

  return (
    // THE FIX: Lowering z-index to 40 so the Hero (z-50) appears on top.
    <header className="fixed top-0 left-0 w-full z-40 h-24 pointer-events-none">
      <div className="absolute top-0 left-0 w-full h-24 glass-effect"></div>
      
      <div className="relative max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
        
        <nav id="left-links" className="nav-link-group pointer-events-auto">
          <Link href="/#features" className="text-brand-secondary hover:text-brand-text transition-colors">
            Features
          </Link>
          <Link href="/pricing" className="text-brand-secondary hover:text-brand-text transition-colors">
            Pricing
          </Link>
        </nav>

        <div 
          id="logo-placeholder" 
          ref={logoPlaceholderRef} 
          className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center w-0"
        >
            {/* The animated "VitaQ" logo will land here */}
        </div>

        <nav id="right-links" className="nav-link-group pointer-events-auto">
            <Link href="/blog" className="text-brand-secondary hover:text-brand-text transition-colors">
                Blog
            </Link>
            <Link href="/#demo" className="px-6 py-2 bg-brand-primary text-white font-bold rounded-full transition-transform duration-300 ease-in-out hover:scale-105">
              Request a Demo
            </Link>
        </nav>

        <div className="md:hidden ml-auto pointer-events-auto">
            <button className="text-brand-text text-2xl">☰</button>
        </div>
      </div>
    </header>
  );
};

export default Header;