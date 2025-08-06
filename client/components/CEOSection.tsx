import { motion } from "framer-motion";
import { Linkedin, Twitter, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CEOSection() {
  return (
    <section className="py-24 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto"
        >
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 md:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* CEO Photo and Info */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-center lg:text-left"
              >
                <div className="relative inline-block mb-6">
                  <img
                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop&crop=face"
                    alt="Dr. Daniel Martinez"
                    className="w-48 h-48 md:w-64 md:h-64 rounded-2xl object-cover shadow-lg border-4 border-white dark:border-gray-700"
                  />
                  <div className="absolute -bottom-4 -right-4 bg-blue-600 rounded-2xl p-3">
                    <div className="text-white text-center">
                      <div className="text-sm font-bold">25+</div>
                      <div className="text-xs">Years</div>
                    </div>
                  </div>
                </div>

                <h3 className="text-2xl md:text-3xl font-bold text-blue-900 dark:text-blue-300 mb-2">
                  Dr. Daniel Martinez
                </h3>
                <p className="text-lg text-blue-700 dark:text-blue-400 mb-4 font-medium">
                  Principal & CEO
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                  Ph.D. in Educational Leadership, M.Sc. in Computer Science
                </p>

                {/* Social Links */}
                <div className="flex justify-center lg:justify-start space-x-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                  >
                    <Linkedin className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                  >
                    <Twitter className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>

              {/* CEO Message */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <div>
                  <h4 className="text-2xl md:text-3xl font-bold text-blue-900 dark:text-blue-300 mb-4">
                    A Message from Our Principal
                  </h4>
                  <div className="space-y-4 text-gray-700 dark:text-gray-200 leading-relaxed">
                    <p>
                      "Welcome to DaNi's Institute of Science, where excellence
                      meets innovation. For over 25 years, we have been
                      committed to nurturing brilliant minds and shaping the
                      leaders of tomorrow."
                    </p>
                    <p>
                      "Our mission extends beyond traditional education. We
                      believe in creating an environment where students can
                      explore, innovate, and develop the critical thinking
                      skills necessary to tackle real-world challenges."
                    </p>
                    <p>
                      "At DIS, every student is unique, and we are dedicated to
                      helping each individual discover their potential and
                      achieve their dreams. Join us on this incredible journey
                      of learning and growth."
                    </p>
                  </div>
                </div>

                {/* Achievements */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-700 rounded-xl p-4 text-center shadow-sm">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                      98%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Placement Rate</div>
                  </div>
                  <div className="bg-white dark:bg-gray-700 rounded-xl p-4 text-center shadow-sm">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                      15+
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Industry Awards</div>
                  </div>
                  <div className="bg-white dark:bg-gray-700 rounded-xl p-4 text-center shadow-sm">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                      5000+
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Alumni Network</div>
                  </div>
                  <div className="bg-white dark:bg-gray-700 rounded-xl p-4 text-center shadow-sm">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                      50+
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Research Projects
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="pt-4">
                  <Button size="lg" className="w-full sm:w-auto">
                    Schedule a Meeting
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
