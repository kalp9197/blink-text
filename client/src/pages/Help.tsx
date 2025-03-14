import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FiCopy,
  FiCheck,
  FiCode,
  FiList,
  FiType,
  FiLink,
} from "react-icons/fi";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";

interface CodeExampleProps {
  code: string;
  language?: string;
  title?: string;
}

const CodeExample: React.FC<CodeExampleProps> = ({
  code,
  language = "markdown",
  title,
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mb-6 rounded-md overflow-hidden border border-border">
      {title && (
        <div className="px-4 py-2 bg-muted border-b border-border flex justify-between items-center">
          <span className="font-medium text-sm">{title}</span>
          <button
            onClick={copyToClipboard}
            className="text-muted-foreground hover:text-foreground"
            title="Copy to clipboard"
          >
            {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
          </button>
        </div>
      )}
      <SyntaxHighlighter
        language={language}
        style={atomOneDark}
        customStyle={{ margin: 0, padding: "1rem" }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

const markdownExamples = {
  headers: `# Heading 1
## Heading 2
### Heading 3`,

  emphasis: `**Bold text**
*Italic text*
~~Strikethrough~~`,

  lists: `- Item 1
- Item 2
  - Nested item
  - Another nested item
- Item 3

1. First item
2. Second item
3. Third item`,

  links: `[Link text](https://example.com)
![Image alt text](https://example.com/image.jpg)`,

  code: `Inline \`code\` in text

\`\`\`javascript
// Code block
function hello() {
  console.log("Hello world!");
}
\`\`\``,

  quote: `> This is a blockquote
> It can span multiple lines`,

  table: `| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |`,
};

const Help: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-3xl font-bold mb-6 text-center">
            Help & Documentation
          </h1>

          <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
            <p className="text-muted-foreground mb-4">
              BlinkText allows you to share text securely with expiration times,
              view limits, and password protection. Here's how to get started:
            </p>

            <ol className="list-decimal pl-5 space-y-2 mb-6">
              <li>Enter the text you want to share in the main text area</li>
              <li>
                Set an expiration time (from 5 minutes to 1 week, or a custom
                date)
              </li>
              <li>
                Choose security options:
                <ul className="list-disc pl-5 mt-1">
                  <li>
                    <strong>Delete after first view</strong> - Content will be
                    permanently deleted after being viewed once
                  </li>
                  <li>
                    <strong>Password protection</strong> - Require a password to
                    access the content
                  </li>
                  <li>
                    <strong>Maximum views</strong> - Limit how many times the
                    content can be viewed
                  </li>
                </ul>
              </li>
              <li>Click "Create Secure Text" to generate a shareable link</li>
              <li>Share the link with your recipient(s)</li>
            </ol>

            <div className="bg-muted/30 p-4 rounded-md border border-border">
              <p className="font-medium mb-2">🔒 Security Tips:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Use password protection for sensitive information</li>
                <li>Set short expiration times for highly sensitive data</li>
                <li>Consider using view limits to control access</li>
                <li>
                  Don't share the password in the same channel as the link
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <FiCode className="mr-2" />
              Markdown Support
            </h2>
            <p className="text-muted-foreground mb-4">
              BlinkText supports Markdown formatting for your text. Check the
              "Format as Markdown" option when creating your text to enable this
              feature. Here are some examples of Markdown syntax you can use:
            </p>

            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium mb-3 flex items-center">
                  <FiType className="mr-2" />
                  Headings and Text Formatting
                </h3>
                <CodeExample code={markdownExamples.headers} title="Headings" />
                <CodeExample
                  code={markdownExamples.emphasis}
                  title="Emphasis and Formatting"
                />
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3 flex items-center">
                  <FiList className="mr-2" />
                  Lists
                </h3>
                <CodeExample
                  code={markdownExamples.lists}
                  title="Bulleted and Numbered Lists"
                />
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3 flex items-center">
                  <FiLink className="mr-2" />
                  Links and Media
                </h3>
                <CodeExample
                  code={markdownExamples.links}
                  title="Links and Images"
                />
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3 flex items-center">
                  <FiCode className="mr-2" />
                  Code and Quotes
                </h3>
                <CodeExample code={markdownExamples.code} title="Code Blocks" />
                <CodeExample
                  code={markdownExamples.quote}
                  title="Blockquotes"
                />
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Tables</h3>
                <CodeExample
                  code={markdownExamples.table}
                  title="Markdown Tables"
                />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-sm border border-border p-6">
            <h2 className="text-2xl font-semibold mb-4">
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">
                  How secure is BlinkText?
                </h3>
                <p className="text-muted-foreground">
                  BlinkText encrypts your content in transit and at rest. We use
                  modern encryption standards to ensure your data remains
                  private. Links are generated with cryptographically secure
                  random tokens that cannot be guessed.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">
                  Can I edit my text after creating it?
                </h3>
                <p className="text-muted-foreground">
                  No, once a text is created, it cannot be edited. This is by
                  design to ensure the integrity of the shared content. If you
                  need to make changes, you'll need to create a new secure text.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">
                  Is there a size limit for text?
                </h3>
                <p className="text-muted-foreground">
                  Yes, there's a 100,000 character limit for each secure text.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">
                  What happens when a text expires?
                </h3>
                <p className="text-muted-foreground">
                  When a text expires, it is permanently deleted from our
                  servers and can no longer be accessed by anyone, even with the
                  correct link or password.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">
                  Can I see who viewed my text?
                </h3>
                <p className="text-muted-foreground">
                  For registered users, the dashboard shows how many times your
                  text has been viewed, but does not show the identity of
                  viewers for privacy reasons.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Help;
