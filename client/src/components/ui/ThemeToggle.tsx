import React from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import { motion } from "framer-motion";
import { useTheme } from "../../utils/themeContext";

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
      aria-label={
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      }
    >
      {theme === "dark" ? (
        <FiSun className="h-5 w-5 text-yellow-400" />
      ) : (
        <FiMoon className="h-5 w-5 text-gray-700" />
      )}
    </motion.button>
  );
};

export default ThemeToggle;
