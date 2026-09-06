import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  language?: string;
  value: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code', err);
    }
  };

  const displayLang = (language || 'code').toUpperCase();

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 text-slate-100 shadow-md">
      {/* Code Header with language and copy button */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-400">
        <span className="font-mono font-semibold tracking-wider text-[11px] text-indigo-400">
          {displayLang}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="p-4 overflow-x-auto font-mono text-xs sm:text-sm leading-relaxed text-slate-200">
        <pre className="!m-0 !p-0 bg-transparent">
          <code>{value}</code>
        </pre>
      </div>
    </div>
  );
};

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="markdown-body space-y-3 text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');
            const isMultiline = codeString.includes('\n');

            if (match || isMultiline) {
              return (
                <CodeBlock
                  language={match ? match[1] : undefined}
                  value={codeString}
                />
              );
            }

            return (
              <code
                className="bg-slate-100 dark:bg-slate-750 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded font-mono text-xs font-medium border border-slate-200/60 dark:border-slate-700"
                {...props}
              >
                {children}
              </code>
            );
          },
          h1({ children }) {
            return <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-4 mb-2">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-3.5 mb-2">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-3 mb-1.5">{children}</h3>;
          },
          p({ children }) {
            return <p className="mb-2.5 last:mb-0 leading-relaxed text-slate-800 dark:text-slate-200">{children}</p>;
          },
          ul({ children }) {
            return <ul className="list-disc pl-5 my-2 space-y-1 text-slate-800 dark:text-slate-200">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal pl-5 my-2 space-y-1 text-slate-800 dark:text-slate-200">{children}</ol>;
          },
          li({ children }) {
            return <li className="leading-relaxed">{children}</li>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-indigo-500 pl-4 py-1 italic bg-indigo-50/50 dark:bg-indigo-950/40 rounded-r-lg text-slate-700 dark:text-slate-300 my-2.5">
                {children}
              </blockquote>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 text-left text-xs sm:text-sm">
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold">{children}</thead>;
          },
          tbody({ children }) {
            return <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-850">{children}</tbody>;
          },
          tr({ children }) {
            return <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-800/60 transition-colors">{children}</tr>;
          },
          th({ children }) {
            return <th className="px-3.5 py-2.5 font-semibold text-slate-800 dark:text-slate-200">{children}</th>;
          },
          td({ children }) {
            return <td className="px-3.5 py-2.5 text-slate-700 dark:text-slate-300">{children}</td>;
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
