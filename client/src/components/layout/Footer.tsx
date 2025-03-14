import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FiGithub, FiTwitter, FiLinkedin } from "react-icons/fi";

const Footer: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <footer className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">BlinkText</h3>
            <p className="text-sm text-muted-foreground">
              Secure text sharing made simple and efficient.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-medium mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className={`text-sm transition-colors ${
                    isActive("/")
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400"
                  }`}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className={`text-sm transition-colors ${
                    isActive("/about")
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400"
                  }`}
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/help"
                  className={`text-sm transition-colors ${
                    isActive("/help")
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400"
                  }`}
                >
                  Help
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="font-medium mb-4">Connect</h4>
            <div className="flex space-x-4">
              <a
                href="https://github.com/kalp9197"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <FiGithub className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com/kalp9197"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <FiTwitter className="h-5 w-5" />
              </a>
              <a
                href="https://www.linkedin.com/in/patel-kalp-93526425b/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <FiLinkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} BlinkText. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
