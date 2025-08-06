import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
} from "lucide-react";
import DISLogo from "@/components/DISLogo";

const footerLinks = {
  academics: [
    { name: "Courses", href: "/courses" },
    { name: "Faculty", href: "/faculty" },
    { name: "Academic Calendar", href: "/calendar" },
    { name: "Research", href: "/research" },
  ],
  admissions: [
    { name: "Apply Now", href: "/admissions" },
    { name: "Requirements", href: "/requirements" },
    { name: "Scholarships", href: "/scholarships" },
    { name: "International Students", href: "/international" },
  ],
  campus: [
    { name: "Student Life", href: "/student-life" },
    { name: "Events", href: "/events" },
    { name: "Facilities", href: "/facilities" },
    { name: "Library", href: "/library" },
  ],
  support: [
    { name: "Contact Us", href: "/contact" },
    { name: "Student Support", href: "/support" },
    { name: "Career Services", href: "/careers" },
    { name: "Alumni", href: "/alumni" },
  ],
};

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
            {/* Institute Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <Link to="/" className="flex items-center space-x-3 mb-6">
                <DISLogo size="md" className="text-blue-400" />
                <div>
                  <h3 className="text-xl font-semibold">
                    DaNi's Institute of Science
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Excellence in Education
                  </p>
                </div>
              </Link>

              <p className="text-blue-100 mb-6 leading-relaxed">
                Empowering minds and shaping futures through world-class
                education, innovative research, and industry-focused programs
                since 1998.
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-blue-300" />
                  <span className="text-blue-100">
                    123 Education Street, Science City, SC 12345
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-blue-300" />
                  <span className="text-blue-100">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-300" />
                  <span className="text-blue-100">info@dis.edu</span>
                </div>
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-semibold mb-6">Academics</h4>
              <ul className="space-y-3">
                {footerLinks.academics.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-blue-200 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-semibold mb-6">Admissions</h4>
              <ul className="space-y-3">
                {footerLinks.admissions.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-blue-200 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-semibold mb-6">Campus Life</h4>
              <ul className="space-y-3">
                {footerLinks.campus.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-blue-200 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-semibold mb-6">Support</h4>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-blue-200 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Newsletter Signup */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
            className="mt-12 pt-8 border-t border-blue-800"
          >
            <div className="max-w-md">
              <h4 className="text-lg font-semibold mb-4">Stay Connected</h4>
              <p className="text-blue-200 mb-4">
                Get updates on admissions, events, and institute news.
              </p>
              <div className="flex space-x-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-800 border border-blue-700 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Footer */}
        <div className="py-8 border-t border-blue-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-blue-200 text-sm">
              © 2024 DaNi's Institute of Science. All rights reserved.
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center w-10 h-10 bg-blue-800 hover:bg-blue-700 rounded-full transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5 text-blue-200" />
                </motion.a>
              ))}
            </div>

            <div className="flex space-x-6 text-blue-200 text-sm">
              <Link
                to="/privacy"
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link
                to="/accessibility"
                className="hover:text-white transition-colors"
              >
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
