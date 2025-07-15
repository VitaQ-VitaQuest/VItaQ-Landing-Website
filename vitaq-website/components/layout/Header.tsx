// file: components/layout/Header.tsx
"use client"; // This is a client component because it uses hooks (useState, useEffect)

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  // Effect to track scroll position
  useEffect(() => {
    const handleScroll = () => {
      // Set scrolled to true if user has scrolled more than 10px
      setScrolled(window.scrollY > 10);
    };

    // Add event listener on mount
    window.addEventListener('scroll', handleScroll);

    // Clean up event listener on unmount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out ${
        scrolled ? 'bg-brand-surface/80 backdrop-blur-lg border-b border-brand-secondary/10' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="font-bold text-2xl text-brand-text">
            Vita<span className="text-brand-primary">Q</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/#features" className="text-brand-secondary hover:text-brand-text transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="text-brand-secondary hover:text-brand-text transition-colors">
              Pricing
            </Link>
            <Link href="/blog" className="text-brand-secondary hover:text-brand-text transition-colors">
              Blog
            </Link>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex">
            <Link
              href="/#demo"
              className="px-6 py-2 bg-brand-primary text-white font-bold rounded-full transition-transform duration-300 ease-in-out hover:scale-105"
            >
              Request a Demo
            </Link>
          </div>

          {/* Mobile Menu Button (we'll add functionality later) */}
          <div className="md:hidden">
            <button className="text-brand-text text-2xl">
              {/* Placeholder for hamburger icon */}
              ☰
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;