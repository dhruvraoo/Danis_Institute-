import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import DISLogo from "@/components/DISLogo";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export default function SignupModal({
  isOpen,
  onClose,
  onSwitchToLogin,
}: SignupModalProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    className: "",
    subjects: [] as string[],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubjectChange = (subject: string, checked: boolean) => {
    setFormData((prev) => {
      let newSubjects = [...prev.subjects];

      if (checked) {
        if (["11th", "12th"].includes(prev.className)) {
          if (subject === "Math" && newSubjects.includes("Biology")) {
            newSubjects = newSubjects.filter((s) => s !== "Biology");
          } else if (subject === "Biology" && newSubjects.includes("Math")) {
            newSubjects = newSubjects.filter((s) => s !== "Math");
          }
        }
        newSubjects.push(subject);
      } else {
        newSubjects = newSubjects.filter((s) => s !== subject);
      }

      return { ...prev, subjects: newSubjects };
    });
  };

  const getSubjectsForClass = (className: string) => {
    if (["9th", "10th"].includes(className)) {
      return ["Math", "Science", "Social Studies", "English"];
    } else if (["11th", "12th"].includes(className)) {
      return ["Physics", "Chemistry", "Math", "Biology"];
    }
    return [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8000/accounts/api/student/signup/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          roll_id: Date.now().toString(), // or generate as needed
          student_class: formData.className,
          subject_selected: formData.subjects.join(", "),
        }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("user", JSON.stringify({
          ...data.student,
          user_type: "student",
        }));
        window.location.href = "/dashboard/student";
      } else {
        setError(data.message || "Signup failed");
      }
    } catch (err) {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToLogin = () => {
    onClose();
    onSwitchToLogin();
  };

  const availableSubjects = getSubjectsForClass(formData.className);

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
              className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-sm sm:max-w-md md:max-w-lg min-h-[450px] max-h-[85vh] sm:max-h-[80vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Scrollable Content */}
              <div className="overflow-y-auto max-h-full flex-1">
                {/* Header */}
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <DISLogo size="sm" />
                    <h2 className="text-base sm:text-lg md:text-2xl font-bold text-gray-900 dark:text-white">
                      Student Registration
                    </h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1.5 sm:p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <X className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>

                <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300 mb-3 sm:mb-4">
                  Join DaNi's Institute of Science and start your learning
                  journey
                </p>

                {/* Form */}
                <form
                  onSubmit={handleSubmit}
                  className="space-y-2 sm:space-y-3"
                >
                  <div>
                    <Label
                      htmlFor="fullName"
                      className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200"
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
                      className="mt-1 text-sm sm:text-base h-9 sm:h-10 md:h-11 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="signup-modal-email"
                      className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                      Email ID
                    </Label>
                    <Input
                      id="signup-modal-email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mt-1 text-sm sm:text-base h-9 sm:h-10 md:h-11 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="password"
                      className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200"
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
                        className="pr-10 text-sm sm:text-base h-9 sm:h-10 md:h-11 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
                        placeholder="Create a strong password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3"
                      >
                        {showPassword ? (
                          <EyeOff className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="className"
                      className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                      Class
                    </Label>
                    <select
                      id="className"
                      name="className"
                      required
                      value={formData.className}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-2 sm:px-3 py-2 text-sm sm:text-base h-9 sm:h-10 md:h-11 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select your class</option>
                      <option value="9th">9th Grade</option>
                      <option value="10th">10th Grade</option>
                      <option value="11th">11th Grade</option>
                      <option value="12th">12th Grade</option>
                    </select>
                  </div>

                  {formData.className && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.3 }}
                    >
                      <Label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">
                        Subjects
                        {["11th", "12th"].includes(formData.className) && (
                          <span className="text-xs text-gray-500 ml-1 sm:ml-2 block sm:inline mt-1 sm:mt-0">
                            (Math and Biology are mutually exclusive)
                          </span>
                        )}
                      </Label>
                      <div className="mt-2 grid grid-cols-2 sm:grid-cols-1 gap-1 sm:gap-2">
                        {availableSubjects.map((subject) => (
                          <div key={subject} className="flex items-center">
                            <input
                              type="checkbox"
                              id={subject}
                              checked={formData.subjects.includes(subject)}
                              onChange={(e) =>
                                handleSubjectChange(subject, e.target.checked)
                              }
                              className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label
                              htmlFor={subject}
                              className="ml-1.5 sm:ml-2 text-xs sm:text-sm text-gray-700 dark:text-gray-200"
                            >
                              {subject}
                            </label>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 mt-4 sm:mt-6 h-9 sm:h-10 md:h-11 text-sm sm:text-base"
                    disabled={
                      !formData.fullName ||
                      !formData.email ||
                      !formData.password ||
                      !formData.className ||
                      formData.subjects.length === 0 ||
                      loading
                    }
                  >
                    {loading ? "Creating..." : (<><UserPlus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />Create Student Account</>)}
                  </Button>
                  {error && (
                    <div className="text-red-500 text-sm text-center mt-2">{error}</div>
                  )}
                </form>

                {/* Footer */}
                <div className="text-center mt-4 sm:mt-6">
                  <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
                    Already have an account?{" "}
                    <button
                      onClick={handleSwitchToLogin}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      Sign in here
                    </button>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
