/* eslint-disable no-unused-vars */
import React from "react";
import PageWrapper from "./LandingPage/PageWrapper";
import Hero from "./LandingPage/Hero";
import MedicalShopSections from "./LandingPage/MedicalShopSections";
import ModernProcess from "./LandingPage/ModernProcess";
import ModernTestimonials from "./LandingPage/ModernTestimonials";
import CTASection from "./LandingPage/CTASection";

const Landingpage = () => {
  return (
    <PageWrapper className="w-full bg-white overflow-hidden">
      <Hero />
      <MedicalShopSections />
      <ModernProcess />
      <ModernTestimonials />
      <CTASection />
    </PageWrapper>
  );
};

export default Landingpage;