import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { LogIn, User, Eye, EyeOff, Shield, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { cleanupExpiredData } from "@/utils/simpleSessionManager";


type UserType = 'student' | 'faculty' | 'principal';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, error: authError, loading: authLoading, clearError } = useAuth();
  
  // Debug the auth context (removed to prevent loops)
  const [selectedUserType, setSelectedUserType] = useState<UserType | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  
  // Check if this is a post-signup redirect using URL parameters
  const isPostSignup = searchParams.get('fromSignup') === 'true';
  const signupEmail = searchParams.get('email');
  
  // Debug logging
  console.log("Login page - URL params:", Object.fromEntries(searchParams));
  console.log("Login page - isPostSignup:", isPostSignup);
  console.log("Login page - signupEmail:", signupEmail);

  // Ensure clean form on component mount
  useEffect(() => {
    console.log('🧹 Login form mounted - ensuring clean state');
    
    try {
      // Simple cleanup
      cleanupExpiredData();
    } catch (error) {
      console.error('Error during form initialization:', error);
    }
    
    console.log('✨ Login form initialized with clean state');
  }, []);

  // Auto-select student and pre-fill email ONLY if coming from signup (validated)
  useEffect(() => {
    if (isPostSignup && signupEmail) {
      console.log('📧 Post-signup login - pre-filling email from URL params');
      setSelectedUserType('student');
      setFormData(prev => ({ ...prev, email: signupEmail }));
    } else {
      // Ensure form is completely clean for regular login
      console.log('🧹 Regular login - ensuring clean form state');
      setFormData({ email: "", password: "" });
      setSelectedUserType(null);
      setError("");
      // Don't call clearError here to avoid infinite loop
    }
  }, [isPostSignup, signupEmail]); // Removed clearError from dependencies

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserType) return;

    console.log('🔐 Login form submitted');
    console.log('🔐 Selected user type:', selectedUserType);
    console.log('🔐 Form data:', formData);

    setError("");
    clearError();

    try {
      const response = await fetch(`http://127.0.0.1:8000/accounts/api/${selectedUserType}/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('🔐 Login response:', data);

      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        if (data.auth_token) {
          localStorage.setItem('auth_token', data.auth_token);
        }

        // Use the backend's redirect_to or fallback to default routes
        const redirectPath = data.redirect_to || {
          'student': '/dashboard/student',
          'faculty': '/dashboard/teacher',
          'principal': '/dashboard/principal'
        }[selectedUserType] || '/';

        console.log('🔄 Redirecting to:', redirectPath);
        window.location.href = redirectPath;
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      console.error('Login error:', err);
      setError("Network error. Please try again.");
    }
  };

  const resetForm = () => {
    setSelectedUserType(null);
    setFormData({ email: "", password: "" });
    setError("");
  };

  return (
    <div className="min-h-screen">
      <Navigation />

      <main
        className="pt-16 transition-all duration-300"
        style={{ marginLeft: "var(--sidebar-width, 0px)" }}
      >
        <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white rounded-2xl p-8 shadow-lg border border-blue-100"
            >
              <div className="text-center mb-8">
                {isPostSignup ? (
                  <>
                    <LogIn className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-blue-900 mb-2">
                      Account Created Successfully!
                    </h1>
                    <p className="text-gray-600">For security purposes, please login to access your dashboard</p>
                  </>
                ) : (
                  <>
                    <LogIn className="h-10 w-10 text-blue-600 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-blue-900 mb-2">
                      Welcome Back
                    </h1>
                    <p className="text-gray-800">For security purposes,<br></br> please login to access your dashboard</p>
                  </>
                )}
              </div>

              {!selectedUserType ? (
                <div className="space-y-6">
                  {isPostSignup ? (
                    // Show only student login for post-signup users
                    <>
                      <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <User className="h-5 w-5 text-green-400" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-green-800">
                              Student Account Ready
                            </h3>
                            <div className="mt-2 text-sm text-green-700">
                              <p>Your student account has been created. Please sign in to continue.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <User className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                        <h3 className="font-semibold text-blue-900 mb-2">
                          Student Portal
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">
                          Access grades, schedules, and resources
                        </p>
                        <Button 
                          className="w-full" 
                          onClick={() => setSelectedUserType('student')}
                        >
                          Continue to Student Login
                        </Button>
                      </div>
                    </>
                  ) : (
                    // Show all login options for regular users
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Student Login */}
                        <div className="text-center p-4 rounded-lg border border-gray-200 hover:border-blue-500 transition-colors">
                          <User className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                          <h3 className="font-semibold text-blue-900 mb-2">
                            Student Portal
                          </h3>
                          <Button 
                            className="w-full mt-3 bg-blue-500 hover:bg-blue-600" 
                            onClick={() => {
                              console.log('🔘 Student Login selected');
                              setSelectedUserType('student');
                            }}
                          >
                            Student Login
                          </Button>
                        </div>

                        {/* Faculty Login */}
                        <div className="text-center p-4 rounded-lg border border-gray-200 hover:border-green-500 transition-colors">
                          <GraduationCap className="h-8 w-8 text-green-400 mx-auto mb-3" />
                          <h3 className="font-semibold text-green-900 mb-2">
                            Faculty Portal
                          </h3>
                          <Button 
                            className="w-full mt-3 bg-green-500 hover:bg-green-600" 
                            onClick={() => {
                              console.log('🔘 Faculty Login selected');
                              setSelectedUserType('faculty');
                            }}
                          >
                            Faculty Login
                          </Button>
                        </div>

                        {/* Principal Login */}
                        <div className="text-center p-4 rounded-lg border border-gray-200 hover:border-purple-500 transition-colors">
                          <Shield className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                          <h3 className="font-semibold text-purple-900 mb-2">
                            Principal Portal
                          </h3>
                          <Button 
                            className="w-full mt-3 bg-purple-500 hover:bg-purple-600" 
                            onClick={() => {
                              console.log('🔘 Principal Login selected');
                              setSelectedUserType('principal');
                            }}
                          >
                            Principal Login
                          </Button>
                        </div>
                      </div>

                      {/* Sign up link */}
                      <div className="text-center pt-6">
                        <p className="text-gray-600 text-sm">
                          Don't have an account?{" "}
                          <Link
                            to="/signup"
                            className="text-blue-600 hover:underline font-medium"
                          >
                            Sign up here
                          </Link>
                        </p>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div>
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold text-blue-900 capitalize">
                      {selectedUserType} Login
                    </h2>
                  </div>

                  {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="mt-1"
                        placeholder="Enter your email"
                      />
                    </div>

                    <div>
                      <Label htmlFor="password" className="text-sm font-medium text-gray-700">
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
                          className="pr-10"
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={authLoading || !formData.email || !formData.password}
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      {authLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        </section>
      </main>

      <div
        className="transition-all duration-300"
        style={{ marginLeft: "var(--sidebar-width, 0px)" }}
      >
        <Footer />
      </div>
    </div>
  );
}
