import "./global.css";

import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import LoadingScreen from "@/components/LoadingScreen";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import ChatBot from "@/components/ChatBot";
import { cleanupExpiredData } from "@/utils/simpleSessionManager";
import Index from "./pages/Index";
import About from "./pages/About";
import Courses from "./pages/Courses";
import News from "./pages/News";
import StudentLife from "./pages/StudentLife";
import Faculty from "./pages/Faculty";
import Events from "./pages/Events";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import PrincipalDashboard from "./pages/PrincipalDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminMessagingPage from "./pages/AdminMessagingPage";
import PostSignupLogin from "./pages/PostSignupLogin";
import NotFound from "./pages/NotFound";
import OurStars from "./pages/OurStars";
import AdminAuthGate from "@/components/AdminAuthGate";

const queryClient = new QueryClient();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dataCleaningComplete, setDataCleaningComplete] = useState(false);

  // Simplified data clearing on app initialization
  useEffect(() => {
    const initializeApp = () => {
      try {
        console.log('🚀 Initializing app...');
        
        // Simple check for suspicious data
        const userData = localStorage.getItem('user');
        if (userData && userData.includes('kavya')) {
          console.log('🧹 Clearing suspicious user data');
          localStorage.clear();
          sessionStorage.clear();
        }
        
        // Basic cleanup
        cleanupExpiredData();
        
        console.log('✅ App initialization complete');
        
      } catch (error) {
        console.error('❌ Error during app initialization:', error);
      } finally {
        // Always mark as complete to prevent infinite loading
        setDataCleaningComplete(true);
      }
    };

    // Run initialization immediately
    initializeApp();
  }, []);

  // Check if this is the initial load (only after data cleaning is complete)
  useEffect(() => {
    if (!dataCleaningComplete) return;
    
    const hasShownLoading = sessionStorage.getItem("dis-loading-shown");
    if (hasShownLoading) {
      setIsLoading(false);
    } else {
      sessionStorage.setItem("dis-loading-shown", "true");
    }
  }, [dataCleaningComplete]);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  // Show loading screen until both data cleaning and normal loading are complete
  const shouldShowLoading = isLoading || !dataCleaningComplete;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              {shouldShowLoading ? (
                <LoadingScreen onComplete={handleLoadingComplete} />
              ) : (
                <BrowserRouter>
                  <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/courses" element={<Courses />} />
                  <Route path="/news" element={<News />} />
                  <Route path="/student-life" element={<StudentLife />} />
                  <Route path="/faculty" element={<Faculty />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/our-stars" element={<OurStars />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/post-signup-login" element={<PostSignupLogin />} />
                  
                  {/* Protected Routes */}
                  <Route
                    path="/student-dashboard"
                    element={
                      <ProtectedRoute requiredUserType="student">
                        <StudentDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/student"
                    element={
                      <ProtectedRoute requiredUserType="student">
                        <StudentDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/teacher-dashboard"
                    element={
                      <ProtectedRoute requiredUserType="faculty">
                        <TeacherDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/teacher"
                    element={
                      <ProtectedRoute requiredUserType="faculty">
                        <TeacherDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/principal-dashboard"
                    element={
                      <ProtectedRoute requiredUserType="principal">
                        <PrincipalDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/principal"
                    element={
                      <ProtectedRoute requiredUserType="principal">
                        <PrincipalDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/admin"
                    element={
                      <AdminAuthGate>
                        <AdminDashboard />
                      </AdminAuthGate>
                    }
                  />
                  <Route
                    path="/admin/messaging"
                    element={
                      <ProtectedRoute requiredUserType={["admin", "principal"]}>
                        <AdminMessagingPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                  </Routes>
                  <ChatBot />
                </BrowserRouter>
              )}
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
