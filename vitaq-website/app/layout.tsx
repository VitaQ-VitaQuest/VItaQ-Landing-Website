// file: app/layout.tsx
"use client";

import { useState } from 'react';
import { Poppins } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Preloader } from '@/components/layout/Preloader';
import { LoadingProvider } from '@/context/LoadingContext';
import { NavbarProvider } from '@/context/NavbarContext';
import { ScrollProvider } from '@/context/ScrollContext'; // IMPORT THE NEW PROVIDER

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
  const [isPreloading, setIsPreloading] = useState(true);

  const handlePreloadFinish = () => {
    setIsPreloading(false);
  };

  return (
    <html lang="en">
      <body className="bg-brand-background text-brand-text" suppressHydrationWarning={true}>
        <LoadingProvider>
          {/* Wrap providers together */}
          <ScrollProvider>
            <NavbarProvider>
              {isPreloading && <Preloader onAnimationComplete={handlePreloadFinish} />}
              
              <div className={`transition-opacity duration-700 ease-in-out ${ isPreloading ? 'opacity-0' : 'opacity-100' }`}>
                <Header />
                {children}
                <Footer />
              </div>
            </NavbarProvider>
          </ScrollProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}