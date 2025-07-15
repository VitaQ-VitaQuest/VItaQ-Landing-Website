// file: components/layout/Footer.tsx
import React from 'react';

export const Footer = () => {
  return (
    <footer className="py-10 bg-brand-surface border-t border-brand-secondary/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h3 className="font-bold text-xl text-brand-text">VitaQ</h3>
            <p className="text-sm text-brand-secondary">The OS for Elite Development</p>
          </div>
          <div className="flex gap-6 text-brand-secondary">
            <a href="#features" className="hover:text-brand-text transition-colors">Features</a>
            <a href="/pricing" className="hover:text-brand-text transition-colors">Pricing</a>
            <a href="/blog" className="hover:text-brand-text transition-colors">Blog</a>
            <a href="mailto:contact@vitaq.app" className="hover:text-brand-text transition-colors">Contact</a>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-brand-secondary/10 text-center text-sm text-brand-secondary">
          <p>© {new Date().getFullYear()} VitaQ. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;