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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { generateEncryptionKey, encryptText } from "../utils/encryption";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Form state
  const [content, setContent] = useState("");
  const [expiryTime, setExpiryTime] = useState("1hour");
  const [maxViews, setMaxViews] = useState<number | null>(null);
  const [viewOnce, setViewOnce] = useState(false);
  const [isProtected, setIsProtected] = useState(false);
  const [password, setPassword] = useState("");
  const [useMarkdown, setUseMarkdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // UI state
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  // Date constraints
  const minDate = new Date();
  minDate.setMinutes(minDate.getMinutes() + 5);

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!content) {
      toast.error("Please enter some text to share");
      setIsSubmitting(false);
      return;
    }

    if (content.length > 100000) {
      toast.error("Text is too long, maximum of 100,000 characters allowed");
      setIsSubmitting(false);
      return;
    }

    if (isProtected && !password) {
      toast.error("Password is required for protected texts");
      setIsSubmitting(false);
      return;
    }

    if (isProtected && password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      setIsSubmitting(false);
      return;
    }

    try {
      let expirationMinutes: number;
      switch (expiryTime) {
        case "5min":
          expirationMinutes = 5;
          break;
        case "1hour":
          expirationMinutes = 60;
          break;
        case "1day":
          expirationMinutes = 1440;
          break;
        case "1week":
          expirationMinutes = 10080;
          break;
        default:
          expirationMinutes = 60; // Default to 1 hour
      }

      // Generate an encryption key
      const encryptionKey = generateEncryptionKey();

      // Encrypt the content
      const encryptedContent = encryptText(content, encryptionKey);

      const textData = {
        content: encryptedContent,
        encryptionKey, // Include encryption key in the request
        expirationMinutes,
        maxViews: maxViews || undefined,
        viewOnce,
        isProtected: isProtected || undefined,
        password: isProtected ? password : undefined,
        isMarkdown: useMarkdown, // Always include isMarkdown flag, don't make it undefined
      };

      const response = await textApi.create(textData);
      const accessToken = response.data.data.accessToken;
      const shareUrl =
        response.data.data.shareUrl ||
        `${window.location.origin}/view/${accessToken}`;

      setGeneratedLink(shareUrl);
      toast.success("Text created successfully!");

      // Navigate to view page
      navigate(`/view/${accessToken}?new=true`);
    } catch (err: any) {
      console.error("Error creating text:", err);
      // Display a more helpful error message to the user
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("An error occurred. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
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
    setExpiryTime("1hour");
    setMaxViews(null);
    setViewOnce(false);
    setIsProtected(false);
    setPassword("");
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
                    <div className="flex items-center justify-between mb-2">
                      <label
                        htmlFor="content"
                        className="block text-sm font-medium text-foreground"
                      >
                        Text Content
                      </label>
                      {useMarkdown && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-1">
                          <FiCode className="inline" /> Markdown Enabled
                        </span>
                      )}
                    </div>
                    <textarea
                      id="content"
                      className={`w-full h-40 p-3 border border-input rounded-md bg-background text-foreground resize-y focus:outline-none focus:ring-2 focus:ring-primary/50 transition ${
                        useMarkdown ? "font-mono text-sm" : ""
                      }`}
                      placeholder={
                        useMarkdown
                          ? "# Heading\n\nWrite your **markdown** content here.\n\n- List item 1\n- List item 2\n\n`code block`"
                          : "Enter the text you want to share..."
                      }
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      required
                    />
                    {useMarkdown && content && (
                      <div className="mt-4 p-4 border border-border rounded-md bg-muted/30">
                        <p className="text-xs text-muted-foreground mb-2">
                          Preview:
                        </p>
                        <div className="prose dark:prose-invert max-w-none prose-sm prose-pre:bg-muted prose-pre:text-muted-foreground prose-code:bg-muted/70 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs">
                          {/* This is just a basic preview - the actual markdown rendering will be more sophisticated */}
                          {content.split("\n").map((line, i) => {
                            // Very basic markdown preview
                            if (line.startsWith("# ")) {
                              return (
                                <h1 key={i} className="text-lg font-bold">
                                  {line.substring(2)}
                                </h1>
                              );
                            } else if (line.startsWith("## ")) {
                              return (
                                <h2 key={i} className="text-md font-bold">
                                  {line.substring(3)}
                                </h2>
                              );
                            } else if (line.startsWith("- ")) {
                              return (
                                <div key={i} className="flex">
                                  <span className="mr-2">•</span>
                                  {line.substring(2)}
                                </div>
                              );
                            } else if (line.trim() === "") {
                              return <br key={i} />;
                            } else {
                              return <p key={i}>{line}</p>;
                            }
                          })}
                        </div>
                      </div>
                    )}

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
                          onClick={() => setExpiryTime("5min")}
                          className={`px-2 py-1 text-sm rounded-md border ${
                            expiryTime === "5min"
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-card border-input"
                          }`}
                        >
                          5 minutes
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpiryTime("1hour")}
                          className={`px-2 py-1 text-sm rounded-md border ${
                            expiryTime === "1hour"
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-card border-input"
                          }`}
                        >
                          1 hour
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpiryTime("1day")}
                          className={`px-2 py-1 text-sm rounded-md border ${
                            expiryTime === "1day"
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-card border-input"
                          }`}
                        >
                          1 day
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpiryTime("1week")}
                          className={`px-2 py-1 text-sm rounded-md border ${
                            expiryTime === "1week"
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-card border-input"
                          }`}
                        >
                          1 week
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setExpiryTime("custom")}
                        className={`w-full px-2 py-1 text-sm rounded-md border ${
                          expiryTime === "custom"
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card border-input"
                        }`}
                      >
                        Custom date/time
                      </button>

                      {expiryTime === "custom" && (
                        <div className="mt-2">
                          <DatePicker
                            selected={new Date()}
                            onChange={(date: Date) => {
                              // Handle date change
                            }}
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
                            <select
                              id="maxViews"
                              value={maxViews || ""}
                              onChange={(e) =>
                                setMaxViews(
                                  e.target.value ? Number(e.target.value) : null
                                )
                              }
                              className="w-full px-3 py-2 bg-background text-foreground border border-input rounded-md"
                            >
                              <option value="">No limit</option>
                              <option value="1">1 view</option>
                              <option value="5">5 views</option>
                              <option value="10">10 views</option>
                              <option value="25">25 views</option>
                              <option value="50">50 views</option>
                              <option value="100">100 views</option>
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center"
                    >
                      {isSubmitting ? (
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
