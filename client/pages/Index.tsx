import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import FeatureHighlights from "@/components/FeatureHighlights";
import AdmissionEnquiry from "@/components/AdmissionEnquiry";
import StudentCarousel from "@/components/StudentCarousel";
import CEOSection from "@/components/CEOSection";
import Footer from "@/components/Footer";
import LoginModal from "@/components/LoginModal";
import SignupModal from "@/components/SignupModal";
import { useState } from "react";

export default function Index() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  const handleOpenLogin = () => setIsLoginModalOpen(true);
  const handleOpenSignup = () => setIsSignupModalOpen(true);
  const handleCloseLogin = () => setIsLoginModalOpen(false);
  const handleCloseSignup = () => setIsSignupModalOpen(false);

  const handleSwitchToSignup = () => {
    setIsLoginModalOpen(false);
    setIsSignupModalOpen(true);
  };

  const handleSwitchToLogin = () => {
    setIsSignupModalOpen(false);
    setIsLoginModalOpen(true);
  };

  return (
    <div className="min-h-screen">
      <Navigation
        onOpenLogin={handleOpenLogin}
        onOpenSignup={handleOpenSignup}
      />
      <main
        className="transition-all duration-300"
        style={{ marginLeft: "var(--sidebar-width, 0px)" }}
      >
        <Hero />
        <FeatureHighlights />
        <AdmissionEnquiry />
        <StudentCarousel />
        <CEOSection />
      </main>
      <div
        className="transition-all duration-300"
        style={{ marginLeft: "var(--sidebar-width, 0px)" }}
      >
        <Footer />
      </div>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={handleCloseLogin}
        onSwitchToSignup={handleSwitchToSignup}
      />
      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={handleCloseSignup}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </div>
  );
}
