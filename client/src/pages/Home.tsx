import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiClock,
  FiEye,
  FiLock,
  FiInfo,
  FiCode,
  FiCheckCircle,
  FiCopy,
  FiShield,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { textApi } from "../utils/api";
import { useAuth } from "../utils/authContext";
import { encryptText, generateEncryptionKey } from "../utils/encryption";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Form state
  const [content, setContent] = useState("");
  const [expirationOption, setExpirationOption] = useState("1hour");
  const [expirationMinutes, setExpirationMinutes] = useState(60);
  const [customExpiryDate, setCustomExpiryDate] = useState<Date | null>(null);
  const [viewOnce, setViewOnce] = useState(false);
  const [isProtected, setIsProtected] = useState(false);
  const [password, setPassword] = useState("");
  const [maxViews, setMaxViews] = useState<number | undefined>(undefined);
  const [useMarkdown, setUseMarkdown] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  // Date constraints
  const minDate = new Date();
  minDate.setMinutes(minDate.getMinutes() + 5);

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);

  const handleExpirationOptionChange = (option: string) => {
    setExpirationOption(option);

    switch (option) {
      case "5min":
        setExpirationMinutes(5);
        setCustomExpiryDate(null);
        break;
      case "1hour":
        setExpirationMinutes(60);
        setCustomExpiryDate(null);
        break;
      case "1day":
        setExpirationMinutes(1440);
        setCustomExpiryDate(null);
        break;
      case "1week":
        setExpirationMinutes(10080);
        setCustomExpiryDate(null);
        break;
      case "custom":
        // Keep existing expiration minutes until custom date is selected
        break;
      default:
        setExpirationMinutes(60);
        setCustomExpiryDate(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content) {
      toast.error("Please enter some text to share");
      return;
    }

    if (content.length > 100000) {
      toast.error("Text exceeds maximum length of 100,000 characters");
      return;
    }

    if (isProtected && !password) {
      toast.error("Please enter a password for your protected text");
      return;
    }

    if (isProtected && password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      setIsLoading(true);

      // Generate encryption key
      const encryptionKey = generateEncryptionKey();

      // Encrypt the content
      const encryptedContent = encryptText(content, encryptionKey);

      // Determine if content should be treated as markdown
      const detectMarkdown = useMarkdown || /[*#`>-]/.test(content);

      // Create text data object with encrypted content
      const textData = {
        content: encryptedContent,
        encryptionKey,
        expirationMinutes,
        viewOnce,
        isProtected,
        password: isProtected ? password : undefined,
        maxViews: maxViews !== undefined ? maxViews : undefined,
        customExpiryDate: customExpiryDate
          ? customExpiryDate.toISOString()
          : undefined,
        isMarkdown: detectMarkdown,
      };

      // Create text without authentication
      const response = await textApi.create(textData);

      const accessToken = response.data.data.accessToken;
      const shareUrl =
        response.data.data.shareUrl ||
        `${window.location.origin}/view/${accessToken}`;

      setGeneratedLink(shareUrl);
      toast.success("Text created successfully!");

      // Navigate to view page
      navigate(`/view/${accessToken}?new=true`);
    } catch (error: any) {
      console.error("Error creating text:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to create text. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedLink) return;

    navigator.clipboard.writeText(generatedLink).then(
      () => {
        toast.success("Link copied to clipboard!");
      },
      () => {
        toast.error("Failed to copy link");
      }
    );
  };

  const createNewText = () => {
    setContent("");
    setExpirationOption("1hour");
    setExpirationMinutes(60);
    setCustomExpiryDate(null);
    setViewOnce(false);
    setIsProtected(false);
    setPassword("");
    setMaxViews(undefined);
    setUseMarkdown(false);
    setShowAdvancedOptions(false);
    setGeneratedLink(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-4 py-8">
        {!generatedLink ? (
          <>
            {/* Intro Section */}
            <section className="max-w-3xl mx-auto text-center mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Secure Text Sharing Made Simple
                </h2>
                <p className="text-lg text-muted-foreground">
                  Share sensitive text securely with password protection,
                  expiration times, and view limits.
                </p>
              </motion.div>
            </section>

            {/* Create Text Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
                <form onSubmit={handleSubmit}>
                  {/* Textarea Section */}
                  <div className="mb-6">
                    <label
                      htmlFor="content"
                      className="block text-sm font-medium mb-2"
                    >
                      Text to share securely
                    </label>
                    <textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full h-40 px-3 py-2 bg-background text-foreground border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter your message here..."
                      required
                    ></textarea>

                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                      <span>{content.length} / 100,000 characters</span>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="useMarkdown"
                          checked={useMarkdown}
                          onChange={(e) => setUseMarkdown(e.target.checked)}
                          className="mr-2"
                        />
                        <label
                          htmlFor="useMarkdown"
                          className="flex items-center"
                        >
                          <FiCode className="mr-1" />
                          Format as Markdown
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Options Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Expiration Options */}
                    <div className="space-y-2 p-4 bg-muted/20 rounded-md">
                      <h3 className="font-medium flex items-center mb-3">
                        <FiClock className="mr-2" />
                        Expiration
                      </h3>

                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <button
                          type="button"
                          onClick={() => handleExpirationOptionChange("5min")}
                          className={`px-2 py-1 text-sm rounded-md border ${
                            expirationOption === "5min"
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-card border-input"
                          }`}
                        >
                          5 minutes
                        </button>
                        <button
                          type="button"
                          onClick={() => handleExpirationOptionChange("1hour")}
                          className={`px-2 py-1 text-sm rounded-md border ${
                            expirationOption === "1hour"
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-card border-input"
                          }`}
                        >
                          1 hour
                        </button>
                        <button
                          type="button"
                          onClick={() => handleExpirationOptionChange("1day")}
                          className={`px-2 py-1 text-sm rounded-md border ${
                            expirationOption === "1day"
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-card border-input"
                          }`}
                        >
                          1 day
                        </button>
                        <button
                          type="button"
                          onClick={() => handleExpirationOptionChange("1week")}
                          className={`px-2 py-1 text-sm rounded-md border ${
                            expirationOption === "1week"
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-card border-input"
                          }`}
                        >
                          1 week
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleExpirationOptionChange("custom")}
                        className={`w-full px-2 py-1 text-sm rounded-md border ${
                          expirationOption === "custom"
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card border-input"
                        }`}
                      >
                        Custom date/time
                      </button>

                      {expirationOption === "custom" && (
                        <div className="mt-2">
                          <DatePicker
                            selected={customExpiryDate}
                            onChange={(date: Date) => setCustomExpiryDate(date)}
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={15}
                            timeCaption="time"
                            dateFormat="MMM d, yyyy h:mm aa"
                            minDate={minDate}
                            maxDate={maxDate}
                            placeholderText="Select expiry date and time"
                            className="w-full px-3 py-2 bg-background text-foreground border border-input rounded-md"
                          />
                        </div>
                      )}
                    </div>

                    {/* Security Options */}
                    <div className="space-y-3 p-4 bg-muted/20 rounded-md">
                      <h3 className="font-medium flex items-center mb-3">
                        <FiLock className="mr-2" />
                        Security
                      </h3>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="viewOnce"
                          checked={viewOnce}
                          onChange={(e) => setViewOnce(e.target.checked)}
                          className="mr-2"
                        />
                        <label htmlFor="viewOnce" className="flex items-center">
                          <FiEye className="mr-1" />
                          Delete after first view
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isProtected"
                          checked={isProtected}
                          onChange={(e) => setIsProtected(e.target.checked)}
                          className="mr-2"
                        />
                        <label
                          htmlFor="isProtected"
                          className="flex items-center"
                        >
                          <FiLock className="mr-1" />
                          Password protection
                        </label>
                      </div>

                      {isProtected && (
                        <div className="ml-6">
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 bg-background text-foreground border border-input rounded-md"
                            placeholder="Enter password"
                            required={isProtected}
                            minLength={6}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Minimum 6 characters
                          </p>
                        </div>
                      )}

                      <div>
                        <button
                          type="button"
                          onClick={() =>
                            setShowAdvancedOptions(!showAdvancedOptions)
                          }
                          className="text-sm text-primary hover:underline flex items-center mt-2"
                        >
                          <FiInfo className="mr-1" />
                          {showAdvancedOptions ? "Hide" : "Show"} advanced
                          options
                        </button>

                        {showAdvancedOptions && (
                          <div className="mt-2">
                            <label
                              htmlFor="maxViews"
                              className="block text-sm font-medium mb-1 flex items-center"
                            >
                              <FiEye className="mr-1" />
                              Maximum views
                            </label>
                            <input
                              type="number"
                              id="maxViews"
                              value={maxViews || ""}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                setMaxViews(
                                  isNaN(val) || val <= 0 ? undefined : val
                                );
                              }}
                              min="1"
                              className="w-full px-3 py-2 bg-background text-foreground border border-input rounded-md"
                              placeholder="Unlimited"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Leave empty for unlimited views
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center"
                    >
                      {isLoading ? (
                        <>
                          <span className="mr-2">Creating...</span>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        </>
                      ) : (
                        "Create Secure Text"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>

            {/* Feature Cards */}
            <section className="py-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="p-5 bg-card rounded-lg shadow-sm border border-border flex flex-col items-center text-center">
                <div className="p-3 bg-primary/10 text-primary rounded-full mb-3">
                  <FiShield size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  End-to-End Encryption
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your text is encrypted before transmission and only decrypted
                  when viewed.
                </p>
              </div>

              <div className="p-5 bg-card rounded-lg shadow-sm border border-border flex flex-col items-center text-center">
                <div className="p-3 bg-primary/10 text-primary rounded-full mb-3">
                  <FiLock size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Password Protection
                </h3>
                <p className="text-sm text-muted-foreground">
                  Only those with the password can access your content.
                </p>
              </div>

              <div className="p-5 bg-card rounded-lg shadow-sm border border-border flex flex-col items-center text-center">
                <div className="p-3 bg-primary/10 text-primary rounded-full mb-3">
                  <FiClock size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-2">Auto-Expiration</h3>
                <p className="text-sm text-muted-foreground">
                  Content is automatically deleted after it expires.
                </p>
              </div>
            </section>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="max-w-2xl mx-auto bg-card p-8 rounded-lg shadow-sm border border-border"
          >
            <div className="flex items-center justify-center mb-4 text-primary">
              <FiCheckCircle size={48} />
            </div>
            <h2 className="text-2xl font-bold text-center mb-6">
              Your Secure Text Has Been Created!
            </h2>

            <div className="mb-6">
              <p className="text-center mb-4">
                Share this secure link with the recipient:
              </p>
              <div className="flex items-center p-4 bg-muted rounded-md break-all">
                <span className="text-sm font-medium flex-1 mr-2">
                  {generatedLink}
                </span>
                <button
                  onClick={copyToClipboard}
                  className="p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex-shrink-0"
                  title="Copy to clipboard"
                >
                  <FiCopy size={16} />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                This link will only work until it expires or reaches maximum
                views.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={createNewText}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Create Another Text
              </button>

              {isAuthenticated && (
                <Link
                  to="/dashboard"
                  className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/90 text-center"
                >
                  Go to Dashboard
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </main>

      <footer className="container mx-auto px-4 py-6 mt-8 border-t border-border">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-muted-foreground">
            {/* Footer content removed as per client request */}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
