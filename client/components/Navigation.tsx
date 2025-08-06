import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Home,
  Users,
  BookOpen,
  UserPlus,
  Heart,
  Calendar,
  Mail,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import DISLogo from "@/components/DISLogo";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  getCurrentSessionId, 
  updateLastActivity 
} from "@/utils/sessionManager";
import { 
  getStorageItem, 
  cleanupExpiredData 
} from "@/utils/storageManager";
import ChatNotifications from "@/components/ChatNotifications";

interface NavigationProps {
  onOpenLogin?: () => void;
  onOpenSignup?: () => void;
}

const navigationItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "About Us", href: "/about", icon: Users },
  { name: "Courses", href: "/courses", icon: BookOpen },
  { name: "News", href: "/news", icon: UserPlus },
  { name: "Student Life", href: "/student-life", icon: Heart },
  { name: "Faculty", href: "/faculty", icon: Users },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Our Stars", href: "/our-stars", icon: Star },
  { name: "Contact", href: "/contact", icon: Mail },
];

export default function Navigation({
  onOpenLogin,
  onOpenSignup,
}: NavigationProps = {}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();

  // Simple cleanup on component mount
  useEffect(() => {
    console.log('🧭 Navigation component mounted');
    cleanupExpiredData();
  }, []);

  const handleLogout = async () => {
    console.log('🚪 Navigation logout initiated');
    await logout();
  };

  // Determine dashboard path based on user type
  let dashboardPath = "/";
  if (user) {
    if (user.user_type === "student") dashboardPath = "/dashboard/student";
    else if (user.user_type === "faculty") dashboardPath = "/dashboard/teacher";
    else if (user.user_type === "principal") dashboardPath = "/dashboard/principal";
  }

  // Add Profile tab to navigationItems if logged in and authenticated
  const navItems = (isAuthenticated && user)
    ? [
        { name: "Profile", href: dashboardPath, icon: UserPlus },
        ...navigationItems,
      ]
    : navigationItems;

  // Add effect to update CSS custom property for main content margin
  React.useEffect(() => {
    const root = document.documentElement;
    if (window.innerWidth >= 1024) {
      // lg breakpoint
      root.style.setProperty(
        "--sidebar-width",
        isSidebarExpanded ? "256px" : "64px",
      );
    } else {
      root.style.setProperty("--sidebar-width", "0px");
    }
  }, [isSidebarExpanded]);

  // Handle window resize
  React.useEffect(() => {
    const handleResize = () => {
      const root = document.documentElement;
      if (window.innerWidth >= 1024) {
        root.style.setProperty(
          "--sidebar-width",
          isSidebarExpanded ? "256px" : "64px",
        );
      } else {
        root.style.setProperty("--sidebar-width", "0px");
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Call once on mount

    return () => window.removeEventListener("resize", handleResize);
  }, [isSidebarExpanded]);

  return (
    <>
      {/* Top Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 shadow-sm"
      >
        <div className="px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left: Menu + Logo */}
            <div className="flex items-center justify-between w-full">
              <Link to="/" className="flex items-center space-x-3 mt-3 sm:mt-0">
                <DISLogo size="md" />
                <div className="hidden sm:block">
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    DaNi's Institute of Science
                  </h1>
                </div>
              </Link>
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors ml-4 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>

            {/* Right: Chat Notifications + Theme Toggle + Auth Buttons */}
            <div className="hidden sm:flex items-center space-x-3">
              {/* Chat Notifications - only show for admin users */}
              {isAuthenticated && user && (user.user_type === 'admin' || user.user_type === 'principal') && (
                <ChatNotifications 
                  onChatOpen={(roomId) => {
                    // Navigate to admin messaging or open chat interface
                    if (roomId === 0) {
                      // Open full chat interface
                      window.location.href = '/admin/messaging';
                    } else {
                      // Open specific chat room
                      window.location.href = `/admin/messaging?room=${roomId}`;
                    }
                  }}
                />
              )}
              
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-gray-700 transition-colors"
                title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              >
                {theme === "light" ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
              </button>
              {isAuthenticated && user ? (
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Log Out
                </Button>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={onOpenLogin}>
                    Login
                  </Button>
                  <Button size="sm" onClick={onOpenSignup}>
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ x: 0 }}
        animate={{ x: 0 }}
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 shadow-sm z-30 transition-all duration-300 hidden lg:block overflow-y-auto ${
          isSidebarExpanded ? "w-64" : "w-16"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            {isSidebarExpanded && (
              <h2 className="text-sm font-medium text-gray-900 dark:text-white">
                Navigation
              </h2>
            )}
            <button
              onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
              className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isSidebarExpanded ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                location.pathname === item.href
                  ? "bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-r-2 border-blue-600 dark:border-blue-400"
                  : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
              title={!isSidebarExpanded ? item.name : undefined}
            >
              <item.icon
                className={`h-5 w-5 ${isSidebarExpanded ? "mr-3" : ""}`}
              />
              {isSidebarExpanded && (
                <span className="transition-opacity duration-200">
                  {item.name}
                </span>
              )}
              {location.pathname === item.href && !isSidebarExpanded && (
                <div className="absolute left-0 w-1 h-8 bg-blue-600 rounded-r" />
              )}
            </Link>
          ))}
        </nav>
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />

            {/* Sidebar */}
            <motion.aside
              initial={{ x: 280 }}
              animate={{ x: 0 }}
              exit={{ x: 280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-72 bg-white dark:bg-gray-900 border-l border-gray-100 dark:border-gray-800 shadow-lg z-50 lg:hidden"
            >
              <div className="h-full overflow-y-auto flex flex-col">
                {/* Mobile Sidebar Header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Menu
                    </h2>
                    <button
                      onClick={() => setIsSidebarOpen(false)}
                      className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Mobile Navigation Items */}
                <nav className="p-4 space-y-2 flex-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                        location.pathname === item.href
                          ? "bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                          : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </Link>
                  ))}
                  {/* Auth Buttons as nav items */}
                  {isAuthenticated && user && (
                    <button
                      className="flex items-center w-full px-4 py-3 rounded-lg text-base font-medium transition-colors text-red-600 bg-red-50 hover:bg-red-100 dark:bg-gray-800 dark:hover:bg-gray-700 mt-1 justify-center"
                      onClick={() => {
                        setIsSidebarOpen(false);
                        handleLogout();
                      }}
                    >
                      Log Out
                    </button>
                  )}
                </nav>
                {/* Theme Toggle at the bottom */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <button
                    onClick={toggleTheme}
                    className="w-full p-2 flex items-center justify-center space-x-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    {theme === "light" ? (
                      <Moon className="h-4 w-4" />
                    ) : (
                      <Sun className="h-4 w-4" />
                    )}
                    <span className="text-sm">
                      {theme === "light" ? "Dark Mode" : "Light Mode"}
                    </span>
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
