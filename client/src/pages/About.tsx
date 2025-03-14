import React from "react";
import { motion } from "framer-motion";
import { FiLock, FiClock, FiEye, FiShield, FiCode } from "react-icons/fi";
import { Link } from "react-router-dom";

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-3xl font-bold mb-2 text-center">
            About BlinkText
          </h1>
          <p className="text-center text-muted-foreground mb-12">
            Secure text sharing for the modern web
          </p>

          <div className="bg-card rounded-lg shadow-sm border border-border p-8 mb-10">
            <h2 className="text-2xl font-semibold mb-6">Our Mission</h2>
            <p className="text-lg mb-6 text-muted-foreground">
              BlinkText was created with a simple goal: to make sharing
              sensitive information online safe, easy, and ephemeral. In a world
              where data often persists indefinitely, we believe you should have
              control over how long your shared content remains accessible.
            </p>
            <p className="text-lg text-muted-foreground">
              Whether you're sharing passwords, private notes, code snippets, or
              any sensitive text, BlinkText ensures your data is only accessible
              to intended recipients, for exactly as long as you want.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-card rounded-lg shadow-sm border border-border p-6">
              <div className="flex items-center mb-4">
                <div className="bg-primary/10 p-3 rounded-full mr-4">
                  <FiShield className="text-primary" size={24} />
                </div>
                <h3 className="text-xl font-semibold">
                  Privacy-First Approach
                </h3>
              </div>
              <p className="text-muted-foreground">
                We don't track or analyze the content you share. Your data is
                encrypted in transit and at rest, and we only store what's
                necessary for the service to function. Once your content
                expires, it's permanently deleted from our systems.
              </p>
            </div>

            <div className="bg-card rounded-lg shadow-sm border border-border p-6">
              <div className="flex items-center mb-4">
                <div className="bg-primary/10 p-3 rounded-full mr-4">
                  <FiCode className="text-primary" size={24} />
                </div>
                <h3 className="text-xl font-semibold">Built for Everyone</h3>
              </div>
              <p className="text-muted-foreground">
                BlinkText is designed for both casual users and professionals.
                Whether you're a developer sharing code snippets, an IT
                professional distributing credentials, or just someone who wants
                to share something privately, our tool adapts to your needs.
              </p>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-sm border border-border p-8 mb-10">
            <h2 className="text-2xl font-semibold mb-6">Key Features</h2>

            <div className="space-y-6">
              <div className="flex">
                <div className="mr-4">
                  <FiClock className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Auto-Expiring Content
                  </h3>
                  <p className="text-muted-foreground">
                    Set your content to expire after a specific time period,
                    from 5 minutes to a custom date up to 30 days in the future.
                    Once expired, the content is permanently deleted.
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="mr-4">
                  <FiEye className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">View Limits</h3>
                  <p className="text-muted-foreground">
                    Restrict how many times your content can be viewed. Set a
                    specific number of allowed views, or create "view-once"
                    content that self-destructs after a single view.
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="mr-4">
                  <FiLock className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Password Protection
                  </h3>
                  <p className="text-muted-foreground">
                    Add an additional layer of security with password
                    protection. Even if someone obtains the link, they'll need
                    the password to access the content.
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="mr-4">
                  <FiCode className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Markdown & Syntax Highlighting
                  </h3>
                  <p className="text-muted-foreground">
                    Format your text with Markdown or share code with syntax
                    highlighting for better readability. BlinkText automatically
                    detects code languages or allows you to specify the language
                    manually.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-muted/30 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">
              Ready to try BlinkText?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Start sharing your text securely with just a few clicks. No
              registration required for basic use, or create an account to
              manage your shared texts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Get Started
              </Link>
              <Link
                to="/help"
                className="px-6 py-3 bg-muted-foreground/10 text-foreground rounded-md hover:bg-muted-foreground/20"
              >
                View Documentation
              </Link>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default About;
