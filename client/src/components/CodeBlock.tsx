import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  vscDarkPlus,
  vs,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { FiCopy, FiCheck } from "react-icons/fi";
import { useTheme } from "../utils/themeContext";

interface CodeBlockProps {
  children: string;
  language?: string;
  showLineNumbers?: boolean;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  children,
  language = "text",
  showLineNumbers = true,
}) => {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Detect if we're in mobile view
  const isMobile = window.innerWidth < 768;

  return (
    <div className="relative group rounded-md overflow-hidden my-4 text-sm">
      {/* Language badge */}
      {language !== "text" && (
        <div
          className={`
            absolute top-0 right-0 text-xs px-2 py-1 z-10 rounded-bl-md
            ${
              theme === "dark"
                ? "bg-gray-800 text-gray-300"
                : "bg-gray-200 text-gray-700"
            }
          `}
        >
          {language}
        </div>
      )}

      {/* Copy button */}
      <button
        onClick={copyToClipboard}
        className={`
          absolute top-0 right-0 m-2 p-1.5 rounded-md opacity-0 group-hover:opacity-100
          transition-opacity z-20
          ${
            theme === "dark"
              ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
          }
          ${copied ? "text-green-500" : ""}
          ${language !== "text" ? "mr-16" : ""}
        `}
        aria-label="Copy code"
      >
        {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
      </button>

      <SyntaxHighlighter
        language={language}
        style={theme === "dark" ? vscDarkPlus : vs}
        customStyle={{
          margin: 0,
          borderRadius: "0.375rem",
          fontSize: "0.875rem",
        }}
        showLineNumbers={showLineNumbers && !isMobile}
        wrapLongLines={isMobile}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;
