import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiLock, FiUnlock, FiEye, FiEyeOff } from "react-icons/fi";
import { useTheme } from "../utils/themeContext";

interface PasswordProtectionFormProps {
  onSubmit: (e: React.FormEvent) => void;
  password: string;
  setPassword: (value: string) => void;
  error?: string;
  isLoading?: boolean;
}

const PasswordProtectionForm: React.FC<PasswordProtectionFormProps> = ({
  onSubmit,
  password,
  setPassword,
  error,
  isLoading = false,
}) => {
  const { theme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`
        max-w-md mx-auto rounded-lg shadow-lg overflow-hidden
        ${theme === "dark" ? "bg-card/80" : "bg-card"}
        border border-border
      `}
    >
      <div className="p-6">
        <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-primary/10 text-primary">
          <FiLock size={28} />
        </div>

        <h2 className="text-xl font-semibold text-center mb-1">
          Password Protected
        </h2>

        <p className="text-sm text-center text-muted-foreground mb-6">
          This content is protected. Please enter the password to view it.
        </p>

        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className={`
                  w-full px-4 py-2 rounded-md border text-foreground
                  ${theme === "dark" ? "bg-background" : "bg-background"}
                  ${error ? "border-red-500" : "border-border"}
                  focus:outline-none focus:ring-2 focus:ring-primary/50
                `}
                disabled={isLoading}
                autoFocus
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                tabIndex={-1}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>

            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading || !password.trim()}
            className={`
              w-full px-4 py-2 rounded-md flex items-center justify-center
              transition-colors
              ${
                isLoading || !password.trim()
                  ? "bg-primary/70 cursor-not-allowed"
                  : "bg-primary hover:bg-primary/90"
              }
              text-primary-foreground
            `}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Unlocking...
              </span>
            ) : (
              <span className="flex items-center">
                <FiUnlock className="mr-2" />
                Unlock
              </span>
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default PasswordProtectionForm;
