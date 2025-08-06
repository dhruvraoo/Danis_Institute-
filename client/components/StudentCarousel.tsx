import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    course: "Computer Science",
    year: "Final Year",
    image:
      "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face",
    quote:
      "DIS has transformed my understanding of technology. The faculty here doesn't just teach; they inspire and mentor. The hands-on projects and industry collaborations have prepared me for real-world challenges.",
    rating: 5,
  },
  {
    id: 2,
    name: "Michael Chen",
    course: "Electronics Engineering",
    year: "Graduate",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    quote:
      "The research opportunities at DIS are unparalleled. I've published two papers during my studies and received mentorship that helped me secure a position at a leading tech company.",
    rating: 5,
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    course: "Biotechnology",
    year: "Third Year",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    quote:
      "The laboratory facilities and equipment at DIS are state-of-the-art. Working on real biotech projects has given me confidence and skills that I know will serve me well in my career.",
    rating: 5,
  },
  {
    id: 4,
    name: "David Kumar",
    course: "Mechanical Engineering",
    year: "Graduate",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    quote:
      "DIS provided me with a perfect blend of theoretical knowledge and practical experience. The industry connections helped me land my dream job even before graduation.",
    rating: 5,
  },
  {
    id: 5,
    name: "Priya Patel",
    course: "Information Technology",
    year: "Second Year",
    image:
      "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face",
    quote:
      "The supportive environment and innovative teaching methods at DIS make learning enjoyable. The faculty always encourages us to think beyond textbooks and explore new possibilities.",
    rating: 5,
  },
];

export default function StudentCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1,
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1,
    );
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1,
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <section className="py-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Student Stories
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Hear from our students about their transformative journey at DaNi's
            Institute of Science
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div
          className="relative max-w-4xl mx-auto"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          <div className="relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="p-8 md:p-10"
              >
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <img
                        src={testimonials[currentIndex].image}
                        alt={testimonials[currentIndex].name}
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-100 dark:border-gray-700"
                      />
                      <div className="absolute -top-2 -right-2 bg-blue-600 rounded-full p-2">
                        <Quote className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Testimonial Content */}
                  <div className="flex-1 text-center md:text-left">
                    {/* Rating */}
                    <div className="flex justify-center md:justify-start mb-4">
                      {[...Array(testimonials[currentIndex].rating)].map(
                        (_, i) => (
                          <Star
                            key={i}
                            className="h-5 w-5 text-yellow-400 fill-current"
                          />
                        ),
                      )}
                    </div>

                    {/* Quote */}
                    <blockquote className="text-base md:text-lg text-gray-700 dark:text-gray-200 italic mb-6 leading-relaxed">
                      "{testimonials[currentIndex].quote}"
                    </blockquote>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {testimonials[currentIndex].name}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                        {testimonials[currentIndex].course} •{" "}
                        {testimonials[currentIndex].year}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <Button
              variant="outline"
              size="icon"
              onClick={prevTestimonial}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-blue-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextTestimonial}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-blue-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-blue-600 w-8"
                    : "bg-blue-200 dark:bg-blue-800 hover:bg-blue-300 dark:hover:bg-blue-700"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Join thousands of successful students who started their journey at
            DIS
          </p>
          <Button size="lg" className="text-lg px-8 py-4">
            Become a Student
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
