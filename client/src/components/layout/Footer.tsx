import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 py-6 border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
              BlinkText
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Share text securely with auto-expiry, password protection, and
              view limits.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/help"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  Help & Documentation
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center text-xs text-gray-500 dark:text-gray-500">
          <p>Made with ❤️ for secure text sharing</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
