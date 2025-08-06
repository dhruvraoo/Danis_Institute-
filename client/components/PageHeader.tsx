import { motion } from "framer-motion";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
}

export default function PageHeader({
  title,
  subtitle,
  description,
}: PageHeaderProps) {
  // Function to style the second letter
  const styleTitle = (text: string) => {
    if (text.length < 2) return text;

    const firstChar = text[0];
    const secondChar = text[1];
    const restOfText = text.slice(2);

    return (
      <>
        {firstChar}
        <span className="text-blue-600 dark:text-blue-400">{secondChar}</span>
        {restOfText}
      </>
    );
  };

  return (
    <section className="py-20 md:py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            {styleTitle(title)}
          </h1>

          {subtitle && (
            <h2 className="text-xl md:text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-4">
              {subtitle}
            </h2>
          )}

          {description && (
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {description}
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
