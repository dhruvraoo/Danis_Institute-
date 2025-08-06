import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, GraduationCap, Mail, Lock, Users, BookOpen, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FacultyFormData {
  name: string;
  email: string;
  password: string;
  selectedClasses: number[];
  selectedSubjects: number[];
}

interface Class {
  id: number;
  name: string;
  grade_level: number;
  section: string;
}

interface Subject {
  id: number;
  name: string;
  code: string;
  grade_levels: string;
}

interface FacultyRegistrationFormProps {
  onBack: () => void;
}

export default function FacultyRegistrationForm({ onBack }: FacultyRegistrationFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FacultyFormData>({
    name: '',
    email: '',
    password: '',
    selectedClasses: [],
    selectedSubjects: []
  });
  
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch classes and subjects on component mount
  useEffect(() => {
    fetchClassesAndSubjects();
  }, []);

  const fetchClassesAndSubjects = async () => {
    try {
      setDataLoading(true);
      
      // Fetch classes
      const classesResponse = await fetch('/accounts/api/admin/classes/', {
        credentials: 'include'
      });
      const classesData = await classesResponse.json();
      console.log("Classes Data:", classesData);
      
      // Fetch subjects
      const subjectsResponse = await fetch('/accounts/api/admin/subjects/', {
        credentials: 'include'
      });
      const subjectsData = await subjectsResponse.json();
      console.log("Subjects Data:", subjectsData);
      
      if (classesData.success) {
        setClasses(classesData.classes);
      } else {
        toast({
          title: "Error",
          description: "Failed to load classes",
          variant: "destructive"
        });
      }
      
      if (subjectsData.success) {
        setSubjects(subjectsData.subjects);
      } else {
        toast({
          title: "Error", 
          description: "Failed to load subjects",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load form data",
        variant: "destructive"
      });
    } finally {
      setDataLoading(false);
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
      const response = await fetch('/accounts/api/admin/register-faculty/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          class_ids: formData.selectedClasses,
          subject_ids: formData.selectedSubjects
        })
      });

      const data = await response.json();

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
        
        // Go back to selection after a short delay
        setTimeout(() => {
          onBack();
        }, 1500);
      } else {
        toast({
          title: "Registration Failed",
          description: data.message || "Failed to register faculty member",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClassToggle = (classId: number) => {
    setFormData(prev => ({
      ...prev,
      selectedClasses: prev.selectedClasses.includes(classId)
        ? prev.selectedClasses.filter(id => id !== classId)
        : [...prev.selectedClasses, classId]
    }));
    
    // Clear class error if user selects a class
    if (errors.classes) {
      setErrors(prev => ({ ...prev, classes: '' }));
    }
  };

  const handleSubjectToggle = (subjectId: number) => {
    setFormData(prev => ({
      ...prev,
      selectedSubjects: prev.selectedSubjects.includes(subjectId)
        ? prev.selectedSubjects.filter(id => id !== subjectId)
        : [...prev.selectedSubjects, subjectId]
    }));
    
    // Clear subject error if user selects a subject
    if (errors.subjects) {
      setErrors(prev => ({ ...prev, subjects: '' }));
    }
  };

  if (dataLoading) {
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
            {classes.map((cls) => (
              <div
                key={cls.id}
                onClick={() => handleClassToggle(cls.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  formData.selectedClasses.includes(cls.id)
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{cls.name}</p>
                    <p className="text-xs text-gray-500">Grade {cls.grade_level}</p>
                  </div>
                  {formData.selectedClasses.includes(cls.id) && (
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                  )}
                </div>
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                onClick={() => handleSubjectToggle(subject.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  formData.selectedSubjects.includes(subject.id)
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{subject.name}</p>
                    <p className="text-xs text-gray-500">{subject.code}</p>
                  </div>
                  {formData.selectedSubjects.includes(subject.id) && (
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                  )}
                </div>
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
}