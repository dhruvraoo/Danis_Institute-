import { motion } from "framer-motion";
import {
  Award,
  Laptop,
  Rocket,
  Users,
  BookOpen,
  Lightbulb,
} from "lucide-react";

const features = [
  {
    icon: Award,
    title: "Excellence in Education",
    description:
      "World-class faculty and cutting-edge curriculum designed to foster academic excellence and critical thinking skills.",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    icon: Laptop,
    title: "Modern Learning",
    description:
      "State-of-the-art technology integration, interactive classrooms, and digital resources for enhanced learning experiences.",
    gradient: "from-blue-600 to-blue-700",
  },
  {
    icon: Rocket,
    title: "Future Ready",
    description:
      "Preparing students for tomorrow's challenges with innovative programs, industry partnerships, and practical skills development.",
    gradient: "from-blue-700 to-blue-800",
  },
];

const additionalFeatures = [
  { icon: Users, title: "Expert Faculty", count: "150+" },
  { icon: BookOpen, title: "Research Papers", count: "500+" },
  { icon: Lightbulb, title: "Innovation Projects", count: "200+" },
];

export default function FeatureHighlights() {
  return (
    <section className="py-4 sm:py-8 md:py-12 lg:py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-4 sm:mb-8 md:mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Why Choose DIS?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover what makes DaNi's Institute of Science the perfect choice
            for your educational journey
          </p>
        </motion.div>

        {/* Main Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6 mb-8 sm:mb-12 md:mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              className="group"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-700 h-full transition-all group-hover:shadow-md">
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-blue-600 dark:bg-blue-500 mb-4 sm:mb-6">
                  <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>

                <h3 className="text-base sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 lg:p-10 shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-6 xl:gap-8">
            {additionalFeatures.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 dark:bg-blue-900/50 rounded-lg sm:rounded-xl mb-3 sm:mb-4">
                  <item.icon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {item.count}
                </div>
                <div className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm font-medium">
                  {item.title}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
