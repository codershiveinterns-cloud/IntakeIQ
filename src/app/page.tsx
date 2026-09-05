"use client";

import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import TrustBar from "@/components/sections/TrustBar";
import Features from "@/components/sections/Features";
import IndustrySolutions from "@/components/sections/IndustrySolutions";
import SecuritySection from "@/components/sections/SecuritySection";
import Testimonial from "@/components/sections/Testimonial";
import FounderSection from "@/components/sections/FounderSection";
import PricingPreview from "@/components/sections/PricingPreview";
import CtaBanner from "@/components/sections/CtaBanner";
import Footer from "@/components/layout/Footer";
import DemoModal from "@/components/ui/DemoModal";
import LoginModal from "@/components/ui/LoginModal";
import HowItWorksModal from "@/components/sections/HowItWorksModal";
import ScrollProgressBar from "@/components/shared/ScrollProgressBar";
import BackToTop from "@/components/shared/BackToTop";

export default function HomePage() {
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [demoPlan, setDemoPlan] = useState<string | null>(null);

  const openDemo = (plan?: string) => {
    setDemoPlan(plan ?? null);
    setIsDemoOpen(true);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-brand-500 selection:text-white">
      <ScrollProgressBar />

      {/* Sticky Navigation */}
      <Navbar
        onRequestDemo={openDemo}
        onOpenLogin={() => setIsLoginOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* 1. Hero Section */}
        <Hero
          onRequestDemo={openDemo}
          onSeeHowItWorks={() => setIsHowItWorksOpen(true)}
        />

        {/* 2. Trust Bar */}
        <TrustBar />

        {/* 3. Features (Sections 1-5 Alternating) */}
        <Features onRequestDemo={openDemo} />

        {/* 4. Solutions by Industry */}
        <IndustrySolutions onRequestDemo={openDemo} />

        {/* 5. Security & Isolation Matrix */}
        <SecuritySection />

        {/* 6. Testimonial Pull-Quote */}
        <Testimonial />

        {/* 7. Pricing Preview */}
        <PricingPreview onRequestDemo={openDemo} />

        {/* 8. Founder Section */}
        <FounderSection />

        {/* 9. Final CTA Banner */}
        <CtaBanner onRequestDemo={openDemo} />
      </main>

      {/* Footer */}
      <Footer onRequestDemo={openDemo} />

      <BackToTop />

      {/* Interactive Modals */}
      <DemoModal
        isOpen={isDemoOpen}
        onClose={() => {
          setIsDemoOpen(false);
          setDemoPlan(null);
        }}
        initialPlan={demoPlan}
      />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />

      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
        onRequestDemo={openDemo}
      />
    </div>
  );
}
