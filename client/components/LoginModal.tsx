import { motion, AnimatePresence } from "framer-motion";
import { X, LogIn, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import DISLogo from "@/components/DISLogo";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
}

export default function LoginModal({
  isOpen,
  onClose,
  onSwitchToSignup,
}: LoginModalProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [selectedUserType, setSelectedUserType] = useState<'student' | 'faculty' | 'principal'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      console.log('🔐 LoginModal: Attempting login for:', formData.email, 'as', selectedUserType);
      const res = await fetch(`http://127.0.0.1:8000/accounts/api/${selectedUserType}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });
      
      console.log('🔐 LoginModal: Response status:', res.status);
      const data = await res.json();
      console.log('🔐 LoginModal: Response data:', data);
      
      if (data.success) {
        // Store user and auth token
        localStorage.setItem("user", JSON.stringify(data.user));
        if (data.auth_token) {
          localStorage.setItem('auth_token', data.auth_token);
        }
        
        // Close modal and redirect
        onClose();
        
        // Redirect based on user type
        switch (selectedUserType) {
          case 'student':
            window.location.href = "/student-dashboard";
            break;
          case 'faculty':
            window.location.href = "/teacher-dashboard";
            break;
          case 'principal':
            window.location.href = "/principal-dashboard";
            break;
        }
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      console.error('LoginModal: Login error:', err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToSignup = () => {
    onClose();
    onSwitchToSignup();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-sm sm:max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <DISLogo size="sm" />
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                    Welcome Back
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 sm:p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>

              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-6">
                Sign in to access your account
              </p>

              {/* User Type Selection */}
              <div className="mb-4 sm:mb-6">
                <Label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 mb-3 block">
                  Login As
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { type: 'student', label: 'Student' },
                    { type: 'faculty', label: 'Faculty' },
                    { type: 'principal', label: 'Principal' }
                  ].map(({ type, label }) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedUserType(type as 'student' | 'faculty' | 'principal')}
                      className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                        selectedUserType === type
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div>
                  <Label
                    htmlFor="login-modal-email"
                    className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="login-modal-email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 text-sm sm:text-base h-10 sm:h-11 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="password"
                    className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Password
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pr-10 text-sm sm:text-base h-10 sm:h-11 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                    >
                      {showPassword ? (
                        <EyeOff className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 mt-4 sm:mt-6 h-10 sm:h-11 text-sm sm:text-base"
                  disabled={
                    !formData.email || !formData.password || loading
                  }
                >
                  {loading ? "Signing In..." : (<><LogIn className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />Sign In</>)}
                </Button>
                {error && (
                  <div className="text-red-500 text-sm text-center mt-2">{error}</div>
                )}
              </form>

              {/* Footer */}
              <div className="text-center mt-4 sm:mt-6">
                <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
                  Don't have an account?{" "}
                  <button
                    onClick={handleSwitchToSignup}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Sign up here
                  </button>
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
