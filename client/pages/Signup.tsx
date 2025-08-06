import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { UserPlus, GraduationCap, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { notifySignupSuccess, notifySignupError } from "@/utils/notifications";
import { 
  getCurrentSessionId, 
  isNewSession, 
  updateLastActivity 
} from "@/utils/sessionManager";
import { 
  clearAllSessionData, 
  cleanupExpiredData 
} from "@/utils/storageManager";

interface Class {
  id: number;
  name: string;
  grade_level: number;
}

interface Subject {
  id: number;
  name: string;
  code: string;
}

export default function Signup() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  
  // Initialize with completely clean form data
  const getCleanFormData = () => ({
    fullName: "",
    email: "",
    password: "",
    rollId: "",
    classId: "",
    subjectIds: [] as number[],
  });
  
  const [formData, setFormData] = useState(getCleanFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");

  // Ensure clean form on component mount
  useEffect(() => {
    console.log('🧹 Signup form mounted - ensuring clean state');
    
    // Simple check for suspicious data
    const userData = localStorage.getItem('user');
    if (userData && userData.toLowerCase().includes('kavya')) {
      console.log('🧹 Clearing suspicious data');
      localStorage.removeItem('user');
    }
    
    // Force form to clean state
    setFormData(getCleanFormData());
    setError("");
    
    console.log('✨ Signup form initialized with clean state');
  }, []);

  // Fetch classes and subjects from Django API
  useEffect(() => {
    const fetchData = async () => {
      setDataLoading(true);
      try {
        // Fetch classes
        const classesResponse = await fetch('http://127.0.0.1:8000/accounts/api/classes/', {
          credentials: 'include',
        });
        const classesData = await classesResponse.json();
        
        if (classesData.success) {
          setClasses(classesData.classes);
        } else {
          console.error("Failed to fetch classes:", classesData.message);
        }
        
        // Initially fetch all subjects (will be filtered when class is selected)
        await fetchSubjectsForGrade();
        
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load classes and subjects. Make sure the Django server is running.");
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to fetch subjects based on grade level
  const fetchSubjectsForGrade = async (gradeLevel?: number) => {
    try {
      const url = gradeLevel 
        ? `http://127.0.0.1:8000/accounts/api/subjects/?grade_level=${gradeLevel}`
        : 'http://127.0.0.1:8000/accounts/api/subjects/';
        
      const subjectsResponse = await fetch(url, {
        credentials: 'include',
      });
      const subjectsData = await subjectsResponse.json();
      
      if (subjectsData.success) {
        setSubjects(subjectsData.subjects);
        console.log(`Loaded ${subjectsData.subjects.length} subjects for grade ${gradeLevel || 'all'}`);
      } else {
        console.error("Failed to fetch subjects:", subjectsData.message);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  // Update subjects when class selection changes
  useEffect(() => {
    if (formData.classId) {
      const selectedClass = classes.find(c => c.id.toString() === formData.classId);
      if (selectedClass) {
        console.log(`Class selected: ${selectedClass.name} (Grade ${selectedClass.grade_level})`);
        fetchSubjectsForGrade(selectedClass.grade_level);
        // Clear selected subjects when class changes
        setFormData(prev => ({ ...prev, subjectIds: [] }));
      }
    }
  }, [formData.classId, classes]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubjectChange = (subjectId: number, checked: boolean) => {
    setFormData((prev) => {
      let newSubjectIds = [...prev.subjectIds];

      if (checked) {
        newSubjectIds.push(subjectId);
      } else {
        newSubjectIds = newSubjectIds.filter((id) => id !== subjectId);
      }

      return { ...prev, subjectIds: newSubjectIds };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Debug: Log the current form data
    console.log("=== FORM SUBMISSION DEBUG ===");
    console.log("Current formData:", formData);
    console.log("formData.classId:", formData.classId, "Type:", typeof formData.classId);
    console.log("formData.subjectIds:", formData.subjectIds);
    console.log("Available classes:", classes);
    console.log("Available subjects:", subjects);

    // Validate form data before sending
    console.log("=== FORM VALIDATION DEBUG ===");
    console.log("formData.fullName:", formData.fullName);
    console.log("formData.email:", formData.email);
    console.log("formData.password:", formData.password);
    console.log("formData.rollId:", formData.rollId);
    console.log("formData.classId:", formData.classId);
    console.log("formData.subjectIds:", formData.subjectIds);
    
    const missingFields = [];
    if (!formData.fullName) missingFields.push("Full Name");
    if (!formData.email) missingFields.push("Email");
    if (!formData.password) missingFields.push("Password");
    // Temporarily make Roll ID optional
    // if (!formData.rollId) missingFields.push("Roll ID");
    if (!formData.classId) missingFields.push("Class");
    if (formData.subjectIds.length === 0) missingFields.push("Subjects");
    
    if (missingFields.length > 0) {
      console.log("Missing fields:", missingFields);
      const errorMessage = `Please fill in the following required fields: ${missingFields.join(", ")}`;
      setError(errorMessage);
      alert(errorMessage); // Show alert to make it more visible
      setLoading(false);
      return;
    }

    // Check if classes and subjects are loaded
    if (classes.length === 0) {
      setError("Classes are still loading. Please wait and try again.");
      setLoading(false);
      return;
    }

    if (subjects.length === 0) {
      setError("Subjects are still loading. Please wait and try again.");
      setLoading(false);
      return;
    }

    const classIdNumber = parseInt(formData.classId);
    if (isNaN(classIdNumber)) {
      setError("Please select a valid class");
      setLoading(false);
      return;
    }

    const requestData = {
      name: formData.fullName,
      email: formData.email,
      password: formData.password,
      roll_id: formData.rollId || `AUTO_${formData.email.split('@')[0]}_${Date.now()}`,  // Auto-generate if empty
      student_class_id: classIdNumber,
      subject_ids: formData.subjectIds,
    };

    console.log("Sending signup data:", requestData);
    console.log("Form data before processing:", formData);
    console.log("Available classes:", classes);
    console.log("Available subjects:", subjects);

    try {
      console.log("Making signup request to:", 'http://127.0.0.1:8000/accounts/api/student/signup/');
      console.log("Request data:", JSON.stringify(requestData, null, 2));
      
      const response = await fetch('http://127.0.0.1:8000/accounts/api/student/signup/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestData),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);
      
      const data = await response.json();
      console.log("Signup response:", JSON.stringify(data, null, 2));
      console.log("Data.success:", data.success, "Type:", typeof data.success);

      if (data.success) {
        console.log("SUCCESS: Account created, forcing redirect to post-signup login");
        
        // Force redirect to post-signup login page
        const redirectUrl = `/post-signup-login?email=${encodeURIComponent(formData.email)}`;
        console.log("Redirecting to:", redirectUrl);
        
        // Use window.location as a fallback to ensure redirect works
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 100);
        
        navigate(redirectUrl);
        
        // Original auto-login code (commented out for testing)
        // if (data.user) {
        //   console.log("Auto-login successful, redirecting to dashboard");
        //   setUser(data.user);
        //   notifySignupSuccess(data.user.name || 'User');
        //   navigate('/student-dashboard');
        // } else {
        //   console.error("User data missing in signup response:", data);
        //   console.log("Redirecting to login with post-signup state");
        //   navigate(`/login?fromSignup=true&email=${encodeURIComponent(formData.email)}`);
        // }
      } else {
        console.log("FAILURE: Signup failed");
        console.error("Signup failed:", data);
        const errorMessage = data.message || "Failed to create account";
        setError(errorMessage);
        notifySignupError(errorMessage);
        
        // If account was created but auto-login failed, redirect to post-signup login
        if (data.message && data.message.includes("created")) {
          console.log("Account created but login failed, redirecting to post-signup login");
          navigate(`/post-signup-login?email=${encodeURIComponent(formData.email)}`);
        }
      }
    } catch (error) {
      console.error("Signup error:", error);
      const errorMessage = "Network error. Please try again.";
      setError(errorMessage);
      notifySignupError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />

      <main
        className="pt-16 transition-all duration-300"
        style={{ marginLeft: "var(--sidebar-width, 0px)" }}
      >
        <section className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-2xl mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <GraduationCap className="h-16 w-16 text-blue-600 dark:text-blue-400 mx-auto mb-6" />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Student Registration
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Join DaNi's Institute of Science and start your learning journey
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700"
            >
              {dataLoading && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-blue-600 text-sm">Loading classes and subjects...</p>
                </div>
              )}

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label
                    htmlFor="fullName"
                    className="text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="mt-1"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="signup-page-email"
                    className="text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Email ID
                  </Label>
                  <Input
                    id="signup-page-email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1"
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Create Password
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
                      placeholder="Create a strong password"
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

                <div style={{ width: '100%', marginBottom: '1.5rem' }}>
                  <Label
                    htmlFor="rollId"
                    className="text-sm font-medium text-gray-700 dark:text-gray-200"
                    style={{ display: 'block', marginBottom: '0.5rem' }}
                  >
                    Roll ID *
                  </Label>
                  <Input
                    id="rollId"
                    name="rollId"
                    type="text"
                    required
                    value={formData.rollId}
                    onChange={handleInputChange}
                    className="mt-1"
                    style={{ width: '100%' }}
                    placeholder="Enter your roll ID (e.g., ROLL001)"
                  />
                  {!formData.rollId && (
                    <p className="text-red-500 text-xs mt-1">Roll ID is required</p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="classId"
                    className="text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Class *
                  </Label>
                  <select
                    id="classId"
                    name="classId"
                    required
                    value={formData.classId}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-3 py-2 border ${!formData.classId && error ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  >
                    <option value="">Select your class</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                  {!formData.classId && error && (
                    <p className="text-red-500 text-xs mt-1">Please select your class</p>
                  )}
                </div>

                {formData.classId && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                  >
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Subjects * (Select multiple)
                    </Label>
                    <div className="mt-2 space-y-3">
                      {subjects.map((subject) => (
                        <div key={subject.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`subject-${subject.id}`}
                            checked={formData.subjectIds.includes(subject.id)}
                            onChange={(e) =>
                              handleSubjectChange(subject.id, e.target.checked)
                            }
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label
                            htmlFor={`subject-${subject.id}`}
                            className="ml-2 text-sm text-gray-700 dark:text-gray-200"
                          >
                            {subject.name} ({subject.code})
                          </label>
                        </div>
                      ))}
                    </div>
                    {formData.subjectIds.length === 0 && error && (
                      <p className="text-red-500 text-xs mt-2">Please select at least one subject</p>
                    )}
                  </motion.div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={
                    loading ||
                    dataLoading ||
                    !formData.fullName ||
                    !formData.email ||
                    !formData.password ||
                    !formData.rollId ||
                    !formData.classId ||
                    formData.subjectIds.length === 0
                  }
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {loading ? "Creating Account..." : dataLoading ? "Loading..." : "Create Student Account"}
                </Button>

              </form>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-center mt-8"
            >
              <p className="text-gray-600 dark:text-gray-300">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Sign in here
                </Link>
              </p>
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
