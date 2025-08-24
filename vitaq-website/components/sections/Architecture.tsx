// file: components/sections/Architecture.tsx
import React from 'react';

// Reusable component for each tech principle
const TechPillar = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="border border-brand-surface rounded-lg p-6">
    <h3 className="font-bold text-xl text-brand-text">{title}</h3>
    <p className="mt-2 text-brand-secondary">{children}</p>
  </div>
);

export const Architecture = () => {
  return (
    <section className="py-20 sm:py-32 bg-brand-surface">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-bold text-brand-text">
            Built on a Foundation of Excellence
          </h2>
          <p className="mt-4 text-lg text-brand-secondary">
            Our platform is engineered for security, scalability, and seamless integration, giving you peace of mind.
          </p>
        </div>

        {/* Placeholder for the "Connected Nodes" visual */}
        <div className="mt-16 w-full h-64 rounded-xl bg-brand-background flex items-center justify-center">
          <div className="text-center text-brand-secondary">
            <h3 className="text-xl font-bold">[ Architecture Graph Visual ]</h3>
            <p className="mt-2 text-sm">This will be a dynamic node animation.</p>
          </div>
        </div>

        {/* Grid of Technical Pillars */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <TechPillar title="Multi-Tenant by Design">
            Serve multiple, distinct organizations from a single, secure backend infrastructure, ensuring data privacy and integrity.
          </TechPillar>
          <TechPillar title="React Native & Expo">
            A single, robust codebase delivers a consistent, high-quality experience across iOS, Android, and the Web.
          </TechPillar>
          <TechPillar title="State-of-the-Art Security">
            Built with modern authentication (OIDC PKCE) and security best practices to protect your organization's most valuable data.
          </TechPillar>
        </div>
      </div>
    </section>
  );
};