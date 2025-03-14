import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiEye,
  FiTrash,
  FiLock,
  FiClock,
  FiExternalLink,
  FiCopy,
  FiAlertTriangle,
  FiCheckCircle,
  FiCode,
} from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";
import { truncate } from "../utils/stringUtils";
import { useTheme } from "../utils/themeContext";

interface TextCardProps {
  text: {
    _id: string;
    accessToken: string;
    isProtected: boolean;
    viewCount: number;
    maxViews?: number;
    viewOnce: boolean;
    expiresAt: string;
    createdAt: string;
    isMarkdown?: boolean;
    status?: string;
    remainingViews?: number | null;
  };
  onDelete: (id: string) => void;
  onCopy: (accessToken: string) => void;
  deleteConfirm: string | null;
  formatDate: (dateString: string) => string;
  calculateViewProgress: (current: number, max?: number) => number;
}

const TextCard: React.FC<TextCardProps> = ({
  text,
  onDelete,
  onCopy,
  deleteConfirm,
  formatDate,
  calculateViewProgress,
}) => {
  const { theme } = useTheme();

  // Get status UI elements
  const getStatusDetails = (status?: string) => {
    switch (status) {
      case "active":
        return {
          icon: <FiCheckCircle className="mr-1" />,
          label: "Active",
          class:
            theme === "dark"
              ? "bg-green-900 text-green-100"
              : "bg-green-100 text-green-800",
        };
      case "expiring-soon":
        return {
          icon: <FiAlertTriangle className="mr-1" />,
          label: "Expiring Soon",
          class:
            theme === "dark"
              ? "bg-amber-900 text-amber-100"
              : "bg-amber-100 text-amber-800",
        };
      case "expired":
        return {
          icon: <FiClock className="mr-1" />,
          label: "Expired",
          class:
            theme === "dark"
              ? "bg-red-900 text-red-100"
              : "bg-red-100 text-red-800",
        };
      case "max-views-reached":
        return {
          icon: <FiEye className="mr-1" />,
          label: "Max Views Reached",
          class:
            theme === "dark"
              ? "bg-blue-900 text-blue-100"
              : "bg-blue-100 text-blue-800",
        };
      default:
        return {
          icon: <FiCheckCircle className="mr-1" />,
          label: "Active",
          class:
            theme === "dark"
              ? "bg-green-900 text-green-100"
              : "bg-green-100 text-green-800",
        };
    }
  };

  const statusDetails = getStatusDetails(text.status);
  const url = `${window.location.origin}/view/${text.accessToken}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`border border-border rounded-lg overflow-hidden 
        ${theme === "dark" ? "bg-card/30" : "bg-card"} 
        hover:shadow-md transition duration-200`}
    >
      {/* Card Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span
            className={`text-xs px-2 py-0.5 rounded-full flex items-center ${statusDetails.class}`}
          >
            {statusDetails.icon}
            {statusDetails.label}
          </span>

          {/* Additional indicators */}
          {text.isProtected && (
            <span className="text-xs flex items-center text-muted-foreground">
              <FiLock className="mr-1" size={12} />
              Protected
            </span>
          )}

          {text.isMarkdown && (
            <span className="text-xs flex items-center text-muted-foreground">
              <FiCode className="mr-1" size={12} />
              Markdown
            </span>
          )}

          {text.viewOnce && (
            <span className="text-xs flex items-center text-muted-foreground">
              <FiEye className="mr-1" size={12} />
              View Once
            </span>
          )}
        </div>

        <div className="flex space-x-1">
          <button
            onClick={() => onCopy(text.accessToken)}
            className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors"
            title="Copy link"
          >
            <FiCopy size={16} />
          </button>

          <button
            onClick={() => onDelete(text._id)}
            className={`
              rounded p-1 transition-colors
              ${
                deleteConfirm === text._id
                  ? "text-red-500 hover:text-red-600"
                  : "text-muted-foreground hover:text-foreground"
              }
            `}
            title={
              deleteConfirm === text._id
                ? "Click again to confirm"
                : "Delete text"
            }
          >
            <FiTrash size={16} />
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="px-4 py-3">
        {/* View Info & Progress Bar */}
        {text.maxViews && (
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span>
                <FiEye className="inline mr-1" />
                {text.viewCount} / {text.maxViews} views
              </span>

              {text.remainingViews !== undefined &&
                text.remainingViews !== null && (
                  <span>{text.remainingViews} remaining</span>
                )}
            </div>

            <div className="h-1.5 w-full bg-muted rounded overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{
                  width: `${calculateViewProgress(
                    text.viewCount,
                    text.maxViews
                  )}%`,
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Time Info */}
        <div className="flex justify-between text-xs text-muted-foreground mb-3">
          <span title={new Date(text.createdAt).toLocaleString()}>
            Created: {formatDate(text.createdAt)}
          </span>

          {text.expiresAt && (
            <span title={new Date(text.expiresAt).toLocaleString()}>
              <FiClock className="inline mr-1" />
              {text.status === "expired" ? "Expired: " : "Expires: "}
              {formatDistanceToNow(new Date(text.expiresAt), {
                addSuffix: true,
              })}
            </span>
          )}
        </div>

        {/* Link to View */}
        <div className="grid grid-cols-1 gap-2">
          <Link
            to={`/view/${text.accessToken}`}
            className="w-full px-3 py-2 text-sm text-center rounded-md transition-colors bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center"
            target="_blank"
          >
            <FiExternalLink className="mr-2" />
            Open Text
          </Link>

          <div className="text-xs text-muted-foreground truncate">
            <span className="font-semibold">Link:</span> {truncate(url, 40)}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TextCard;
