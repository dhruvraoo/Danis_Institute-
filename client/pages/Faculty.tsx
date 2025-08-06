import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import { motion } from "framer-motion";
import {
  Users,
  Award,
  BookOpen,
  Star,
  Mail,
  Phone,
  GraduationCap,
  MapPin,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { ArrowLeft, ArrowRight, Users as UsersIcon } from "lucide-react";
import { useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const departments = [
  { id: "all", label: "All Departments" },
  { id: "computer-science", label: "Computer Science" },
  { id: "mathematics", label: "Mathematics" },
  { id: "physics", label: "Physics" },
  { id: "chemistry", label: "Chemistry" },
  { id: "engineering", label: "Engineering" },
];

const facultyMembers = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    title: "Professor & Head of Department",
    department: "computer-science",
    specialization: "Artificial Intelligence & Machine Learning",
    education: "Ph.D. Computer Science, MIT",
    experience: "15 years",
    email: "sarah.johnson@dis.edu",
    phone: "+1 (555) 123-4567",
    image:
      "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=300&h=300&fit=crop&crop=face",
    description:
      "Dr. Johnson is a leading expert in AI and ML with over 50 published papers. She has led groundbreaking research in neural networks and has been instrumental in developing cutting-edge curriculum for the Computer Science department.",
    achievements: [
      "IEEE Fellow Award 2020",
      "50+ Research Publications",
      "AI Innovation Grant Recipient",
    ],
    courses: ["Advanced Machine Learning", "Neural Networks", "AI Ethics"],
  },
  {
    id: 2,
    name: "Prof. Michael Chen",
    title: "Professor of Mathematics",
    department: "mathematics",
    specialization: "Applied Mathematics & Statistics",
    education: "Ph.D. Mathematics, Stanford University",
    experience: "18 years",
    email: "michael.chen@dis.edu",
    phone: "+1 (555) 123-4568",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
    description:
      "Prof. Chen specializes in applied mathematics and statistical modeling. His research focuses on mathematical modeling of complex systems and has applications in engineering, economics, and biological sciences.",
    achievements: [
      "National Science Foundation Grant",
      "Best Teacher Award 2021",
      "40+ Research Papers",
    ],
    courses: ["Calculus III", "Statistical Modeling", "Mathematical Analysis"],
  },
  {
    id: 3,
    name: "Dr. Emily Rodriguez",
    title: "Associate Professor",
    department: "physics",
    specialization: "Quantum Physics & Nanotechnology",
    education: "Ph.D. Physics, Harvard University",
    experience: "12 years",
    email: "emily.rodriguez@dis.edu",
    phone: "+1 (555) 123-4569",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face",
    description:
      "Dr. Rodriguez is at the forefront of quantum physics research. Her work in nanotechnology has led to several breakthroughs in quantum computing and has been published in top-tier scientific journals.",
    achievements: [
      "Quantum Research Excellence Award",
      "30+ Publications in Nature",
      "Patent Holder (5 patents)",
    ],
    courses: ["Quantum Mechanics", "Advanced Physics Lab", "Nanotechnology"],
  },
  {
    id: 4,
    name: "Dr. James Wilson",
    title: "Professor of Chemistry",
    department: "chemistry",
    specialization: "Organic Chemistry & Drug Development",
    education: "Ph.D. Chemistry, Oxford University",
    experience: "20 years",
    email: "james.wilson@dis.edu",
    phone: "+1 (555) 123-4570",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
    description:
      "Dr. Wilson's research in organic chemistry has contributed significantly to pharmaceutical development. He has collaborated with leading pharmaceutical companies and holds multiple patents in drug synthesis.",
    achievements: [
      "Royal Society of Chemistry Fellow",
      "Drug Development Innovation Award",
      "60+ Research Publications",
    ],
    courses: ["Organic Chemistry", "Medicinal Chemistry", "Advanced Synthesis"],
  },
  {
    id: 5,
    name: "Prof. Lisa Garcia",
    title: "Assistant Professor",
    department: "engineering",
    specialization: "Mechanical Engineering & Robotics",
    education: "Ph.D. Mechanical Engineering, Cal Tech",
    experience: "8 years",
    email: "lisa.garcia@dis.edu",
    phone: "+1 (555) 123-4571",
    image:
      "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=300&h=300&fit=crop&crop=face",
    description:
      "Prof. Garcia is a rising star in mechanical engineering with expertise in robotics and automation. Her research lab develops innovative robotic solutions for healthcare and manufacturing industries.",
    achievements: [
      "Young Engineer Award 2022",
      "Robotics Innovation Grant",
      "25+ Conference Presentations",
    ],
    courses: [
      "Robotics Engineering",
      "Control Systems",
      "Design & Manufacturing",
    ],
  },
  {
    id: 6,
    name: "Dr. David Kumar",
    title: "Professor of Computer Science",
    department: "computer-science",
    specialization: "Cybersecurity & Network Systems",
    education: "Ph.D. Computer Science, Carnegie Mellon",
    experience: "16 years",
    email: "david.kumar@dis.edu",
    phone: "+1 (555) 123-4572",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop&crop=face",
    description:
      "Dr. Kumar is a cybersecurity expert who has advised government agencies and Fortune 500 companies. His research focuses on network security, cryptography, and secure system design.",
    achievements: [
      "Cybersecurity Excellence Award",
      "Government Security Consultant",
      "45+ Security Publications",
    ],
    courses: ["Network Security", "Cryptography", "Ethical Hacking"],
  },
];

