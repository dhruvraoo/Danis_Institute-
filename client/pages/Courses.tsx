import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import { motion } from "framer-motion";
import {
  BookOpen,
  Clock,
  Users,
  Award,
  GraduationCap,
  FlaskConical,
  Target,
  CheckCircle,
  Calendar,
} from "lucide-react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, BookOpen as BookOpenIcon } from "lucide-react";
import { useRef, useEffect, useState } from "react";

const courseCategories = [
  { id: "all", name: "All Courses" },
  { id: "foundation", name: "Foundation (9th-10th)" },
  { id: "science", name: "Science (11th-12th)" },
  { id: "competitive", name: "Competitive Exams" },
];

const courses = [
  // Foundation Courses (9th-10th)
  {
    id: 1,
    category: "foundation",
    title: "9th Grade Foundation",
    description:
      "Comprehensive curriculum covering Math, Science, Social Studies, and English with strong conceptual foundation.",
    duration: "1 Year",
    subjects: ["Mathematics", "Science", "Social Studies", "English"],
    features: [
      "Interactive Learning",
      "Regular Assessments",
      "Doubt Clearing Sessions",
    ],
    icon: BookOpen,
  },
  {
    id: 2,
    category: "foundation",
    title: "10th Grade Foundation",
    description:
      "Board exam preparation with focus on CBSE/GSEB syllabus and strong foundation for higher studies.",
    duration: "1 Year",
    subjects: ["Mathematics", "Science", "Social Studies", "English"],
    features: ["Board Exam Focus", "Mock Tests", "Career Guidance"],
    icon: BookOpen,
  },
  // Science Courses (11th-12th)
  {
    id: 3,
    category: "science",
    title: "11th Science (PCM)",
    description:
      "Physics, Chemistry, and Mathematics for students aiming for engineering and technical fields.",
    duration: "1 Year",
    subjects: ["Physics", "Chemistry", "Mathematics"],
    features: ["Engineering Foundation", "Practical Labs", "Problem Solving"],
    icon: FlaskConical,
  },
  {
    id: 4,
    category: "science",
    title: "11th Science (PCB)",
    description:
      "Physics, Chemistry, and Biology for students targeting medical and life sciences careers.",
    duration: "1 Year",
    subjects: ["Physics", "Chemistry", "Biology"],
    features: ["Medical Foundation", "Lab Experiments", "NEET Preparation"],
    icon: FlaskConical,
  },
  {
    id: 5,
    category: "science",
    title: "12th Science (PCM)",
    description:
      "Advanced concepts in Physics, Chemistry, and Mathematics with board exam and entrance preparation.",
    duration: "1 Year",
    subjects: ["Physics", "Chemistry", "Mathematics"],
    features: ["Board + JEE Ready", "Advanced Topics", "Mock Exams"],
    icon: FlaskConical,
  },
  {
    id: 6,
    category: "science",
    title: "12th Science (PCB)",
    description:
      "Advanced Biology, Chemistry, and Physics with focus on medical entrance examinations.",
    duration: "1 Year",
    subjects: ["Physics", "Chemistry", "Biology"],
    features: ["Board + NEET Ready", "Medical Focus", "Clinical Concepts"],
    icon: FlaskConical,
  },
  // Competitive Exam Preparation
  {
    id: 7,
    category: "competitive",
    title: "IIT-JEE Preparation",
    description:
      "Comprehensive preparation for JEE Main and Advanced with expert faculty and proven methodology.",
    duration: "2 Years",
    subjects: ["Physics", "Chemistry", "Mathematics"],
    features: [
      "IIT Alumni Faculty",
      "Previous Year Papers",
      "All India Test Series",
    ],
    icon: Target,
  },
  {
    id: 8,
    category: "competitive",
    title: "NEET Preparation",
    description:
      "Medical entrance preparation covering NEET syllabus with extensive practice and mock tests.",
    duration: "2 Years",
    subjects: ["Physics", "Chemistry", "Biology"],
    features: ["Medical Expert Faculty", "NCERT Focus", "AIIMS Preparation"],
    icon: Target,
  },
  {
    id: 9,
    category: "competitive",
    title: "GUJCET Preparation",
    description:
      "Gujarat Common Entrance Test preparation for engineering and pharmacy admissions in Gujarat.",
    duration: "1 Year",
    subjects: ["Physics", "Chemistry", "Mathematics"],
    features: ["Gujarat Focused", "State Pattern", "Regional Faculty"],
    icon: Target,
  },
];

