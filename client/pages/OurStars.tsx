import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const starsData = [
  {
    class: "12th Grade Toppers",
    students: [
      {
        name: "Aarav Sharma",
        image: "https://randomuser.me/api/portraits/men/32.jpg",
        achievement: "98.7% Science Stream",
      },
      {
        name: "Priya Patel",
        image: "https://randomuser.me/api/portraits/women/44.jpg",
        achievement: "97.9% Commerce Stream",
      },
      {
        name: "Rohan Mehta",
        image: "https://randomuser.me/api/portraits/men/45.jpg",
        achievement: "97.5% Arts Stream",
      },
    ],
  },
  {
    class: "11th Grade Toppers",
    students: [
      {
        name: "Simran Kaur",
        image: "https://randomuser.me/api/portraits/women/65.jpg",
        achievement: "97.2% Science Stream",
      },
      {
        name: "Vivek Desai",
        image: "https://randomuser.me/api/portraits/men/66.jpg",
        achievement: "96.8% Commerce Stream",
      },
      {
        name: "Ananya Joshi",
        image: "https://randomuser.me/api/portraits/women/67.jpg",
        achievement: "96.5% Arts Stream",
      },
    ],
  },
  {
    class: "10th Grade Toppers",
    students: [
      {
        name: "Rahul Verma",
        image: "https://randomuser.me/api/portraits/men/68.jpg",
        achievement: "98.2%",
      },
      {
        name: "Sneha Singh",
        image: "https://randomuser.me/api/portraits/women/69.jpg",
        achievement: "97.6%",
      },
      {
        name: "Amit Patel",
        image: "https://randomuser.me/api/portraits/men/70.jpg",
        achievement: "97.1%",
      },
    ],
  },
  {
    class: "9th Grade Toppers",
    students: [
      {
        name: "Isha Shah",
        image: "https://randomuser.me/api/portraits/women/71.jpg",
        achievement: "96.9%",
      },
      {
        name: "Karan Gupta",
        image: "https://randomuser.me/api/portraits/men/72.jpg",
        achievement: "96.5%",
      },
      {
        name: "Meera Nair",
        image: "https://randomuser.me/api/portraits/women/73.jpg",
        achievement: "96.2%",
      },
    ],
  },
];

export default function OurStars() {
  // Carousel logic (single slide for now, extensible for more)
  const heroSlides = [
    {
      image: "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?w=1200&h=600&fit=crop", // Example celebratory image
      title: "Our Stars",
      description: "Meet the toppers of each class who have made us proud with their outstanding achievements.",
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <main className="pt-16 transition-all duration-300" style={{ marginLeft: "var(--sidebar-width, 0px)" }}>
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
                        <Star className="h-5 w-5 mr-2" />
                        <span className="font-medium">Toppers & Achievers</span>
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
        <div className="max-w-5xl mx-auto px-4 lg:px-0 space-y-16">
          {starsData.map((section, idx) => (
            <section key={section.class}>
              <h2 className="text-2xl md:text-3xl font-bold text-blue-800 dark:text-blue-300 mb-8 text-center">
                {section.class}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {section.students.map((student) => (
                  <div
                    key={student.name}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center border border-gray-100 dark:border-gray-700"
                  >
                    <img
                      src={student.image}
                      alt={student.name}
                      className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-blue-100 dark:border-blue-800"
                    />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {student.name}
                    </h3>
                    <p className="text-blue-700 dark:text-blue-400 font-medium mb-1">
                      {student.achievement}
                    </p>
                    <span className="text-sm text-gray-500 dark:text-gray-300">{section.class.replace(' Toppers', '')}</span>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
      <div className="transition-all duration-300" style={{ marginLeft: "var(--sidebar-width, 0px)" }}>
        <Footer />
      </div>
    </div>
  );
} 