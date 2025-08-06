import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Instagram } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function Contact() {
  // Carousel logic (single slide for now, extensible for more)
  const heroSlides = [
    {
      image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=1200&h=600&fit=crop", // Example contact/office image
      title: "Contact Us",
      subtitle: "We're Here to Help",
      description: "Reach out to us for any questions, support, or information. Our team is ready to assist you!",
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
    <div className="min-h-screen">
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
                        <Mail className="h-5 w-5 mr-2" />
                        <span className="font-medium">Contact & Support</span>
                      </div>
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                      >
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">
                          {slide.title.includes("Contact") ? slide.title : <>Our <span className="text-blue-500">Contact</span></>}
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
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 mb-12">
              {[
                {
                  icon: MapPin,
                  title: "Address",
                  info: "123 Education Street, Science City, SC 12345",
                },
                {
                  icon: Phone,
                  title: "Phone",
                  info: "+1 (555) 123-4567",
                },
                {
                  icon: Mail,
                  title: "Email",
                  info: "info@dis.edu",
                },
                {
                  icon: Instagram,
                  title: "Instagram",
                  info: "@dani.sofficial",
                },
              ].map((contact, index) => (
                <motion.div
                  key={contact.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-blue-100 dark:border-gray-700 text-center"
                >
                  <contact.icon className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
                  <h3 className="font-bold text-blue-900 dark:text-blue-400 mb-2">
                    {contact.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{contact.info}</p>
                </motion.div>
              ))}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-blue-100 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-400 mb-4 text-center">
                Get In Touch
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                Our interactive contact form with department routing and
                real-time support is being developed to serve you better.
              </p>
              <div className="text-blue-600 dark:text-blue-400 font-medium text-center">
                For immediate assistance, please call us or send an email.
              </div>
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
