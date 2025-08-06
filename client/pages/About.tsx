import { motion } from "framer-motion";
import {
  Award,
  Users,
  BookOpen,
  Target,
  Eye,
  Heart,
  Building,
  Globe,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Award as AwardIcon } from "lucide-react";
import { useRef, useEffect, useState } from "react";

const values = [
  {
    icon: Target,
    title: "Excellence",
    description:
      "We strive for the highest standards in everything we do, from teaching to research to student support.",
  },
  {
    icon: Eye,
    title: "Innovation",
    description:
      "We embrace new ideas, technologies, and methodologies to enhance learning and discovery.",
  },
  {
    icon: Heart,
    title: "Integrity",
    description:
      "We conduct ourselves with honesty, transparency, and ethical responsibility in all our endeavors.",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "We foster a diverse, inclusive environment where everyone can thrive and contribute.",
  },
];

const milestones = [
  {
    year: "1998",
    event: "Institute Founded",
    detail: "Established with 50 students",
  },
  {
    year: "2005",
    event: "First Research Center",
    detail: "Opened Advanced Computing Lab",
  },
  {
    year: "2010",
    event: "International Recognition",
    detail: "Received Global Excellence Award",
  },
  { year: "2015", event: "Campus Expansion", detail: "Doubled facility size" },
  {
    year: "2020",
    event: "Digital Transformation",
    detail: "Launched online learning platform",
  },
  {
    year: "2024",
    event: "5000+ Graduates",
    detail: "Celebrated major milestone",
  },
];

export default function About() {
  // Carousel logic (single slide for now, extensible for more)
  const heroSlides = [
    {
      image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?w=1200&h=600&fit=crop", // Example about/education image
      title: "About Us",
      description: "For over 25 years, we have been at the forefront of educational excellence, nurturing brilliant minds and fostering innovation that shapes the future.",
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
                        <AwardIcon className="h-5 w-5 mr-2" />
                        <span className="font-medium">Excellence & Innovation</span>
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

        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-8 mb-8 sm:mb-12 md:mb-16">
              {[
                { icon: Award, value: "25+", label: "Years of Excellence" },
                { icon: Users, value: "5,000+", label: "Successful Alumni" },
                { icon: BookOpen, value: "50+", label: "Programs Offered" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 text-center shadow-sm border border-gray-100 dark:border-gray-700"
                >
                  <stat.icon className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-blue-600 dark:text-blue-400 mx-auto mb-2 sm:mb-3 md:mb-4" />
                  <div className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-2 sm:py-4 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-blue-900 dark:text-blue-400 mb-3 sm:mb-6">
                  Our Mission
                </h2>
                <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-3 sm:mb-6">
                  To provide world-class education that empowers students with
                  knowledge, skills, and values necessary to become leaders and
                  innovators in their chosen fields while contributing
                  positively to society.
                </p>
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl sm:rounded-2xl flex items-center justify-center">
                    <Target className="h-5 w-5 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-blue-900 dark:text-blue-400">
                      Excellence in Education
                    </h3>
                    <p className="text-xs sm:text-gray-600 dark:text-gray-400">
                      Committed to the highest standards
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-xl p-1 sm:rounded-2xl sm:p-2"
              >
                <h2 className="text-lg sm:text-3xl md:text-4xl font-bold text-blue-900 dark:text-blue-400 mb-3 sm:mb-6">
                  Our Vision
                </h2>
                <p className="text-sm sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-3 sm:mb-6">
                  To be a globally recognized institution that shapes the future
                  through innovative education, cutting-edge research, and
                  sustainable development initiatives that benefit humanity.
                </p>
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <div className="w-8 h-8 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg sm:rounded-2xl flex items-center justify-center">
                    <Globe className="h-4 w-4 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-base font-semibold text-blue-900 dark:text-blue-400">
                      Global Impact
                    </h3>
                    <p className="text-xs sm:text-gray-600 dark:text-gray-400">
                      Shaping the future worldwide
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-8 sm:mb-12 md:mb-16"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-900 dark:text-blue-400 mb-3 sm:mb-4 md:mb-6">
                Our Core Values
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                The principles that guide everything we do at DaNi's Institute
                of Science
              </p>
            </motion.div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg border border-blue-100 dark:border-gray-700 text-center"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-600 dark:to-blue-800 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4">
                    <value.icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white" />
                  </div>
                  <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-blue-900 dark:text-blue-400 mb-1 sm:mb-2 md:mb-3">
                    {value.title}
                  </h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-blue-900 dark:text-blue-400 mb-6">
                Our Journey
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Key milestones in our commitment to educational excellence
              </p>
            </motion.div>

            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-blue-200 dark:bg-blue-800"></div>

              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`relative flex items-center mb-12 ${index % 2 === 0 ? "justify-start" : "justify-end"
                    }`}
                >
                  <div
                    className={`w-1/2 ${index % 2 === 0 ? "pr-8 text-right" : "pl-8"}`}
                  >
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-blue-100 dark:border-gray-700">
                      <div className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400 mb-1 sm:mb-2">
                        {milestone.year}
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-blue-900 dark:text-blue-400 mb-1 sm:mb-2">
                        {milestone.event}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                        {milestone.detail}
                      </p>
                    </div>
                  </div>

                  <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-blue-600 rounded-full border-4 border-white shadow-lg"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Leadership */}
        <section className="py-20 bg-gradient-to-b from-blue-50 to-white dark:from-gray-800 dark:to-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-blue-900 dark:text-blue-400 mb-6">
                Leadership Team
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Meet the visionary leaders driving our institution forward
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  name: "Dr. Daniel Martinez",
                  role: "Principal & CEO",
                  image:
                    "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop&crop=face",
                  education: "Ph.D. Educational Leadership",
                },
                {
                  name: "Dr. Sarah Johnson",
                  role: "Vice Principal - Academics",
                  image:
                    "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=300&h=300&fit=crop&crop=face",
                  education: "Ph.D. Computer Science",
                },
                {
                  name: "Prof. Michael Chen",
                  role: "Dean of Research",
                  image:
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
                  education: "Ph.D. Engineering",
                },
              ].map((leader, index) => (
                <motion.div
                  key={leader.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-blue-100 dark:border-gray-700 text-center"
                >
                  <img
                    src={leader.image}
                    alt={leader.name}
                    className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-blue-100 dark:border-blue-800"
                  />
                  <h3 className="text-xl font-bold text-blue-900 dark:text-blue-400 mb-2">
                    {leader.name}
                  </h3>
                  <p className="text-blue-600 dark:text-blue-400 font-medium mb-2">
                    {leader.role}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {leader.education}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <div
        className="transition-all duration-300 bg-white dark:bg-gray-900"
        style={{ marginLeft: "var(--sidebar-width, 0px)" }}
      >
        <Footer />
      </div>
    </div>
  );
}
