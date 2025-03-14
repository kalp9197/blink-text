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
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span
            className={`text-xs px-2 py-0.5 rounded-full flex items-center ${statusDetails.class}`}
          >
            {statusDetails.icon}
            {statusDetails.label}
          </span>

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

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onCopy(text.accessToken)}
            className="p-1 hover:bg-muted rounded-md transition-colors"
            title="Copy link"
          >
            <FiCopy size={16} />
          </button>

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 hover:bg-muted rounded-md transition-colors"
            title="Open in new tab"
          >
            <FiExternalLink size={16} />
          </a>

          <button
            onClick={() => onDelete(text._id)}
            className="p-1 hover:bg-muted rounded-md transition-colors text-destructive"
            title="Delete text"
          >
            <FiTrash size={16} />
          </button>
        </div>
      </div>

      <div className="px-4 py-3">
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

        <Link
          to={`/view/${text.accessToken}`}
          className="block w-full text-center py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          View Text
        </Link>
      </div>
    </motion.div>
  );
};

export default TextCard;
