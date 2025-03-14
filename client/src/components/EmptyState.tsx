import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiPlus } from "react-icons/fi";
import { useTheme } from "../utils/themeContext";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionText?: string;
  actionLink?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No items found",
  description = "Get started by creating your first item",
  icon,
  actionText = "Create New",
  actionLink = "/",
  onAction,
}) => {
  const { theme } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`
        w-full rounded-lg border border-dashed border-border
        ${theme === "dark" ? "bg-card/30" : "bg-card/50"}
        p-8 text-center flex flex-col items-center justify-center
        space-y-4
      `}
    >
      {icon || (
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          <FiPlus size={24} />
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {description}
        </p>
      </div>

      {onAction ? (
        <button
          onClick={onAction}
          className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          {actionText}
        </button>
      ) : (
        <Link
          to={actionLink}
          className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          {actionText}
        </Link>
      )}
    </motion.div>
  );
};

export default EmptyState;
