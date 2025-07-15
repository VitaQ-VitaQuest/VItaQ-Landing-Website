// file: app/layout.tsx
"use client";

import { useState, useEffect } from 'react';
import { Poppins } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer'; // Let's import Footer for the final structure
import { Preloader } from '@/components/layout/Preloader';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-poppins',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);

  const handleAnimationComplete = () => {
    setLoading(false);
  };

  return (
    <html lang="en">
      <body
        className={`${poppins.variable} font-sans bg-brand-background text-brand-text`}
        suppressHydrationWarning={true}
      >
        {loading ? (
          <Preloader onAnimationComplete={handleAnimationComplete} />
        ) : (
          <>
            <Header />
            {children}
            <Footer /> 
          </>
        )}
      </body>
    </html>
  );
}