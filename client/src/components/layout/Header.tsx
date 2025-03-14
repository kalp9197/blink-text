import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiLogOut,
  FiMoon,
  FiSun,
  FiUser,
  FiMenu,
  FiX,
  FiHelpCircle,
  FiInfo,
  FiSend,
} from "react-icons/fi";
import { useAuth } from "../../utils/authContext";
import { useTheme } from "../../utils/themeContext";

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-primary">
          BlinkText
        </Link>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-muted transition-colors"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/"
            className="px-4 py-2 font-medium text-primary hover:underline flex items-center"
          >
            <FiSend className="mr-2" />
            Send Text
          </Link>

          <Link
            to="/help"
            className="px-4 py-2 font-medium text-muted-foreground hover:text-foreground flex items-center"
          >
            <FiHelpCircle className="mr-2" />
            Help
          </Link>

          <Link
            to="/about"
            className="px-4 py-2 font-medium text-muted-foreground hover:text-foreground flex items-center"
          >
            <FiInfo className="mr-2" />
            About
          </Link>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>

          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="px-4 py-2 font-medium text-primary hover:underline items-center flex"
              >
                <FiUser className="mr-2" />
                Dashboard
              </Link>
              <div className="px-4 py-2 bg-primary text-primary-foreground rounded">
                {user?.name}
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                title="Logout"
              >
                <FiLogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 font-medium text-primary hover:underline"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile navigation menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border">
          <div className="container mx-auto px-4 py-3 flex flex-col space-y-3">
            <Link
              to="/"
              className="px-4 py-2 font-medium text-primary hover:underline flex items-center"
              onClick={() => setMenuOpen(false)}
            >
              <FiSend className="mr-2" />
              Send Text
            </Link>

            <Link
              to="/help"
              className="px-4 py-2 font-medium text-muted-foreground hover:text-foreground flex items-center"
              onClick={() => setMenuOpen(false)}
            >
              <FiHelpCircle className="mr-2" />
              Help
            </Link>

            <Link
              to="/about"
              className="px-4 py-2 font-medium text-muted-foreground hover:text-foreground flex items-center"
              onClick={() => setMenuOpen(false)}
            >
              <FiInfo className="mr-2" />
              About
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="px-4 py-2 font-medium text-primary hover:underline flex items-center"
                  onClick={() => setMenuOpen(false)}
                >
                  <FiUser className="mr-2" />
                  Dashboard
                </Link>
                <div className="flex justify-between items-center">
                  <div className="px-4 py-2 bg-primary text-primary-foreground rounded">
                    {user?.name}
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                    title="Logout"
                  >
                    <FiLogOut size={18} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col space-y-2">
                <Link
                  to="/login"
                  className="px-4 py-2 font-medium text-primary hover:underline"
                  onClick={() => setMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 text-center"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign up
                </Link>
              </div>
            )}

            <div className="flex justify-center">
              <button
                onClick={() => {
                  toggleTheme();
                  setMenuOpen(false);
                }}
                className="p-2 rounded-full hover:bg-muted transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <div className="flex items-center">
                    <FiSun size={18} className="mr-2" />
                    Light mode
                  </div>
                ) : (
                  <div className="flex items-center">
                    <FiMoon size={18} className="mr-2" />
                    Dark mode
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
