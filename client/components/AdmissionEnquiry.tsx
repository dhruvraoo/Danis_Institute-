import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { AdmissionEnquiryRequest, AdmissionEnquiryResponse } from "@/../shared/api";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  course: z.string().min(1, "Please select a course"),
  previousEducation: z.string().optional(),
  subjects: z.array(z.string()).min(1, "Please select at least one subject"),
  message: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const courses = [
  "12th",
  "11th",
  "10th",
  "9th",
];

const educationLevels = [
  "High School (12th Grade)",
  "Diploma",
  "Bachelor's Degree",
  "Master's Degree",
  "Other",
];

export default function AdmissionEnquiry() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inquiryId, setInquiryId] = useState<number | null>(null);
  const totalSteps = 3;
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  const watchedFields = watch();

  const onSubmit = async (data: FormData) => {
    console.log("onSubmit called with data:", data);
    setIsSubmitting(true);
    
    // Prepare the request body
    const reqBody: AdmissionEnquiryRequest = {
      ...data,
      subjects: Array.isArray(watchedFields.subjects) ? watchedFields.subjects : [],
    };
    
    console.log("Request body:", reqBody);
    
    try {
      console.log("Sending request to /api/enquiry");
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody),
      });
      
      console.log("Response status:", res.status);
      const result: AdmissionEnquiryResponse = await res.json();
      console.log("Response data:", result);
      
      if (result.success) {
        console.log("Success! Moving to step 3");
        setInquiryId(result.inquiryId || null);
        setCurrentStep(3); // Move to success step
        setIsSubmitted(true);
      } else {
        console.log("API returned error:", result.message);
        toast({
          variant: "destructive",
          title: "Submission Failed",
          description: result.message || "Failed to send enquiry.",
        });
      }
    } catch (err) {
      console.error("Request failed:", err);
      toast({
        variant: "destructive",
        title: "Network Error",
        description: "Failed to send enquiry. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleFormSubmit = async () => {
    console.log("Submit button clicked");
    console.log("Current form data:", watchedFields);
    
    // Validate form before submission
    const isValid = await trigger(); // Trigger validation for all fields
    console.log("Form validation result:", isValid);
    console.log("Form errors:", errors);
    
    if (isValid) {
      console.log("Form is valid, submitting...");
      handleSubmit(onSubmit)();
    } else {
      console.log("Form validation failed");
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return (
          watchedFields.firstName &&
          watchedFields.lastName &&
          watchedFields.email &&
          !errors.firstName &&
          !errors.lastName &&
          !errors.email
        );
      case 2:
        return (
          watchedFields.phone &&
          watchedFields.course &&
          Array.isArray(watchedFields.subjects) &&
          watchedFields.subjects.length > 0 &&
          !errors.phone &&
          !errors.course
        );
      case 3:
        return isSubmitted;
      default:
        return false;
    }
  };



  return (
    <section className="py-8 bg-white dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-6"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Start Your Journey
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Take the first step towards your future. Submit your admission
            enquiry today.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden"
        >
          {/* Progress Bar */}
          <div className="bg-gray-50 dark:bg-gray-700 px-8 py-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all ${
                    step <= currentStep
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-300"
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300 mt-3">
              <span>Personal Info</span>
              <span>Course Details</span>
              <span>Confirmation</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-8">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        {...register("firstName")}
                        className="mt-2"
                        placeholder="Enter your first name"
                      />
                      {errors.firstName && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.firstName.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        {...register("lastName")}
                        className="mt-2"
                        placeholder="Enter your last name"
                      />
                      {errors.lastName && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="admission-email">Email Address</Label>
                    <Input
                      id="admission-email"
                      type="email"
                      {...register("email")}
                      className="mt-2"
                      placeholder="Enter your email address"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      {...register("phone")}
                      className="mt-2"
                      placeholder="Enter your phone number"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="course">Course of Interest</Label>
                    <Select
                      onValueChange={(value) => setValue("course", value)}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course} value={course}>
                            {course}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.course && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.course.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="previousEducation">Previous Education (Optional)</Label>
                    <Select
                      onValueChange={(value) => setValue("previousEducation", value)}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select your previous education" />
                      </SelectTrigger>
                      <SelectContent>
                        {educationLevels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Subject Checkboxes */}
                  {watch("course") && (
                    <div>
                      <Label>Subjects</Label>
                      <div className="flex flex-wrap gap-3 mt-3">
                        {(["9th", "10th"].includes(watch("course"))
                          ? ["Maths", "Social Studies", "Science", "English"]
                          : ["Physics", "Chemistry", "Maths", "Biology"]
                        ).map((subject) => {
                          const isSelected = Array.isArray(watch("subjects")) && watch("subjects").includes(subject);
                          return (
                            <label
                              key={subject}
                              className={`cursor-pointer px-4 py-2 rounded-full border transition-all select-none flex items-center
                                ${isSelected
                                  ? "bg-blue-600 text-white border-blue-600 shadow"
                                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-700"}
                              `}
                            >
                              <input
                                type="checkbox"
                                value={subject}
                                checked={isSelected}
                                onChange={(e) => {
                                  let newSubjects = Array.isArray(watch("subjects")) ? [...watch("subjects")] : [];
                                  if (e.target.checked) {
                                    if (["11th", "12th"].includes(watch("course")) && (subject === "Maths" || subject === "Biology")) {
                                      // Only one of Maths or Biology can be selected
                                      newSubjects = newSubjects.filter((s) => s !== (subject === "Maths" ? "Biology" : "Maths"));
                                    }
                                    newSubjects.push(subject);
                                  } else {
                                    newSubjects = newSubjects.filter((s) => s !== subject);
                                  }
                                  setValue("subjects", newSubjects, { shouldValidate: true });
                                }}
                                className="hidden"
                              />
                              {subject}
                            </label>
                          );
                        })}
                      </div>
                      {(["11th", "12th"].includes(watch("course"))) && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 ml-1">
                          (You can only select one between Maths and Biology)
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Message Field */}
                  <div>
                    <Label htmlFor="message">
                      Additional Message (Optional)
                    </Label>
                    <Textarea
                      id="message"
                      {...register("message")}
                      className="mt-2"
                      placeholder="Tell us more about your interests, goals, or any questions you have..."
                      rows={4}
                    />
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="text-center py-8"
                >
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-blue-900 mb-4">
                    Inquiry sent to admin successfully!
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto mb-4">
                    Your inquiry has been submitted successfully. We will contact you within 24 hours.
                  </p>
                  {inquiryId && (
                    <p className="text-sm text-gray-500">
                      Reference ID: #{inquiryId}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            {currentStep < 3 && (
              <div className="flex justify-between mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>

                {currentStep === 2 ? (
                  <Button
                    type="button"
                    onClick={handleFormSubmit}
                    disabled={!isStepValid(currentStep) || isSubmitting}
                    className="flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Application
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!isStepValid(currentStep)}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </form>
        </motion.div>
      </div>
    </section>
  );
}