export default function Faculty() {
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  // Carousel logic (single slide for now, extensible for more)
  const heroSlides = [
    {
      image: "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=1200&h=600&fit=crop", // Example faculty/education image
      title: "Our Faculty",
      description: "Meet our world-class educators and researchers who are passionate about shaping the next generation of leaders and innovators.",
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

  const filteredFaculty =
    selectedDepartment === "all"
      ? facultyMembers
      : facultyMembers.filter(
          (faculty) => faculty.department === selectedDepartment,
        );

  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <main
        className="pt-16 transition-all duration-300"
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
                        <UsersIcon className="h-5 w-5 mr-2" />
                        <span className="font-medium">Faculty & Researchers</span>
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

        {/* Stats Section */}
        <section className="py-12 bg-white dark:bg-gray-900">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 mb-8">
              {[
                { icon: UsersIcon, value: "150+", label: "Faculty Members" },
                { icon: Award, value: "Ph.D.", label: "Qualified" },
                { icon: BookOpen, value: "500+", label: "Publications" },
                { icon: Star, value: "4.9", label: "Student Rating" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow border border-blue-100 dark:border-gray-700 text-center"
                >
                  <div className="w-10 h-10 mx-auto mb-2 flex items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900">
                    <stat.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white mb-0.5">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 text-xs font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Department Filter */}
        <section className="py-8 bg-gray-100 dark:bg-gray-950 border-y border-gray-200 dark:border-gray-800">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-3">
              {departments.map((dept) => (
                <Button
                  key={dept.id}
                  onClick={() => setSelectedDepartment(dept.id)}
                  variant="ghost"
                  className={`px-4 py-2 rounded-full font-medium transition-all ${
                    dept.id === selectedDepartment
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {dept.label}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Faculty Cards */}
        <section className="py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredFaculty.map((faculty, index) => (
                <motion.div
                  key={faculty.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full bg-white dark:bg-gray-800">
                    <div className="relative">
                      <img
                        src={faculty.image}
                        alt={faculty.name}
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                        <h3 className="text-xl font-bold text-white mb-1">
                          {faculty.name}
                        </h3>
                        <p className="text-blue-200 dark:text-blue-300 font-medium">
                          {faculty.title}
                        </p>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <div className="mb-4">
                        <div className="flex items-center mb-2">
                          <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" />
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {faculty.specialization}
                          </span>
                        </div>
                        <div className="flex items-center mb-2">
                          <GraduationCap className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {faculty.education}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {faculty.experience} Experience
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed mb-4 line-clamp-4">
                        {faculty.description}
                      </p>

                      {!isMobile && (
                        <>
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          Achievements:
                        </h4>
                        <ul className="space-y-1">
                          {faculty.achievements
                            .slice(0, 2)
                            .map((achievement, idx) => (
                              <li
                                key={idx}
                                className="text-xs text-gray-600 dark:text-gray-300 flex items-center"
                              >
                                <Award className="h-3 w-3 text-yellow-500 mr-2" />
                                {achievement}
                              </li>
                            ))}
                        </ul>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          Courses:
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {faculty.courses.slice(0, 2).map((course, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs rounded-full"
                            >
                              {course}
                            </span>
                          ))}
                        </div>
                      </div>
                        </>
                      )}

                      <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-3">
                            <a
                              href={`mailto:${faculty.email}`}
                              className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                            >
                              <Mail className="h-4 w-4 mr-1" />
                              Email
                            </a>
                            <a
                              href={`tel:${faculty.phone}`}
                              className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                            >
                              <Phone className="h-4 w-4 mr-1" />
                              Call
                            </a>
                          </div>
                          <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700">
                            View Profile
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
