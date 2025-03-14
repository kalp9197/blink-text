import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FiMoon, FiSun } from "react-icons/fi";
import { useAuth } from "../../utils/authContext";
import { useTheme } from "../../utils/themeContext";

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <nav className="flex items-center justify-between w-full">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xl font-bold">
              BlinkText
            </Link>
            <div className="hidden md:flex items-center gap-4">
              {user && (
                <Link
                  to="/dashboard"
                  className={`text-sm font-medium transition-colors ${
                    isActive("/dashboard")
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400"
                  }`}
                >
                  Dashboard
                </Link>
              )}
              <Link
                to="/about"
                className={`text-sm font-medium transition-colors ${
                  isActive("/about")
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400"
                }`}
              >
                About
              </Link>
              <Link
                to="/help"
                className={`text-sm font-medium transition-colors ${
                  isActive("/help")
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400"
                }`}
              >
                Help
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm font-medium text-violet-600 dark:text-violet-400">
                  {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 text-sm text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Logout
                </button>
                <button
                  onClick={toggleTheme}
                  className="p-2 hover:bg-muted rounded-md transition-colors"
                  title={`Switch to ${
                    theme === "dark" ? "light" : "dark"
                  } mode`}
                >
                  {theme === "dark" ? (
                    <FiSun className="h-5 w-5" />
                  ) : (
                    <FiMoon className="h-5 w-5" />
                  )}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className={`text-sm font-medium transition-colors ${
                    isActive("/login")
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400"
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Sign Up
                </Link>
                <button
                  onClick={toggleTheme}
                  className="p-2 hover:bg-muted rounded-md transition-colors"
                  title={`Switch to ${
                    theme === "dark" ? "light" : "dark"
                  } mode`}
                >
                  {theme === "dark" ? (
                    <FiSun className="h-5 w-5" />
                  ) : (
                    <FiMoon className="h-5 w-5" />
                  )}
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
