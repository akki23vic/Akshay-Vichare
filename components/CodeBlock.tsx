import React, { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CopyIcon, CheckIcon, LightbulbIcon } from './IconComponents';

interface CodeBlockProps {
  code: string;
  language: string;
  onExplain?: (code: string) => void;
}

const CopyButton: React.FC<{codeToCopy: string}> = ({ codeToCopy }) => {
    const [isCopied, setIsCopied] = useState(false);
    
    useEffect(() => {
      if (isCopied) {
        const timer = setTimeout(() => setIsCopied(false), 2000);
        return () => clearTimeout(timer);
      }
    }, [isCopied]);

    const handleCopy = () => {
        navigator.clipboard.writeText(codeToCopy).then(() => setIsCopied(true));
    };

    return (
        <button
            onClick={handleCopy}
            className="p-2 bg-gray-700/50 rounded-md text-gray-300 hover:bg-gray-600/50 hover:text-white transition"
            title="Copy code"
        >
            {isCopied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
        </button>
    );
}

const ExplainButton: React.FC<{onExplain: () => void}> = ({ onExplain }) => (
    <button
        onClick={onExplain}
        className="p-2 bg-gray-700/50 rounded-md text-gray-300 hover:bg-gray-600/50 hover:text-white transition"
        title="Explain this code"
    >
        <LightbulbIcon className="w-5 h-5" />
    </button>
);

const CodeWrapper: React.FC<{codeString: string; language: string; onExplain?: (code: string) => void;}> = ({codeString, language, onExplain}) => {
  return (
      <div className="relative group">
          <div className="bg-black/30 rounded-lg overflow-hidden border border-gray-500/20 shadow-[inset_0_1px_4px_rgba(0,0,0,0.3)]">
              <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={language}
                  PreTag="div"
                  customStyle={{ margin: 0, background: 'transparent' }}
                  codeTagProps={{className: 'font-mono'}}
              >
                  {codeString}
              </SyntaxHighlighter>
          </div>
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex items-center gap-1.5 transition-opacity">
              {onExplain && <ExplainButton onExplain={() => onExplain(codeString)} />}
              <CopyButton codeToCopy={codeString} />
          </div>
      </div>
  );
};

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language, onExplain }) => {
  if (language === 'markdown') {
    return (
        // FIX: Wrap ReactMarkdown in a div and move the className to it to avoid a type error
        // where className is not recognized as a valid prop on ReactMarkdown.
        <div className="prose prose-invert prose-sm sm:prose-base max-w-none prose-pre:bg-transparent prose-pre:p-0">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({node, ...props}) => <h1 style={{textShadow: '0 0 8px rgba(255,255,255,0.3)'}} {...props} />,
              h2: ({node, ...props}) => <h2 style={{textShadow: '0 0 8px rgba(255,255,255,0.3)'}} {...props} />,
              h3: ({node, ...props}) => <h3 style={{textShadow: '0 0 8px rgba(255,255,255,0.3)'}} {...props} />,
              // FIX: The `code` component renderer signature was causing type errors.
              // Destructuring props directly in the signature helps with type inference.
              code: ({ node, inline, className, children, ...props }) => {
                const match = /language-(\w+)/.exec(className || '');
                const lang = match ? match[1] : 'text';
                const codeString = String(children).replace(/\n$/, '');

                return !inline && match ? (
                  <div className="my-4">
                    <CodeWrapper codeString={codeString} language={lang} onExplain={onExplain} />
                  </div>
                ) : (
                  <code className="bg-primary-500/20 text-primary-300 rounded px-1.5 py-1 font-mono text-sm" {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {code}
          </ReactMarkdown>
        </div>
    );
  }

  return (
    <CodeWrapper codeString={code} language={language} onExplain={onExplain} />
  );
};

export default CodeBlock;