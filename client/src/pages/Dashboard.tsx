import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  FiPlus,
  FiEye,
  FiTrash,
  FiLock,
  FiClock,
  FiExternalLink,
  FiCopy,
  FiFilter,
  FiRefreshCw,
  FiAlertTriangle,
  FiCheckCircle,
  FiCode,
} from "react-icons/fi";
import { useTheme } from "../utils/themeContext";
import { textApi } from "../utils/api";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { formatDistanceToNow } from "date-fns";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { capitalizeFirst } from "../utils/stringUtils";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import TextCard from "../components/TextCard";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import EmptyState from "../components/EmptyState";

interface Text {
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
}

const Dashboard: React.FC = () => {
  const { theme } = useTheme();

  // Data state
  const [texts, setTexts] = useState<Text[]>([]);
  const [filteredTexts, setFilteredTexts] = useState<Text[]>([]);
  // These values are used for pagination information but not directly rendered
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [totalTextsCount, setTotalTextsCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [totalPagesCount, setTotalPagesCount] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Cache state to reduce unnecessary API calls
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const CACHE_EXPIRY_MINUTES = 5; // Consider cache valid for 5 minutes

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Filter definitions - wrapped in useMemo to avoid dependency issues
  const filterOptions = useMemo(
    () => [
      { id: "all", label: "All", icon: <FiFilter /> },
      { id: "active", label: "Active", icon: <FiCheckCircle /> },
      {
        id: "expiring-soon",
        label: "Expiring Soon",
        icon: <FiAlertTriangle />,
      },
      { id: "expired", label: "Expired", icon: <FiClock /> },
      { id: "protected", label: "Password Protected", icon: <FiLock /> },
      { id: "view-once", label: "View Once", icon: <FiEye /> },
      { id: "markdown", label: "Markdown", icon: <FiCode /> },
    ],
    []
  ); // No dependencies since these are static

  // Fetch texts with pagination
  const fetchTexts = useCallback(
    async (page: number = currentPage, forceRefresh: boolean = false) => {
      if (!forceRefresh && lastRefreshed) {
        const now = new Date();
        const cacheAge =
          (now.getTime() - lastRefreshed.getTime()) / (1000 * 60);

        // Skip if cache is still valid
        if (cacheAge <= CACHE_EXPIRY_MINUTES) {
          console.log("Using cached data");
          return;
        }
      }

      try {
        setIsLoading(true);
        const response = await textApi.getUserTexts(page);

        const newTexts = response.data.data;
        if (page === 1) {
          // Reset for page 1
          setTexts(newTexts);
        } else {
          // Append for pagination
          setTexts((prev) => [...prev, ...newTexts]);
        }

        setTotalTextsCount(response.data.total);
        setTotalPagesCount(response.data.pages);
        setCurrentPage(page);
        setHasMore(page < response.data.pages);
        setLastRefreshed(new Date());
      } catch (error) {
        console.error("Error fetching texts:", error);
        toast.error("Failed to load your texts");
      } finally {
        setIsLoading(false);
      }
    },
    [currentPage, lastRefreshed, CACHE_EXPIRY_MINUTES]
  );

  // Initial data fetch - with cache implementation
  useEffect(() => {
    const shouldFetchData = () => {
      // Always fetch if no data or cache expired
      if (texts.length === 0 || !lastRefreshed) return true;

      // Check if cache is expired (older than CACHE_EXPIRY_MINUTES)
      const now = new Date();
      const cacheAge = (now.getTime() - lastRefreshed.getTime()) / (1000 * 60);
      return cacheAge > CACHE_EXPIRY_MINUTES;
    };

    if (shouldFetchData()) {
      fetchTexts(1); // Load first page on initial load
    }
  }, [fetchTexts, lastRefreshed, texts.length, CACHE_EXPIRY_MINUTES]);

  // Text filtering logic - Memoize the filter function
  const applyFilters = useCallback(() => {
    let result = [...texts];

    // Apply selected filter
    switch (filter) {
      case "active":
        result = result.filter((text) => text.status === "active");
        break;
      case "expiring-soon":
        result = result.filter((text) => text.status === "expiring-soon");
        break;
      case "expired":
        result = result.filter((text) => text.status === "expired");
        break;
      case "protected":
        result = result.filter((text) => text.isProtected);
        break;
      case "view-once":
        result = result.filter((text) => text.viewOnce);
        break;
      case "markdown":
        result = result.filter((text) => text.isMarkdown);
        break;
      default:
        // "all" - no filtering
        break;
    }

    setFilteredTexts(result);
  }, [texts, filter]);

  // Memoize the filter options
  const filterOptionsWithCount = useMemo(() => {
    // Get counts for each filter category
    const counts = {
      all: texts.length,
      active: texts.filter((t) => t.status === "active").length,
      "expiring-soon": texts.filter((t) => t.status === "expiring-soon").length,
      expired: texts.filter((t) => t.status === "expired").length,
      protected: texts.filter((t) => t.isProtected).length,
      "view-once": texts.filter((t) => t.viewOnce).length,
      markdown: texts.filter((t) => t.isMarkdown).length,
    };

    // Update filter options with counts
    return filterOptions.map((option) => ({
      ...option,
      count: counts[option.id as keyof typeof counts] || 0,
    }));
  }, [texts, filterOptions]);

  // Apply filters whenever texts or filter changes
  useEffect(() => {
    applyFilters();
  }, [texts, filter, applyFilters]);

  // Load more texts
  const loadMoreTexts = useCallback(() => {
    if (hasMore && !isLoading) {
      fetchTexts(currentPage + 1);
    }
  }, [hasMore, isLoading, currentPage, fetchTexts]);

  // Refresh text list
  const refreshTexts = useCallback(async () => {
    setIsRefreshing(true);
    await fetchTexts(1, true); // Refresh from page 1 with force refresh
    setIsRefreshing(false);
    toast.success("Texts refreshed");
  }, [fetchTexts]);

  // Handle text deletion
  const handleDelete = async (id: string) => {
    try {
      if (deleteConfirm === id) {
        await textApi.deleteText(id);
        setTexts(texts.filter((text) => text._id !== id));
        setDeleteConfirm(null);
        toast.success("Text deleted successfully");
      } else {
        setDeleteConfirm(id);
        // Reset confirmation after 3 seconds
        setTimeout(() => setDeleteConfirm(null), 3000);
      }
    } catch (error) {
      console.error("Error deleting text:", error);
      toast.error("Failed to delete text");
      setDeleteConfirm(null);
    }
  };

  // Copy sharing link to clipboard
  const copyToClipboard = (accessToken: string) => {
    const url = `${window.location.origin}/view/${accessToken}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  // Get text status UI elements
  const getStatusDetails = (text: Text) => {
    switch (text.status) {
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

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate percentage of views used
  const calculateViewProgress = (current: number, max?: number) => {
    if (!max) return 0;
    return Math.min(100, Math.floor((current / max) * 100));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-4 py-8">
        {/* Page Header - This is content, not navigation */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-semibold">Your Secure Texts</h2>
            <p className="text-sm text-muted-foreground">
              {texts.length > 0
                ? `${texts.length} texts in your library`
                : "No texts yet"}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Link
              to="/"
              className="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm flex items-center"
            >
              <FiPlus className="mr-2" />
              Create New
            </Link>

            <button
              onClick={refreshTexts}
              disabled={isRefreshing}
              className="px-3 py-2 bg-card text-muted-foreground border border-border rounded-md hover:bg-muted/50 text-sm flex items-center"
            >
              <FiRefreshCw
                className={`mr-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 rounded-md text-sm flex items-center ${
                showFilters
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground border border-border hover:bg-muted/50"
              }`}
            >
              <FiFilter className="mr-2" />
              Filter
              {filter !== "all" && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary-foreground text-primary rounded-full">
                  {filter}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-6"
          >
            <div className="bg-card p-4 rounded-lg border border-border">
              <div className="flex flex-wrap gap-2">
                {filterOptionsWithCount.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setFilter(option.id)}
                    className={`px-3 py-2 rounded-md text-sm flex items-center justify-center ${
                      filter === option.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    {React.cloneElement(option.icon as React.ReactElement, {
                      className: "mr-2",
                    })}
                    {option.label}
                    {option.count > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary-foreground text-primary rounded-full">
                        {option.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">
              Loading your secure texts...
            </p>
          </div>
        ) : filteredTexts.length === 0 ? (
          <div className="bg-card rounded-lg p-8 text-center border border-border">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-primary/10 text-primary rounded-full">
                <FiFilter size={28} />
              </div>
            </div>
            <h3 className="text-lg font-medium mb-2">No secure texts found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {filter !== "all"
                ? `No texts match the "${filter}" filter. Try a different filter or create a new text.`
                : "Create your first secure text to get started with password protection, expiry times, and more."}
            </p>
            <Link
              to="/"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 inline-flex items-center"
            >
              <FiPlus className="mr-2" />
              Create Text
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredTexts.map((text, index) => {
              const statusDetails = getStatusDetails(text);
              const isExpired =
                text.status === "expired" ||
                text.status === "max-views-reached";
              const viewProgress = calculateViewProgress(
                text.viewCount,
                text.maxViews
              );

              return (
                <motion.div
                  key={text._id}
                  className={`bg-card rounded-lg overflow-hidden shadow-sm border ${
                    isExpired
                      ? "border-muted-foreground/20 opacity-75"
                      : "border-border"
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <div className="p-4 border-b border-border flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-base font-medium flex items-center">
                          Text #{index + 1}
                        </h3>

                        <span
                          className={`px-2 py-1 text-xs rounded-full flex items-center ${statusDetails.class}`}
                        >
                          {statusDetails.icon}
                          {statusDetails.label}
                        </span>

                        {text.isProtected && (
                          <span className="px-2 py-1 bg-violet-100 dark:bg-violet-900 text-violet-800 dark:text-violet-100 text-xs rounded-full flex items-center">
                            <FiLock className="mr-1" />
                            Protected
                          </span>
                        )}

                        {text.viewOnce && (
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-xs rounded-full flex items-center">
                            <FiEye className="mr-1" />
                            View Once
                          </span>
                        )}

                        {text.isMarkdown && (
                          <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-100 text-xs rounded-full flex items-center">
                            <FiCode className="mr-1" />
                            Markdown
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground truncate max-w-md">
                        <span className="text-primary font-mono">
                          {text.accessToken.substring(0, 8)}
                        </span>
                        ...
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/view/${text.accessToken}`}
                        target="_blank"
                        className="w-8 h-8 flex items-center justify-center bg-muted text-muted-foreground rounded-md hover:bg-muted/90 transition-colors"
                        title="View text"
                      >
                        <FiExternalLink size={16} />
                      </Link>

                      <button
                        onClick={() => copyToClipboard(text.accessToken)}
                        className="w-8 h-8 flex items-center justify-center bg-muted text-muted-foreground rounded-md hover:bg-muted/90 transition-colors"
                        title="Copy link"
                      >
                        <FiCopy size={16} />
                      </button>

                      <button
                        onClick={() => handleDelete(text._id)}
                        className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors ${
                          deleteConfirm === text._id
                            ? "bg-destructive text-destructive-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/90"
                        }`}
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

                  <div className="p-3 bg-muted/30 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <FiClock className="mr-1" />
                      <span>Created: {formatDate(text.createdAt)}</span>
                    </div>

                    <div
                      className={`flex items-center ${
                        isExpired ? "text-red-500 dark:text-red-400" : ""
                      }`}
                    >
                      <FiClock className="mr-1" />
                      <span>Expires: {formatDate(text.expiresAt)}</span>
                    </div>

                    <div className="flex items-center">
                      <FiEye className="mr-1" />
                      <span>
                        Views: {text.viewCount}
                        {text.maxViews ? `/${text.maxViews}` : ""}
                      </span>
                    </div>

                    {text.maxViews && (
                      <div className="flex flex-col">
                        <div className="flex justify-between text-xs mb-1">
                          <span>{text.viewCount} views</span>
                          <span>{text.maxViews} max</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5">
                          <div
                            className="bg-primary h-1.5 rounded-full"
                            style={{ width: `${viewProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {/* Load More Button - Only show if there are more texts to load */}
            {hasMore && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={loadMoreTexts}
                  disabled={isLoading}
                  className="px-4 py-2 bg-card text-muted-foreground border border-border rounded-md hover:bg-muted/50 text-sm flex items-center"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                      Loading...
                    </>
                  ) : (
                    <>Load More</>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="container mx-auto px-4 py-6 mt-12 border-t border-border text-center text-xs text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} BlinkText. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Dashboard;
