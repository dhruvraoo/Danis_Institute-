import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Clock, Trophy, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { useRef, useEffect } from "react";

const eventCategories = [
  { id: "all", label: "All", isActive: true },
  { id: "debate", label: "Debate", isActive: false },
  { id: "mun", label: "MUN", isActive: false },
  { id: "workshop", label: "Workshop", isActive: false },
  { id: "conference", label: "Conference", isActive: false },
  { id: "social", label: "Social Impact", isActive: false },
];

const events = [
  {
    id: 1,
    title: "State-Level Debate Championship 2024",
    description:
      "Gujarat's premier debate competition bringing together the brightest minds from across the state to engage in intellectual discourse.",
    category: "debate",
    status: "upcoming",
    date: "12/11/2024",
    time: "09:00 AM",
    location: "Central Assembly, Gandhinagar",
    participants: 200,
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop",
    tags: ["Upcoming"],
  },
  {
    id: 2,
    title: "Model United Nations Conference",
    description:
      "Three-day intensive MUN conference simulating real-world diplomatic scenarios and international relations.",
    category: "mun",
    status: "upcoming",
    date: "18/11/2024",
    time: "08:30 AM",
    location: "IIT Gandhinagar",
    participants: 150,
    image:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400&h=200&fit=crop",
    tags: ["Upcoming"],
  },
  {
    id: 3,
    title: "Leadership Skills Workshop",
    description:
      "Hands-on workshop focusing on developing leadership qualities, public speaking, and team management skills.",
    category: "workshop",
    status: "completed",
    date: "11/06/2024",
    time: "02:00 PM",
    location: "Ahmedabad University, Ahmedabad",
    participants: 75,
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=200&fit=crop",
    tags: ["Workshop", "Completed"],
  },
  {
    id: 4,
    title: "Youth Conference on Social Impact",
    description:
      "Conference focusing on social entrepreneurship and community impact initiatives led by student leaders.",
    category: "social",
    status: "upcoming",
    date: "15/11/2024",
    time: "10:00 AM",
    location: "Nirma University",
    participants: 120,
    image:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=200&fit=crop",
    tags: ["Conference", "Upcoming"],
  },
  {
    id: 5,
    title: "Community Outreach Program",
    description:
      "Social impact initiative focusing on education and environmental awareness in rural communities.",
    category: "social",
    status: "completed",
    date: "22/09/2024",
    time: "09:00 AM",
    location: "Rural Gujarat",
    participants: 80,
    image:
      "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=200&fit=crop",
    tags: ["Social Impact", "Completed"],
  },
];

export default function Events() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [heroIndex, setHeroIndex] = useState(0);
  const heroEvents = events.filter(e => e.status === "upcoming");
  const heroCount = heroEvents.length;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Autoplay logic
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

  const filteredEvents =
    activeCategory === "all"
      ? events
      : events.filter((event) => event.category === activeCategory);

  const getCategoryButtonStyle = (categoryId: string) => {
    return categoryId === activeCategory
      ? "bg-blue-600 text-white hover:bg-blue-700"
      : "bg-gray-200 text-gray-700 hover:bg-gray-300";
  };

  const getTagColor = (tag: string) => {
    switch (tag.toLowerCase()) {
      case "upcoming":
        return "bg-green-100 text-green-700 border border-green-200";
      case "completed":
        return "bg-gray-100 text-gray-600 border border-gray-200";
      case "workshop":
        return "bg-blue-100 text-blue-700 border border-blue-200";
      case "conference":
        return "bg-purple-100 text-purple-700 border border-purple-200";
      case "social impact":
        return "bg-blue-100 text-blue-700 border border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

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
              {heroEvents.map((event, idx) => (
                <CarouselItem key={event.id} style={{ display: idx === heroIndex ? "block" : "none" }}>
                <section
                  className="relative py-24 bg-cover bg-center"
                  style={{
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('${event.image.replace("w=400&h=200", "w=1200&h=600")}')`,
                  }}
                >
                  <div className="max-w-6xl mx-auto px-6 lg:px-8 text-center text-white">
                    <div className="flex items-center justify-center mb-6">
                      <Calendar className="h-5 w-5 mr-2" />
                      <span className="font-medium">Events & Competitions</span>
                    </div>
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8 }}
                    >
                      <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        {event.title.includes("Event") ? event.title : <>Our <span className="text-blue-500">Events</span></>}
                      </h1>
                      <p className="text-xl text-gray-200 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
                        {event.description}
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

        {/* Category Filter */}
        <section className="py-8 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-3">
              {eventCategories.map((category) => (
                <Button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  variant="ghost"
                  className={`px-6 py-2 rounded-full font-medium transition-all ${getCategoryButtonStyle(category.id)}`}
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Events Grid */}
        <section className="py-12 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full bg-white dark:bg-gray-800">
                    <div className="relative">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        {event.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getTagColor(tag)} dark:bg-opacity-80`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
                        {event.title}
                      </h3>

                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 leading-relaxed">
                        {event.description}
                      </p>

                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-6">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                          <span>{event.date}</span>
                          <Clock className="h-4 w-4 ml-4 mr-2 text-gray-500 dark:text-gray-400" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                          <span>{event.participants} participants</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                        {event.status === "upcoming" ? (
                          <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 dark:bg-blue-800 dark:hover:bg-blue-900"
                          >
                            Register Now
                          </Button>
                        ) : (
                          <div className="flex items-center justify-center py-3 text-gray-500 dark:text-gray-400">
                            <Trophy className="h-5 w-5 mr-2" />
                            <span className="font-medium">Completed</span>
                          </div>
                        )}
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
