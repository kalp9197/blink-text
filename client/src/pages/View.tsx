import React, {
  useEffect,
  useState,
  lazy,
  Suspense,
  useMemo,
  useCallback,
} from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  FiCopy,
  FiEye,
  FiClock,
  FiExternalLink,
  FiAlertTriangle,
  FiCode,
} from "react-icons/fi";
import { textApi } from "../utils/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { useTheme } from "../utils/themeContext";
import { formatDistanceToNow } from "date-fns";
import { decryptText } from "../utils/encryption";

// Lazy load heavy components for better performance
const QRCode = lazy(() => import("react-qr-code"));
const SyntaxHighlighter = lazy(() => import("react-syntax-highlighter"));

// Loading fallback component
const LoadingFallback = () => (
  <div className="animate-pulse bg-muted/50 h-40 rounded-md flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
  </div>
);

interface TextData {
  id: string;
  content: string;
  expiresAt: string;
  viewCount: number;
  maxViews?: number;
  isProtected: boolean;
  isMarkdown?: boolean;
  remainingViews?: number | null;
  isExpiringSoon?: boolean;
  viewOnce?: boolean;
  isDeleted?: boolean;
  encryptionKey: string;
  expiryDate: string;
  language: string;
  status: string;
}

const View: React.FC = () => {
  const { accessToken } = useParams<{ accessToken: string }>();
  const { theme } = useTheme();

  const [text, setText] = useState<TextData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [showQrCode, setShowQrCode] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("plaintext");
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<string>("");
  const [syntaxHighlightTheme, setSyntaxHighlightTheme] = useState<any>(null);

  const currentUrl = window.location.href;
  const viewCountProcessed = React.useRef<boolean>(false);

  const topLanguages = useMemo(
    () => [
      { value: "plaintext", label: "Plain Text" },
      { value: "javascript", label: "JavaScript" },
      { value: "typescript", label: "TypeScript" },
      { value: "jsx", label: "JSX/React" },
      { value: "python", label: "Python" },
      { value: "json", label: "JSON" },
    ],
    []
  );

  const allLanguages = useMemo(
    () => [
      ...topLanguages,
      { value: "java", label: "Java" },
      { value: "cpp", label: "C++" },
      { value: "csharp", label: "C#" },
      { value: "php", label: "PHP" },
      { value: "ruby", label: "Ruby" },
      { value: "go", label: "Go" },
      { value: "rust", label: "Rust" },
      { value: "sql", label: "SQL" },
      { value: "yaml", label: "YAML" },
      { value: "bash", label: "Bash" },
      { value: "markdown", label: "Markdown" },
      { value: "html", label: "HTML" },
      { value: "css", label: "CSS" },
    ],
    [topLanguages]
  );

  const autoDetectLanguage = useCallback((content: string) => {
    if (!content || typeof content !== "string") return;

    if (
      content.includes("function") ||
      content.includes("const ") ||
      content.includes("let ") ||
      content.includes("var ") ||
      content.includes("=>")
    ) {
      if (
        content.includes("import React") ||
        content.includes("<div>") ||
        content.includes("<>")
      ) {
        setSelectedLanguage("jsx");
      } else if (
        content.includes(": ") ||
        content.includes("interface ") ||
        content.includes("<T>")
      ) {
        setSelectedLanguage("typescript");
      } else {
        setSelectedLanguage("javascript");
      }
      return;
    }

    if (
      content.includes("def ") ||
      (content.includes("import ") && !content.includes(";"))
    ) {
      setSelectedLanguage("python");
      return;
    }

    if (
      content.includes("<!DOCTYPE html>") ||
      (content.includes("<html>") && content.includes("<body>"))
    ) {
      setSelectedLanguage("html");
      return;
    }

    if (
      content.trim().startsWith("{") &&
      content.trim().endsWith("}") &&
      content.includes('":')
    ) {
      setSelectedLanguage("json");
      return;
    }
  }, []);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const styles = await import(
          "react-syntax-highlighter/dist/esm/styles/hljs"
        );
        setSyntaxHighlightTheme(
          theme === "dark" ? styles.atomOneDark : styles.atomOneLight
        );
      } catch (error) {
        console.error("Failed to load syntax highlighting theme:", error);
      }
    };

    loadTheme();
  }, [theme]);

  useEffect(() => {
    if (text?.expiresAt) {
      const updateExpiryTime = () => {
        const expiryDate = new Date(text.expiresAt);
        const now = new Date();

        if (expiryDate > now) {
          setTimeUntilExpiry(
            formatDistanceToNow(expiryDate, { addSuffix: true })
          );
        } else {
          setTimeUntilExpiry("Expired");
          clearInterval(interval);
        }
      };

      updateExpiryTime();
      const interval = setInterval(updateExpiryTime, 60000); // Update every minute

      return () => clearInterval(interval);
    }
  }, [text?.expiresAt]);

  useEffect(() => {
    const fetchText = async () => {
      if (!accessToken) {
        setError("Invalid access token");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await textApi.get(accessToken);
        const textData = response.data.data;

        // Decrypt the content
        const decryptedContent = decryptText(
          textData.content,
          textData.encryptionKey
        );

        // Update text state with all properties
        setText({
          ...textData,
          content: decryptedContent,
        });

        // Auto-detect code language
        if (decryptedContent) {
          autoDetectLanguage(decryptedContent);
        }

        // Track that we've processed this view
        if (!viewCountProcessed.current) {
          viewCountProcessed.current = true;
        }

        setLoading(false);
      } catch (error: any) {
        console.error("Error fetching text:", error);
        if (error.response?.status === 404) {
          setError("This text does not exist.");
        } else if (error.response?.status === 401) {
          setError("This text is password protected.");
        } else {
          setError("An error occurred. Please try again later.");
        }
        setLoading(false);
      }
    };

    fetchText();
  }, [accessToken, autoDetectLanguage]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentUrl).then(
      () => {
        setCopyStatus("copied");
        toast.success("Link copied to clipboard");

        setTimeout(() => {
          setCopyStatus("");
        }, 2000);
      },
      () => {
        toast.error("Failed to copy link");
      }
    );
  };

  const copyContent = () => {
    if (!text?.content) return;

    navigator.clipboard.writeText(text.content).then(
      () => {
        toast.success("Content copied to clipboard");
      },
      () => {
        toast.error("Failed to copy content");
      }
    );
  };

  const toggleQrCode = () => setShowQrCode(!showQrCode);
  const toggleLanguageSelector = () =>
    setShowLanguageSelector(!showLanguageSelector);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-card p-8 rounded-lg text-center">
          <h3 className="text-xl font-semibold mb-4 text-destructive">
            {error}
          </h3>
          <Link to="/" className="text-primary hover:underline">
            Return to home page
          </Link>
        </div>
      );
    }

    return (
      <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
        {/* Status Bar */}
        <div className="sticky top-0 z-10 px-4 py-3 bg-muted border-b border-border flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            {text?.isExpiringSoon && (
              <span className="flex items-center text-amber-600 dark:text-amber-400 text-sm font-medium">
                <FiAlertTriangle className="mr-1" />
                Expires soon
              </span>
            )}

            {text?.viewOnce && (
              <span className="flex items-center text-red-600 dark:text-red-400 text-sm font-medium">
                <FiEye className="mr-1" />
                View once
              </span>
            )}

            <span className="text-sm text-muted-foreground">
              <FiClock className="inline mr-1" />
              {timeUntilExpiry}
            </span>

            {text?.remainingViews !== null &&
              text?.remainingViews !== undefined && (
                <span className="text-sm text-muted-foreground">
                  <FiEye className="inline mr-1" />
                  {text.remainingViews}{" "}
                  {text.remainingViews === 1 ? "view" : "views"} remaining
                </span>
              )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyContent}
              className="p-2 bg-muted-foreground/10 hover:bg-muted-foreground/20 rounded-md text-sm flex items-center"
              title="Copy content"
            >
              <FiCopy size={14} className="mr-1" />
              Copy
            </button>

            <button
              onClick={toggleQrCode}
              className="p-2 bg-muted-foreground/10 hover:bg-muted-foreground/20 rounded-md text-sm flex items-center"
              title="Show QR code"
            >
              <FiExternalLink size={14} className="mr-1" />
              QR
            </button>

            {!text?.isMarkdown && (
              <button
                onClick={toggleLanguageSelector}
                className="p-2 bg-muted-foreground/10 hover:bg-muted-foreground/20 rounded-md text-sm flex items-center"
                title="Change syntax highlighting"
              >
                <FiCode size={14} className="mr-1" />
                {selectedLanguage === "plaintext" ? "Code" : selectedLanguage}
              </button>
            )}
          </div>
        </div>

        {/* QR Code */}
        {showQrCode && (
          <div className="flex justify-center p-4 bg-muted/50 border-b border-border">
            <div className="text-center">
              <Suspense fallback={<LoadingFallback />}>
                <QRCode
                  value={currentUrl}
                  size={150}
                  className="mx-auto bg-white p-2 rounded"
                />
              </Suspense>
              <p className="mt-2 text-sm text-muted-foreground">
                Scan to view on another device
              </p>
            </div>
          </div>
        )}

        {/* Language Selector */}
        {showLanguageSelector && !text?.isMarkdown && (
          <div className="p-3 bg-muted/50 border-b border-border">
            <div className="flex flex-wrap gap-2 mb-2">
              {topLanguages.map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => setSelectedLanguage(lang.value)}
                  className={`px-2 py-1 text-xs rounded-md ${
                    selectedLanguage === lang.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted-foreground/10 hover:bg-muted-foreground/20"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            <details className="text-xs text-muted-foreground">
              <summary className="cursor-pointer hover:text-foreground">
                More languages...
              </summary>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 p-2 mt-2 border-t border-border">
                {allLanguages
                  .filter(
                    (lang) =>
                      !topLanguages.some(
                        (topLang) => topLang.value === lang.value
                      )
                  )
                  .map((lang) => (
                    <button
                      key={lang.value}
                      onClick={() => setSelectedLanguage(lang.value)}
                      className={`px-2 py-1 text-xs rounded-md ${
                        selectedLanguage === lang.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted-foreground/10 hover:bg-muted-foreground/20"
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
              </div>
            </details>
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          {text?.isMarkdown ? (
            <div className="prose dark:prose-invert max-w-none prose-pre:bg-muted prose-pre:text-muted-foreground">
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                {text?.content || ""}
              </ReactMarkdown>
            </div>
          ) : selectedLanguage !== "plaintext" ? (
            <Suspense fallback={<LoadingFallback />}>
              {syntaxHighlightTheme && (
                <SyntaxHighlighter
                  language={selectedLanguage}
                  style={syntaxHighlightTheme}
                  customStyle={{ fontSize: "0.9rem", borderRadius: "0.25rem" }}
                  wrapLongLines={true}
                >
                  {text?.content || ""}
                </SyntaxHighlighter>
              )}
            </Suspense>
          ) : (
            <pre className="whitespace-pre-wrap break-words text-foreground p-4 bg-muted rounded">
              {text?.content}
            </pre>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <p className="text-sm text-muted-foreground">
              {text?.viewOnce ? (
                <span className="text-red-600 dark:text-red-400 font-medium">
                  This text has now been deleted and cannot be viewed again.
                </span>
              ) : (
                "This secure text may only be viewed until it expires or reaches its view limit."
              )}
            </p>
            <div className="flex items-center">
              <button
                onClick={copyToClipboard}
                className="px-3 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center"
              >
                <FiCopy className="mr-1" size={14} />
                {copyStatus === "copied" ? "Copied!" : "Copy link"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">Secure Text</h2>
          {renderContent()}
        </motion.div>
      </main>
    </div>
  );
};

export default View;
