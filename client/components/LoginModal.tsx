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

  type UserType = {
    type: 'student' | 'faculty' | 'principal';
    label: string;
    bgColor: string;
    hoverColor: string;
  };

  const userTypes: UserType[] = [
    { type: 'student', label: 'Student Login', bgColor: 'bg-blue-500', hoverColor: 'hover:bg-blue-600' },
    { type: 'faculty', label: 'Faculty Login', bgColor: 'bg-green-500', hoverColor: 'hover:bg-green-600' },
    { type: 'principal', label: 'Principal Login', bgColor: 'bg-purple-500', hoverColor: 'hover:bg-purple-600' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    console.log('LoginModal: Attempting login for:', formData.email, 'as', selectedUserType);
    
    try {
      const res = await fetch(`http://127.0.0.1:8000/accounts/api/${selectedUserType}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });
      
      console.log('LoginModal: Response status:', res.status);
      const data = await res.json();
      console.log('LoginModal: Response data:', data);
      
      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        if (data.auth_token) {
          localStorage.setItem('auth_token', data.auth_token);
        }
        
        // Use the redirect_to from the response if available, otherwise use default routes
        const dashboardRoutes = {
          'student': '/dashboard/student',
          'faculty': '/dashboard/teacher',
          'principal': '/dashboard/principal'
        };
        
        const redirectPath = data.redirect_to || dashboardRoutes[selectedUserType] || '/';
        console.log('LoginModal: Successful login, redirecting to:', redirectPath);
        console.log('LoginModal: User data:', data.user);
        
        // Close modal first
        onClose();
        
        // Small delay to ensure modal closes before redirect
        setTimeout(() => {
          window.location.href = redirectPath;
        }, 100);
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

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="fixed inset-0 bg-black/40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <motion.div
              className="relative w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              {/* Header */}
              <div className="p-6 bg-gradient-to-br from-indigo-500 to-indigo-700">
                <div className="flex justify-between items-center">
                  <DISLogo className="h-12 text-white" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={onClose}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <h2 className="mt-4 text-2xl font-bold text-white">Welcome Back</h2>
                <p className="text-indigo-100">Sign in to your account</p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* User Type Selection */}
                <div className="grid grid-cols-3 gap-4">
                  {userTypes.map(({ type, label, bgColor, hoverColor }) => (
                    <button
                      key={type}
                      onClick={() => setSelectedUserType(type)}
                      className={`p-3 rounded-lg text-white transition-colors ${
                        selectedUserType === type ? bgColor : 'bg-gray-300'
                      } ${hoverColor}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <p className="text-sm text-red-500">{error}</p>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <LogIn className="h-5 w-5" />
                        <span>Sign In</span>
                      </div>
                    )}
                  </Button>

                  <p className="text-center text-sm text-gray-600">
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={onSwitchToSignup}
                      className="text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Sign up
                    </button>
                  </p>
                </form>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
