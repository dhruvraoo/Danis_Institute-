import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, GraduationCap, Mail, Lock, Users, BookOpen, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import React from 'react';

interface FacultyFormData {
  name: string;
  email: string;
  password: string;
  selectedClasses: string[];
  selectedSubjects: string[];
}

interface FacultyRegistrationFormProps {
  onSuccess: () => void;
  onBack: () => void;
}

const AVAILABLE_CLASSES = ['9th', '10th', '11th', '12th'];
const AVAILABLE_SUBJECTS = ['Maths', 'Science', 'Social Science', 'English', 'Physics', 'Chemistry', 'Biology'];

const FacultyRegistrationForm = ({ onSuccess, onBack }: FacultyRegistrationFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FacultyFormData>({
    name: '',
    email: '',
    password: '',
    selectedClasses: [],
    selectedSubjects: []
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleClassToggle = (className: string) => {
    setFormData(prev => ({
      ...prev,
      selectedClasses: prev.selectedClasses.includes(className)
        ? prev.selectedClasses.filter(c => c !== className)
        : [...prev.selectedClasses, className]
    }));
    // Clear class error if user selects a class
    if (errors.classes) {
      setErrors(prev => ({ ...prev, classes: '' }));
    }
  };

  const handleSubjectToggle = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      selectedSubjects: prev.selectedSubjects.includes(subject)
        ? prev.selectedSubjects.filter(s => s !== subject)
        : [...prev.selectedSubjects, subject]
    }));
    // Clear subject error if user selects a subject
    if (errors.subjects) {
      setErrors(prev => ({ ...prev, subjects: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.selectedClasses.length === 0) {
      newErrors.classes = 'At least one class must be selected';
    }

    if (formData.selectedSubjects.length === 0) {
      newErrors.subjects = 'At least one subject must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      // Register faculty user with proper Django endpoint
      const response = await fetch('http://localhost:8080/accounts/api/admin/register-faculty/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': document.cookie.split('csrftoken=')[1]?.split(';')[0] || '',
          'Accept': 'application/json'
        },
        credentials: 'include',
        signal: controller.signal,
        body: JSON.stringify({
          full_name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          classes: formData.selectedClasses,
          subjects: formData.selectedSubjects,
          user_type: "faculty"
        })
      });

      // Clear timeout since response was received
      clearTimeout(timeoutId);

      // First log the raw response
      const responseText = await response.text();
      console.log('Raw server response:', responseText);

      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse server response as JSON:', parseError);
        throw new Error(`Server returned invalid JSON: ${responseText.slice(0, 100)}...`);
      }
      
      console.log('Registration response:', { status: response.status, data });

      if (response.ok) {
        if (data.success) {
          toast({
            title: "Success",
            description: "Faculty member registered successfully!",
            variant: "default"
          });
          
          // Reset form
          setFormData({
            name: '',
            email: '',
            password: '',
            selectedClasses: [],
            selectedSubjects: []
          });
          setErrors({});
          
          // Go back to selection immediately
          onBack();
        } else {
          // Handle validation errors from Django
          if (data.errors) {
            const serverErrors: Record<string, string> = {};
            Object.entries(data.errors).forEach(([key, value]) => {
              serverErrors[key] = Array.isArray(value) ? value[0] : value.toString();
            });
            setErrors(serverErrors);
          }
          toast({
            title: "Registration Failed",
            description: data.message || "Please check the form for errors",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Registration Failed",
          description: data.message || "Server error occurred. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      // Log the CSRF token to check if it's being sent
      console.log('CSRF Token:', document.cookie.split('csrftoken=')[1]?.split(';')[0] || 'No CSRF token found');
      
      let errorMessage = "Network error occurred. Please try again.";
      if (error.name === 'AbortError') {
        errorMessage = "Request timed out. The server took too long to respond.";
      } else if (error instanceof Response) {
        errorMessage = `Server responded with status ${error.status}`;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Remove loading check since we're not fetching data anymore
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        <span className="ml-3 text-gray-600">Loading form data...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Register Faculty Member</h3>
          <p className="text-gray-600 text-sm">Add a new faculty member with class and subject assignments</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, name: e.target.value }));
                  if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                }}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter faculty name"
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, email: e.target.value }));
                  if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                }}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter email address"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.email}
              </p>
            )}
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="password"
              value={formData.password}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, password: e.target.value }));
                if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
              }}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter password"
            />
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.password}
            </p>
          )}
        </div>

        {/* Classes Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Assign Classes ({formData.selectedClasses.length} selected)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 border border-gray-200 rounded-lg p-3">
            {AVAILABLE_CLASSES.map((className) => (
              <div
                key={className}
                className="flex items-center space-x-2"
              >
                <input
                  type="checkbox"
                  id={`class-${className}`}
                  checked={formData.selectedClasses.includes(className)}
                  onChange={() => handleClassToggle(className)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor={`class-${className}`} className="text-sm text-gray-700">
                  {className}
                </label>
              </div>
            ))}
          </div>
          {errors.classes && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.classes}
            </p>
          )}
        </div>

        {/* Subjects Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Assign Subjects ({formData.selectedSubjects.length} selected)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 border border-gray-200 rounded-lg p-3">
            {AVAILABLE_SUBJECTS.map((subject) => (
              <div
                key={subject}
                className="flex items-center space-x-2"
              >
                <input
                  type="checkbox"
                  id={`subject-${subject}`}
                  checked={formData.selectedSubjects.includes(subject)}
                  onChange={() => handleSubjectToggle(subject)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor={`subject-${subject}`} className="text-sm text-gray-700">
                  {subject}
                </label>
              </div>
            ))}
          </div>
          {errors.subjects && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.subjects}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Registering...
              </>
            ) : (
              <>
                <BookOpen className="h-4 w-4 mr-2" />
                Register Faculty
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default FacultyRegistrationForm;