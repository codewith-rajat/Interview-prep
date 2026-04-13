import React from 'react';
import HeroSection from '../components/hero/HeroSection';
import FeaturesSection from '../components/sections/FeaturesSection';
import SocialProofSection from '../components/sections/SocialProofSection';
import PricingSection from '../components/sections/PricingSection';
import CTASection from '../components/sections/CTASection';
import Footer from '../components/layout/Footer';

export default function LandingPage() {
  return (
    <div className="bg-black min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <SocialProofSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  );
}
