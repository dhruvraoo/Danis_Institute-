import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { GraduationCap, Calendar, FileText, Users } from "lucide-react";

export default function Admissions() {
  return (
    <div className="min-h-screen">
      <Navigation />

      <main
        className="pt-16 transition-all duration-300"
        style={{ marginLeft: "var(--sidebar-width, 0px)" }}
      >
        <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <GraduationCap className="h-16 w-16 text-blue-600 mx-auto mb-6" />
              <h1 className="text-4xl md:text-6xl font-bold text-blue-900 mb-6">
                Admissions
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
                Start your journey with us. Learn about our admission process
                and requirements.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {[
                  { icon: Calendar, label: "Application Deadlines" },
                  { icon: FileText, label: "Requirements" },
                  { icon: GraduationCap, label: "Scholarships" },
                  { icon: Users, label: "International Students" },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white rounded-xl p-6 shadow-lg border border-blue-100"
                  >
                    <item.icon className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                    <div className="text-gray-900 font-medium">
                      {item.label}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg border border-blue-100">
                <h2 className="text-2xl font-bold text-blue-900 mb-4">
                  Ready to Apply?
                </h2>
                <p className="text-gray-600 mb-6">
                  Our comprehensive admissions portal with application forms,
                  document upload, and status tracking is coming soon.
                </p>
                <div className="text-blue-600 font-medium">
                  For immediate assistance, contact our admissions office at
                  admissions@dis.edu
                </div>
              </div>
            </motion.div>
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