export default function Courses() {
  const [activeCategory, setActiveCategory] = useState("all");

  // Carousel logic (single slide for now, extensible for more)
  const heroSlides = [
    {
      image: "https://images.unsplash.com/photo-1460518451285-97b6aa326961?w=1200&h=600&fit=crop", // Example courses/education image
      title: "Courses",
      description: "From foundation building to competitive exam preparation, we offer comprehensive programs for every academic goal.",
    },
  ];
  const [heroIndex, setHeroIndex] = useState(0);
  const heroCount = heroSlides.length;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (heroCount <= 1) return;
    intervalRef.current = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroCount);
    }, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [heroCount]);

  const handlePrev = () => setHeroIndex((prev) => (prev - 1 + heroCount) % heroCount);
  const handleNext = () => setHeroIndex((prev) => (prev + 1) % heroCount);

  const filteredCourses =
    activeCategory === "all"
      ? courses
      : courses.filter((course) => course.category === activeCategory);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navigation />

      <main
        className="pt-16 transition-all duration-300 bg-white dark:bg-gray-900"
        style={{ marginLeft: "var(--sidebar-width, 0px)" }}
      >
        {/* Hero Section as Carousel */}
        <div className="relative">
          <Carousel className="relative">
            <CarouselContent>
              {heroSlides.map((slide, idx) => (
                <CarouselItem key={idx} style={{ display: idx === heroIndex ? "block" : "none" }}>
                  <section
                    className="relative py-24 bg-cover bg-center"
                    style={{
                      backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('${slide.image}')`,
                    }}
                  >
                    <div className="max-w-6xl mx-auto px-6 lg:px-8 text-center text-white">
                      <div className="flex items-center justify-center mb-6">
                        <BookOpenIcon className="h-5 w-5 mr-2" />
                        <span className="font-medium">Academic Excellence</span>
                      </div>
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                      >
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">
                          {slide.title}
                        </h1>
                        <p className="text-xl text-gray-200 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
                          {slide.description}
                        </p>
                      </motion.div>
                    </div>
                  </section>
                </CarouselItem>
              ))}
            </CarouselContent>
            {/* Custom Navigation Arrows */}
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700"
              aria-label="Previous slide"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700"
              aria-label="Next slide"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Carousel>
        </div>

        <section className="py-16 bg-white dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Statistics */}
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 mb-12">
              {[
                { icon: BookOpen, value: "9+", label: "Course Programs" },
                { icon: GraduationCap, value: "95%", label: "Success Rate" },
                { icon: Users, value: "Expert", label: "Faculty" },
                { icon: Award, value: "Top", label: "Results" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-blue-100 dark:border-gray-700"
                >
                  <stat.icon className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-400 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 text-sm">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Category Filter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap justify-center gap-4 mb-12"
            >
              {courseCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    activeCategory === category.id
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </motion.div>

            {/* Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all group"
                >
                  <div className="flex items-center mb-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 dark:bg-blue-900 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-800 transition-colors">
                      <course.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-4 flex items-center text-sm text-gray-500 dark:text-gray-300">
                      <Calendar className="h-4 w-4 mr-1" />
                      {course.duration}
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {course.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed">
                    {course.description}
                  </p>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Subjects:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {course.subjects.map((subject) => (
                        <span
                          key={subject}
                          className="px-2 py-1 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-md"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Features:
                    </h4>
                    <ul className="space-y-1">
                      {course.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center text-sm text-gray-600 dark:text-gray-300"
                        >
                          <CheckCircle className="h-3 w-3 text-green-500 dark:text-green-400 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">
                    Learn More
                  </Button>
                </motion.div>
              ))}
            </div>
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
