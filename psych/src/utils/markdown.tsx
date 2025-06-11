import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import React, { useState } from 'react';
import { FiCopy, FiCheck } from 'react-icons/fi';

// Export the renderer component for direct use in React components
export const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex, rehypeRaw]}
      components={{
        pre: ({ children }) => <>{children}</>,
        code({ node, inline, className, children, ...props }: any) {
          const [isCopied, setIsCopied] = useState(false);
          const match = /language-(\w+)/.exec(className || '');
          const codeString = String(children).replace(/\n$/, '');

          const handleCopy = () => {
            if (isCopied) return;
            navigator.clipboard.writeText(codeString).then(() => {
              setIsCopied(true);
              setTimeout(() => setIsCopied(false), 2000);
            });
          };

          const customSyntaxStyle = {
            ...vscDarkPlus,
            'pre[class*="language-"]': {
              ...vscDarkPlus['pre[class*="language-"]'],
              backgroundColor: 'transparent',
              background: 'transparent',
              padding: '0',
              margin: '0',
              overflow: 'visible',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
            },
          };

          return !inline && match ? (
            <div className="relative code-block-wrapper bg-gray-900 rounded-lg overflow-hidden my-4 border border-pink-200/30">
              <button
                onClick={handleCopy}
                className={`absolute top-2 right-2 z-10 px-3 py-1 text-xs rounded-md transition-all duration-200 flex items-center gap-1 ${
                  isCopied 
                    ? 'bg-green-500 text-white' 
                    : 'bg-pink-100 hover:bg-pink-200 text-pink-700 border border-pink-300'
                }`}
                title="Copy code"
              >
                {isCopied ? <FiCheck size={12} /> : <FiCopy size={12} />}
                {isCopied ? 'Copied!' : 'Copy'}
              </button>
              <SyntaxHighlighter
                style={customSyntaxStyle as any}
                language={match[1]}
                PreTag="pre"
                wrapLines={true}
                wrapLongLines={true}
                customStyle={{
                  padding: '1rem',
                  paddingTop: '2.5rem',
                  margin: 0,
                  background: 'transparent',
                }}
                {...props}
              >
                {codeString}
              </SyntaxHighlighter>
            </div>
          ) : (
            <code className={`${className} bg-pink-100/50 text-pink-800 px-1 py-0.5 rounded text-sm`} {...props}>
              {children}
            </code>
          );
        },
        table({node, className, children, ...props}) {
          return (
            <table className="table-auto w-full my-4 border-collapse border border-pink-200/30 rounded-lg overflow-hidden shadow-sm" {...props}>
              {children}
            </table>
          );
        },
        thead({node, className, children, ...props}) {
          return (
            <thead className="bg-pink-50/50" {...props}>
              {children}
            </thead>
          );
        },
        th({node, className, children, ...props}) {
          return (
            <th 
              className="px-4 py-3 text-left text-sm font-semibold text-pink-800 border-b border-pink-200/30"
              {...props}
            >
              {children}
            </th>
          );
        },
        td({node, className, children, ...props}) {
          return (
            <td className="px-4 py-3 text-sm text-gray-700 border-b border-pink-100/30" {...props}>
              {children}
            </td>
          );
        },
        a({node, className, children, ...props}) {
          return (
            <a 
              className="text-pink-600 hover:text-pink-700 underline decoration-pink-300 hover:decoration-pink-500" 
              target="_blank" 
              rel="noopener noreferrer" 
              {...props}
            >
              {children}
            </a>
          );
        },
        ul({node, className, children, depth, ...props}: any) {
          return (
            <ul className={`space-y-1 ${depth > 0 ? 'mt-2' : 'my-2'}`} {...props}>
              {children}
            </ul>
          );
        },
        ol({node, className, children, depth, ...props}: any) {
          return (
            <ol className={`space-y-1 ${depth > 0 ? 'mt-2' : 'my-2'}`} {...props}>
              {children}
            </ol>
          );
        },
        blockquote({node, className, children, ...props}) {
          return (
            <blockquote 
              className="border-l-4 border-pink-400 pl-4 py-2 my-4 text-gray-700 bg-pink-50/50 rounded-r-lg"
              {...props}
            >
              {children}
            </blockquote>
          );
        },
        img({node, className, ...props}) {
          return (
            <img 
              className="max-w-full h-auto rounded my-2" 
              {...props} 
              alt={props.alt || 'Image'} 
            />
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

// A simple function to check if content has markdown
export const hasMarkdown = (content: string): boolean => {
  const markdownPatterns = [
    /```[\s\S]*?```/,         // Code blocks
    /\[.*?\]\(.*?\)/,         // Links
    /\*\*.+?\*\*/,            // Bold
    /\*.+?\*/,                // Italic
    /^#+\s+/m,                // Headers
    /^[-*+]\s+/m,             // Unordered lists
    /^\d+\.\s+/m,             // Ordered lists
    /^>\s+/m,                 // Blockquotes
    /!\[.*?\]\(.*?\)/,        // Images
    /\|.+\|.+\|/,             // Tables
    /^---$/m,                 // Horizontal rules
    /`[^`]+`/                 // Inline code
  ];

  return markdownPatterns.some(pattern => pattern.test(content));
}; 