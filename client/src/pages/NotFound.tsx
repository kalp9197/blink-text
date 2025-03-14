import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiSearch, FiHome } from "react-icons/fi";

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <FiSearch size={64} className="text-primary-500 mx-auto" />
      </motion.div>

      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4"
      >
        404 - Page Not Found
      </motion.h1>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto"
      >
        Oops! The page you're looking for doesn't exist or has been moved.
      </motion.p>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <Link
          to="/"
          className="btn btn-primary flex items-center justify-center space-x-2"
        >
          <FiHome />
          <span>Go to Homepage</span>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
